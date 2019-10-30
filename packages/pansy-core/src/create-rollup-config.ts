import path from 'path';
import {
  lodash,
  readPkg,
  chalk
} from '@walrus/shared-utils';
import {
  Env,
  NormalizedConfig,
  Format,
  ConfigEntryObject,
  RunContext,
  RollupConfig
} from '@pansy/types';
import {
  Plugin as RollupPlugin,
  ModuleFormat as RollupFormat
} from 'rollup';
import resolveFrom from 'resolve-from';
import prettyBytes from 'pretty-bytes';
import formatTime from 'pretty-ms';
import boxen from 'boxen';
import stringWidth from 'string-width';
import textTable from 'text-table';
import nodeResolvePlugin from './plugins/node-resolve';
import progressPlugin from './plugins/progress';
import isExternal from './utils/is-external';
import getBanner from './utils/get-banner';
import { Assets, Asset } from './';
import logger from './logger';
import { getDefaultFileName } from './utils';

type PluginFactory = (opts: any) => RollupPlugin;
type GetPlugin = (name: string) => PluginFactory | Promise<PluginFactory>;

interface RollupConfigInput {
  source: {
    input: string[] | ConfigEntryObject
    files: string[]
    hasVue: boolean
    hasTs: boolean
  }
  title: string
  format: Format
  context: RunContext
  assets: Assets
  config: NormalizedConfig
}

function localRequire(
  rootDir: string,
  name: string,
  { silent, cwd }: { silent?: boolean; cwd?: string } = {}
) {
  cwd = cwd || rootDir;
  const resolved = silent
    ? resolveFrom.silent(cwd, name)
    : resolveFrom(cwd, name);
  return resolved && require(resolved)
}

async function printAssets(assets: Assets, title: string) {
  const gzipSize = await import('gzip-size').then(res => res.default);
  const table = await Promise.all(
    [...assets.keys()].map(async relative => {
      const asset = assets.get(relative) as Asset
      const size = asset.source.length
      return [
        chalk.green(relative),
        prettyBytes(size),
        prettyBytes(await gzipSize(asset.source))
      ]
    })
  );
  table.unshift(['File', 'Size', 'Gzipped'].map(v => chalk.dim(v)));
  logger.success(title);
  logger.log(
    boxen(
      textTable(table, {
        stringLength: stringWidth
      })
    )
  )
}

