import signale from 'signale';
import { chalk } from '@walrus/shared-utils';
import { NormalizedConfig } from '../types';

export default function(config: NormalizedConfig) {
  const { output } = config;

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
      throw new Error(
        `${chalk.cyan('umd')} format must be set ${chalk.cyan('output.name')}`,
      );
    }
  }
}
