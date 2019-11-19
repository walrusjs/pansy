import signale from 'signale';
import { join } from 'path';
import isString from '@pansy/is-string';
import isArray from '@pansy/is-array';
import isObject from '@pansy/is-object';
import { existsSync } from 'fs';
import { chalk } from '@walrus/shared-utils';
import { isTypescriptFile } from './';
import { NormalizedConfig } from '../types';

export default function(config: NormalizedConfig, rootDir: string) {
  const { output, input } = config;

  if (output && output.format) {
    // 检验 cjs、commonjs是否重复设置
    if (output.format.indexOf('cjs') !== -1 && output.format.indexOf('commonjs') !== -1) {
      signale.warn(`${chalk.cyan('cjs')} and ${chalk.cyan('commonjs')} only need to set one`);
    }
    // 检验 es、esm是否重复设置
    if (output.format.indexOf('es') !== -1 && output.format.indexOf('esm') !== -1) {
      signale.warn(`${chalk.cyan('es')} and ${chalk.cyan('esm')} only need to set one`);
    }

    // umd格式必须制定output.name
    if (output.format.indexOf('umd') !== -1) {
      throw new Error(`${chalk.cyan('umd')} format must be set ${chalk.cyan('output.name')}`);
    }
  }

  const tsConfigPath = join(rootDir, 'tsconfig.json');
  const tsConfig = existsSync(tsConfigPath);

  let inputs: string[] = [];

  //  解析入口文件为数组
  if (input) {
    if (isString(input)) {
      inputs = [input];
    }
    if (isObject(input)) {
      Object.keys(input).forEach(key => {
        // @ts-ignore
        inputs.push(input[key]);
      })
    }
    if (isArray(config.input)) {
      inputs = config.input as string[];
    }
  }

  // ts项目没有配置tsconfig.json
  if (!tsConfig && inputs.some(isTypescriptFile as any)) {
    signale.info(
      `Project using ${chalk.cyan('typescript')} but tsconfig.json not exists. Use default config.`
    );
  }
}
