import './polyfills';
import * as path from 'path';
import waterfall from 'p-waterfall';
import { rollup, watch } from 'rollup';
import {lodash, readPkg, configLoader, chalk} from '@walrus/shared-utils';
import {
  Config,
  Options,
  Format,
  NormalizedConfig,
  RunContext,
  RollupConfig,
  ConfigEntryObject
} from '@pansy/types';
import logger from './logger';
import createRollupConfig from './utils/create-rollup-config';
import spinner from './spinner';

export interface Asset {
  absolute: string;
  source: string;
}
export type Assets = Map<string, Asset>;

interface RunOptions {
  write?: boolean;
  watch?: boolean;
  concurrent?: boolean;
}

export interface Task {
  title: string;
  getConfig(context: RunContext, task: Task): Promise<RollupConfig>;
}

class Builder {
  // 项目根目录
  public rootDir: string;
  // 配置文件路径
  public configPath?: string;
  // 配置
  public config: NormalizedConfig;
  // package.json
  public pkg: readPkg.PackageJson;
  public bundles: Set<Assets>;

  constructor(config: Config, public options: Options = {}) {
    // 设置日志输出级别
    logger.setOptions({ logLevel: options.logLevel });

    this.rootDir = path.resolve(options.rootDir || '.');

    this.pkg = readPkg.sync({
      cwd: this.rootDir
    });

    if (/\.mjs$/.test(this.pkg.module || this.pkg.main || '')) {
      logger.warn(`Pansy no longer use .mjs extension for esm bundle, you should use .js instead!`);
    }

    // 获取用户配置
    const userConfig =
      options.configFile === false
        ? {}
        : configLoader.loadSync({
            files:
              typeof options.configFile === 'string'
                ? [options.configFile]
                : ['pansy.config.js', 'pansy.config.ts', 'package.json'],
            cwd: this.rootDir,
            packageKey: 'pansy'
          });

    if (userConfig.path) {
      this.configPath = userConfig.path;
    }

    this.config = this.normalizeConfig(config, userConfig.data || {}) as NormalizedConfig;

    this.bundles = new Set();
  }

  /**
   * 规范配置
   * @param config 命令行以及默认配置
   * @param userConfig 用户配置
   */
  normalizeConfig = (config: Config, userConfig: Config) => {
    const result = lodash.merge({}, userConfig, config, {
      input: config.input || userConfig.input || 'src/index.js',
      output: lodash.merge({}, userConfig.output, config.output),
      plugins: lodash.merge({}, userConfig.plugins, config.plugins),
      babel: lodash.merge(
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

    result.output.dir = path.resolve(result.output.dir || 'dist');

    return result;
  };

  resolveRootDir(...args: string[]) {
    return path.resolve(this.rootDir, ...args);
  }

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
        return input.map((v) => `./${path.relative(this.rootDir, this.resolveRootDir(v))}`);
      }
      return Object.keys(input).reduce((res: ConfigEntryObject, entryName: string) => {
        res[entryName] = `./${path.relative(this.rootDir, this.resolveRootDir(input[entryName]))}`;
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
              ? this.config.extendConfig(lodash.merge({}, this.config), {
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
      console.error(chalk.bold(chalk.red('Stack Trace:')))
      console.error(chalk.dim(err.stack))
    }
  }
}

export default Builder;
