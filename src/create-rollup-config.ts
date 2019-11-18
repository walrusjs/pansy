import { ModuleFormat, Plugin as RollupPlugin, } from 'rollup';
import { resolve, extname, relative } from 'path';
import resolveFrom from 'resolve-from';
import formatTime from 'pretty-ms';
import { lodash, chalk as colors } from '@walrus/shared-utils';
import isExternal from './utils/is-external';
import getBanner from './utils/get-banner';
import progressPlugin from './plugins/progress';
import logger from './logger';
import nodeResolvePlugin from './plugins/node-resolve';
import { getDefaultFileName, printAssets, Assets } from './utils';
import {
  NormalizedConfig,
  Format,
  Env,
  RollupConfig,
  ConfigEntryObject,
  RunContext
} from './types';

interface RollupConfigInput {
  source: {
    input: string[] | ConfigEntryObject;
    files: string[];
    hasVue: boolean;
    hasTs: boolean;
  };
  title: string;
  format: Format;
  context: RunContext;
  assets: Assets;
  config: NormalizedConfig;
}

type PluginFactory = (opts: any) => RollupPlugin;
type GetPlugin = (name: string) => PluginFactory | Promise<PluginFactory>;

let rootDir: string = '';

const merge = lodash.merge;
function localRequire(
  name: string,
  { silent, cwd }: { silent?: boolean; cwd?: string } = {}
) {
  cwd = cwd || rootDir;
  const resolved = silent ? resolveFrom.silent(cwd, name) : resolveFrom(cwd, name);
  return resolved && require(resolved);
}

