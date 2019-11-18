import './polyfills';
import { resolve, relative } from 'path';
import { chalk as colors, configLoader, lodash } from '@walrus/shared-utils';
import resolveFrom from 'resolve-from';
import { rollup, watch } from 'rollup';
import waterfall from 'p-waterfall';
import spinner from './spinner';
import logger from './logger';
import { Assets, getExistFile } from './utils';
import {
  Options,
  Config,
  NormalizedConfig,
  Format,
  ConfigEntryObject,
  ConfigOutput,
  RunContext,
  Task
} from './types';
import createRollupConfig from './create-rollup-config';
import { DEFAULT_CONFIG_FILE, DEFAULT_INPUT_FILE } from './config';

// Make rollup-plugin-vue use basename in component.__file instead of absolute path
// TODO: PR to rollup-plugin-vue to allow this as an API option
process.env.BUILD = 'production';

interface RunOptions {
  write?: boolean;
  watch?: boolean;
  concurrent?: boolean;
}

const merge = lodash.merge;

export class Bundler {
  rootDir: string;
  config: NormalizedConfig;
  configPath?: string;
  pkg: {
    path?: string;
    data?: any;
  };
  bundles: Set<Assets>;

  constructor(config: Config, public options: Options = {}) {
    logger.setOptions({ logLevel: options.logLevel });

    this.rootDir = resolve(options.rootDir || '.');

    this.pkg = configLoader.loadSync({
      files: ['package.json'],
      cwd: this.rootDir
    });
    if (!this.pkg.data) {
      this.pkg.data = {};
    }

    if (/\.mjs$/.test(this.pkg.data.module || this.pkg.data.main)) {
      logger.warn(`Pansy no longer use .mjs extension for esm bundle, you should use .js instead!`);
    }

    const userConfig =
      options.configFile === false
        ? {}
        : configLoader.loadSync({
            files:
              typeof options.configFile === 'string' ? [options.configFile] : DEFAULT_CONFIG_FILE,
            cwd: this.rootDir,
            packageKey: 'pansy'
          });
    if (userConfig.path) {
      logger.debug(`Using config file:`, userConfig.path);
      this.configPath = userConfig.path;
    }

    this.config = this.normalizeConfig(config, userConfig.data || {}) as NormalizedConfig;

    this.bundles = new Set();
  }

  normalizeConfig = (config: Config, userConfig: Config) => {
    // 默认输入文件
    const entry = getExistFile({
      cwd: this.rootDir,
      files: DEFAULT_INPUT_FILE,
      returnRelative: true
    });

    const result = merge({}, userConfig, config, {
      input: config.input || userConfig.input || entry || 'src/index.js',
      output: merge({}, userConfig.output, config.output),
      plugins: merge({}, userConfig.plugins, config.plugins),
      babel: merge(
        {
          asyncToPromises: true
        },
        userConfig.babel,
        config.babel
      ),
      externals: [
        ...(Array.isArray(userConfig.externals) ? userConfig.externals : [userConfig.externals]),
        ...(Array.isArray(config.externals) ? config.externals : [config.externals])
      ]
    });

    result.output.dir = resolve(result.output.dir || 'dist');

    return result;
  };