export default async (
  rootDir: string,
  pkg: readPkg.PackageJson,
  rollupConfigInput: RollupConfigInput
): Promise<RollupConfig> => {
  const { source, format, title, context, assets, config } = rollupConfigInput;

  const minify =
    config.output.minify === undefined
      ? format.endsWith('-min')
      : config.output.minify;

  let minPlaceholder = '';
  let rollupFormat: RollupFormat;

  if (format.endsWith('-min')) {
    rollupFormat = format.replace(/-min$/, '') as RollupFormat;
    minPlaceholder = '.min'
  } else {
    rollupFormat = format as RollupFormat
  }

  const bundleNodeModules =
    rollupFormat === 'umd' ||
    rollupFormat === 'iife' ||
    config.bundleNodeModules;

  const pluginsOptions: { [key: string]: any } = {
    progress:
      config.plugins.progress !== false &&
      lodash.merge(
        {
          title
        },
        config.plugins.progress
      ),

    json: config.plugins.json !== false && lodash.merge({}, config.plugins.json),

    hashbang:
      config.plugins.hashbang !== false && lodash.merge({}, config.plugins.hashbang),

    'node-resolve':
      config.plugins['node-resolve'] !== false &&
      lodash.merge(
        {},
        {
          rootDir,
          bundleNodeModules,
          externals: config.externals,
          browser: config.output.target === 'browser'
        },
        config.plugins['node-resolve']
      ),

    postcss:
      config.plugins.postcss !== false &&
      lodash.merge(
        {
          extract: config.output.extractCSS !== false
        },
        config.plugins.postcss
      ),

    vue:
      (source.hasVue || config.plugins.vue) &&
      lodash.merge(
        {
          css: false
        },
        config.plugins.vue
      ),

    typescript2:
      (source.hasTs || config.plugins.typescript2) &&
      lodash.merge(
        {
          objectHashIgnoreUnknownHack: true,
          tsconfigOverride: {
            compilerOptions: {
              module: 'esnext'
            }
          }
        },
        config.plugins.typescript2
      ),

    babel:
      config.plugins.babel !== false &&
      lodash.merge(
        {
          exclude: 'node_modules/**',
          extensions: ['.js', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
          babelrc: config.babel.babelrc,
          configFile: config.babel.configFile,
          presetOptions: config.babel
        },
        config.plugins.babel
      ),

    buble:
      (config.plugins.buble || config.babel.minimal) &&
      lodash.merge(
        {
          exclude: 'node_modules/**',
          include: '**/*.{js,mjs,jsx,ts,tsx,vue}',
          transforms: {
            modules: false,
            dangerousForOf: true,
            dangerousTaggedTemplateString: true
          }
        },
        config.plugins.buble
      ),

    commonjs:
      config.plugins.commonjs !== false &&
      lodash.merge({}, config.plugins.commonjs, {
        // `ignore` is required to allow dynamic require
        // See: https://github.com/rollup/rollup-plugin-commonjs/blob/4a22147456b1092dd565074dc33a63121675102a/src/index.js#L32
        ignore: (name: string) => {
          const { commonjs } = config.plugins
          if (commonjs && commonjs.ignore && commonjs.ignore(name)) {
            return true
          }
          return isExternal(config.externals, name)
        }
      })
  };

  const env = Object.assign({}, config.env);

  pluginsOptions.replace = {
    ...config.plugins.replace,
    values: {
      ...Object.keys(env).reduce((res: Env, name) => {
        res[`process.env.${name}`] = JSON.stringify(env[name]);
        return res
      }, {}),
      ...(config.plugins.replace && config.plugins.replace.values)
    }
  };

  if (Object.keys(pluginsOptions.replace.values).length === 0) {
    pluginsOptions.replace = false
  }

  const banner = getBanner(config.banner, pkg);

  if (minify) {
    const terserOptions = config.plugins.terser || {};
    pluginsOptions.terser = {
      ...terserOptions,
      output: {
        ...terserOptions.output,
        // Add banner (if there is)
        preamble: banner
      }
    }
  }

  for (const name of Object.keys(config.plugins)) {
    if (pluginsOptions[name] === undefined) {
      Object.assign(pluginsOptions, { [name]: config.plugins[name] })
    }
  }

  const getPlugin: GetPlugin = (name: string) => {
    if (config.resolvePlugins && config.resolvePlugins[name]) {
      return config.resolvePlugins[name]
    }

    const isBuiltIn = require('../package').dependencies[
      `rollup-plugin-${name}`
      ];

    const plugin =
      name === 'babel'
        ? import('./plugins/babel').then(res => res.default)
        : name === 'node-resolve'
        ? nodeResolvePlugin
        : name === 'progress'
          ? progressPlugin
          : isBuiltIn
            ? require(`rollup-plugin-${name}`)
            : localRequire(rootDir,`rollup-plugin-${name}`);

    if (name === 'terser') {
      return plugin.terser
    }

    return plugin.default || plugin
  };

  const plugins = await Promise.all(
    Object.keys(pluginsOptions)
      .filter(name => pluginsOptions[name])
      .map(async name => {
        const options =
          pluginsOptions[name] === true ? {} : pluginsOptions[name]
        const plugin = await getPlugin(name)
        return plugin(options)
      })
  );

  let startTime: number;
  let endTime: number;
  plugins.push({
    name: 'record-bundle',
    generateBundle(outputOptions, _assets) {
      const EXTS = [
        outputOptions.entryFileNames
          ? path.extname(outputOptions.entryFileNames)
          : '.js',
        '.css'
      ];
      for (const fileName of Object.keys(_assets)) {
        if (EXTS.some(ext => fileName.endsWith(ext))) {
          const file: any = _assets[fileName]
          const absolute =
            outputOptions.dir && path.resolve(outputOptions.dir, fileName);
          if (absolute) {
            const relative = path.relative(process.cwd(), absolute)
            assets.set(relative, {
              absolute,
              get source() {
                return file.isAsset ? file.source.toString() : file.code
              }
            })
          }
        }
      }
    },
    buildStart() {
      startTime = Date.now()
    },
    buildEnd() {
      endTime = Date.now()
    },
    async writeBundle() {
      await printAssets(
        assets,
        `${title.replace('Bundle', 'Bundled')} ${chalk.dim(
          `(${formatTime(endTime - startTime)})`
        )}`
      )
    }
  });

  const defaultFileName = getDefaultFileName(rollupFormat)
  const getFileName = config.output.fileName || defaultFileName
  const fileNameTemplate =
    typeof getFileName === 'function'
      ? getFileName({ format: rollupFormat, minify }, defaultFileName)
      : getFileName
  const fileName = fileNameTemplate
    .replace(/\[min\]/, minPlaceholder)
    // The `[ext]` placeholder no longer makes sense
    // Since we only output to `.js` now
    // Probably remove it in the future
    .replace(/\[ext\]/, '.js')

  return {
    inputConfig: {
      input: source.input,
      plugins,
      external: Object.keys(config.globals || {}).filter(
        v => !/^[\.\/]/.test(v)
      ),
      onwarn(warning) {
        if (typeof warning === 'string') {
          return logger.warn(warning)
        }
        const code = (warning.code || '').toLowerCase()
        if (code === 'mixed_exports' || code === 'missing_global_name') {
          return
        }
        let message = warning.message
        if (code === 'unresolved_import' && warning.source) {
          if (format !== 'umd' || context.unresolved.has(warning.source)) {
            return
          }
          context.unresolved.add(warning.source)
          message = `${warning.source} is treated as external dependency`
        }
        logger.warn(
          `${chalk.yellow(`${code}`)}${chalk.dim(':')} ${message}`
        )
      }
    },
    outputConfig: {
      globals: config.globals,
      format: rollupFormat,
      dir: path.resolve(config.output.dir || 'dist'),
      entryFileNames: fileName,
      name: config.output.moduleName,
      banner,
      sourcemap:
        typeof config.output.sourceMap === 'boolean'
          ? config.output.sourceMap
          : minify,
      sourcemapExcludeSources: config.output.sourceMapExcludeSources
    }
  }
}