export default async function createRollupConfig(
  dir: string,
  pkg: {
    path?: string;
    data?: any;
  },
  opts: RollupConfigInput
): Promise<RollupConfig> {
  const { source, format, title, context, assets, config } = opts;
  rootDir = dir;
  // 检查config.minify是否为真，否则按format进行推断
  const minify = config.output.minify === undefined ? format.endsWith('-min') : config.output.minify;

  let minPlaceholder = '';
  let rollupFormat: ModuleFormat;

  if (format.endsWith('-min')) {
    rollupFormat = format.replace(/-min$/, '') as ModuleFormat;
    minPlaceholder = '.min';
  } else {
    rollupFormat = format as ModuleFormat;
  }

  // UMD格式应始终捆绑node_modules
  const bundleNodeModules = rollupFormat === 'umd' || rollupFormat === 'iife' || config.bundleNodeModules;

  const resolveRootDir = (...args: string[]) => {
    return resolve(rootDir, ...args);
  };

  const pluginsOptions: { [key: string]: any } = {
    progress:
        config.plugins.progress !== false &&
        merge(
          {
            title
          },
          config.plugins.progress
        ),

    url: config.plugins.url !== false && merge({}, config.plugins.url),

    '@svgr/rollup': config.plugins[`'@svgr/rollup'`] !== false && merge({}, config.plugins[`@svgr/rollup`]),

    json: config.plugins.json !== false && merge({}, config.plugins.json),

    hashbang: config.plugins.hashbang !== false && merge({}, config.plugins.hashbang),

    'node-resolve':
        config.plugins['node-resolve'] !== false &&
        merge(
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
      merge(
        {
          extract: config.output.extractCSS
        },
        config.plugins.postcss
      ),

    vue:
      (source.hasVue || config.plugins.vue) &&
      merge(
        {
          css: false
        },
        config.plugins.vue
      ),

    typescript2:
      (source.hasTs || config.plugins.typescript2) &&
      merge(
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
      merge(
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
      merge(
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

    // 默认关闭，可手动开启 - 删除调试信息
    strip:
      config.plugins.strip &&
      merge(
        {
          functions: ['console.log']
        },
        config.plugins.strip
      ),

    alias:
      config.plugins.alias !== false &&
      merge(
        {
          entries: {
            '@': resolveRootDir('src')
          }
        },
        config.plugins.postcss
      ),

    commonjs:
      config.plugins.commonjs !== false &&
      merge({}, config.plugins.commonjs, {
        // `ignore` is required to allow dynamic require
        // See: https://github.com/rollup/rollup-plugin-commonjs/blob/4a22147456b1092dd565074dc33a63121675102a/src/index.js#L32
        ignore: (name: string) => {
          const { commonjs } = config.plugins;
          if (commonjs && commonjs.ignore && commonjs.ignore(name)) {
            return true;
          }
          return isExternal(config.externals, name);
        }
      })
  };

  const env = Object.assign({}, config.env);

  pluginsOptions.replace = {
    ...config.plugins.replace,
    values: {
      ...Object.keys(env).reduce((res: Env, name) => {
        res[`process.env.${name}`] = JSON.stringify(env[name]);
        return res;
      }, {}),
      ...(config.plugins.replace && config.plugins.replace.values)
    }
  };

  if (Object.keys(pluginsOptions.replace.values).length === 0) {
    pluginsOptions.replace = false;
  }

  const banner = getBanner(config.banner, pkg.data);

  if (minify) {
    const terserOptions = config.plugins.terser || {};
    pluginsOptions.terser = {
      ...terserOptions,
      output: {
        ...terserOptions.output,
        // Add banner (if there is)
        preamble: banner
      }
    };
  }

  for (const name of Object.keys(config.plugins)) {
    if (pluginsOptions[name] === undefined) {
      Object.assign(pluginsOptions, { [name]: config.plugins[name] });
    }
  }

  const getPlugin: GetPlugin = (name: string) => {
    if (config.resolvePlugins && config.resolvePlugins[name]) {
      return config.resolvePlugins[name];
    }

    // 是否是@rollup/plugin-*形式的内置包
    const isOfficialBuiltIn = require('../package').dependencies[`@rollup/plugin-${name}`];

    // 是否是rollup-plugin-*形式的内置包
    const isBuiltIn = require('../package').dependencies[`rollup-plugin-${name}`];

    const plugin =
      name === 'babel'
        ? import('./plugins/babel').then((res) => res.default)
        : name === 'node-resolve'
        ? nodeResolvePlugin
        : name === 'progress'
        ? progressPlugin
        : isOfficialBuiltIn
        ? require(`@rollup/plugin-${name}`)
        : isBuiltIn
        ? require(`rollup-plugin-${name}`)
        : name === '@svgr/rollup'
        ? require('@svgr/rollup')
        : localRequire(`rollup-plugin-${name}`);

    if (name === 'terser') {
      return plugin.terser;
    }

    return plugin.default || plugin;
  };

  const plugins = await Promise.all(
    Object.keys(pluginsOptions)
      .filter((name) => pluginsOptions[name])
      .map(async (name) => {
        const options = pluginsOptions[name] === true ? {} : pluginsOptions[name];
        const plugin = await getPlugin(name);
        return plugin(options);
      })
  );

  if (logger.isDebug) {
    for (const name of Object.keys(pluginsOptions)) {
      if (pluginsOptions[name]) {
        logger.debug(colors.dim(format), `Using plugin: ${name}`);
      }
    }
  }

  // Add bundle to out assets Map
  // So that we can log the stats when all builds completed
  // Make sure this is the last plugin!
  let startTime: number;
  let endTime: number;
  plugins.push({
    name: 'record-bundle',
    generateBundle(outputOptions, _assets) {
      const EXTS = [
        outputOptions.entryFileNames ? extname(outputOptions.entryFileNames) : '.js',
        '.css'
      ];
      for (const fileName of Object.keys(_assets)) {
        if (EXTS.some((ext) => fileName.endsWith(ext))) {
          const file: any = _assets[fileName];
          const absolute = outputOptions.dir && resolve(outputOptions.dir, fileName);
          if (absolute) {
            assets.set(relative(process.cwd(), absolute), {
              absolute,
              get source() {
                return file.isAsset ? file.source.toString() : file.code;
              }
            });
          }
        }
      }
    },
    buildStart() {
      startTime = Date.now();
    },
    buildEnd() {
      endTime = Date.now();
    },
    async writeBundle() {
      await printAssets(
        assets,
        `${title.replace('Bundle', 'Bundled')} ${colors.dim(
          `(${formatTime(endTime - startTime)})`
        )}`
      );
    }
  });

  const defaultFileName = getDefaultFileName(rollupFormat);
  const getFileName = config.output.fileName || defaultFileName;
  const fileNameTemplate =
    typeof getFileName === 'function'
      ? getFileName({ format: rollupFormat, minify }, defaultFileName)
      : getFileName;
  const fileName = fileNameTemplate
    .replace(/\[min\]/, minPlaceholder)
    // The `[ext]` placeholder no longer makes sense
    // Since we only output to `.js` now
    // Probably remove it in the future
    .replace(/\[ext\]/, '.js');

  return {
    inputConfig: {
      input: source.input,
      plugins,
      external: Object.keys(config.globals || {}).filter((v) => !/^[\.\/]/.test(v)),
      onwarn(warning: any) {
        if (typeof warning === 'string') {
          return logger.warn(warning);
        }
        const code = (warning.code || '').toLowerCase();
        if (code === 'mixed_exports' || code === 'missing_global_name') {
          return;
        }
        let message = warning.message;
        if (code === 'unresolved_import' && warning.source) {
          if (format !== 'umd' || context.unresolved.has(warning.source)) {
            return;
          }
          context.unresolved.add(warning.source);
          message = `${warning.source} is treated as external dependency`;
        }
      }
    },
    outputConfig: {
      globals: config.globals,
      format: rollupFormat,
      dir: resolve(config.output.dir || 'dist'),
      entryFileNames: fileName,
      name: config.output.moduleName,
      banner,
      sourcemap: typeof config.output.sourceMap === 'boolean' ? config.output.sourceMap : minify,
      sourcemapExcludeSources: config.output.sourceMapExcludeSources
    }
  }
}