  async run(options: RunOptions = {}) {
    const context: RunContext = {
      unresolved: new Set()
    };
    const tasks: Task[] = [];

    let { input } = this.config;

    if (!Array.isArray(input)) {
      input = [input || 'src/index.js'];
    }
    if (Array.isArray(input) && input.length === 0) {
      input = ['src/index.js'];
    }

    const getMeta = (files: string[]) => {
      return {
        hasVue: files.some((file) => file.endsWith('.vue')),
        hasTs: files.some((file) => /\.tsx?$/.test(file))
      };
    };

    const normalizeInputValue = (input: string[] | ConfigEntryObject) => {
      if (Array.isArray(input)) {
        return input.map((v) => `./${relative(this.rootDir, this.resolveRootDir(v))}`);
      }
      return Object.keys(input).reduce((res: ConfigEntryObject, entryName: string) => {
        res[entryName] = `./${relative(this.rootDir, this.resolveRootDir(input[entryName]))}`;
        return res;
      }, {});
    };

    const sources = input.map((v) => {
      if (typeof v === 'string') {
        const files = v.split(',');
        return {
          files,
          input: normalizeInputValue(files),
          ...getMeta(files)
        };
      }
      const files = Object.values(v);
      return {
        files,
        input: normalizeInputValue(v),
        ...getMeta(files)
      };
    });

    let { format, target } = this.config.output;
    if (Array.isArray(format)) {
      if (format.length === 0) {
        format = ['cjs'];
      }
    } else if (typeof format === 'string') {
      format = format.split(',') as Format[];
    } else {
      format = ['cjs'];
    }
    const formats = format;

    for (const source of sources) {
      for (const format of formats) {
        let title = `Bundle ${source.files.join(', ')} in ${format} format`;
        if (target) {
          title += ` for target ${target}`;
        }
        tasks.push({
          title,
          getConfig: async (context, task) => {
            const assets: Assets = new Map();
            this.bundles.add(assets);
            const config = this.config.extendConfig
              ? this.config.extendConfig(merge({}, this.config), {
                  input: source.input,
                  format
                })
              : this.config;
            const rollupConfig = await createRollupConfig(this.rootDir, this.pkg, {
              source,
              format,
              title: task.title,
              context,
              assets,
              config
            });
            return this.config.extendRollupConfig
              ? this.config.extendRollupConfig(rollupConfig)
              : rollupConfig;
          }
        });
      }
    }

    if (options.watch) {
      const configs = await Promise.all(
        tasks.map(async (task) => {
          const { inputConfig, outputConfig } = await task.getConfig(context, task);
          return {
            ...inputConfig,
            output: outputConfig,
            watch: {}
          };
        })
      );
      const watcher = watch(configs);
      watcher.on('event', (e) => {
        if (e.code === 'ERROR') {
          logger.error(e.error.message);
        }
      });
    } else {
      try {
        if (options.concurrent) {
          await Promise.all(
            tasks.map((task) => {
              return this.build(task, context, options.write);
            })
          );
        } else {
          await waterfall(
            tasks.map((task) => () => {
              return this.build(task, context, options.write);
            }),
            context
          );
        }
      } catch (err) {
        spinner.stop();
        throw err;
      }
    }

    return this;
  }

  async build(task: Task, context: RunContext, write?: boolean) {
    try {
      const { inputConfig, outputConfig } = await task.getConfig(context, task);
      const bundle = await rollup(inputConfig);
      if (write) {
        await bundle.write(outputConfig);
      } else {
        await bundle.generate(outputConfig);
      }
    } catch (err) {
      err.rollup = true;
      logger.error(task.title.replace('Bundle', 'Failed to bundle'));
      if (err.message.includes('You must supply output.name for UMD bundles')) {
        err.code = 'require_module_name';
        err.message = `You must supply output.moduleName option or use --module-name <name> flag for UMD bundles`;
      }
      throw err;
    }
  }

  handleError = (err: any) => {
    if (err.stack) {
      console.error();
      console.error(colors.bold(colors.red('Stack Trace:')));
      console.error(colors.dim(err.stack));
    }
  };

  resolveRootDir = (...args: string[]) => {
    return resolve(this.rootDir, ...args);
  };

  localRequire(name: string, { silent, cwd }: { silent?: boolean; cwd?: string } = {}) {
    cwd = cwd || this.rootDir;
    const resolved = silent ? resolveFrom.silent(cwd, name) : resolveFrom(cwd, name);
    return resolved && require(resolved);
  }

  getBundle(index: number) {
    return [...this.bundles][index];
  }
}

export { Config, NormalizedConfig, Options, ConfigOutput };
