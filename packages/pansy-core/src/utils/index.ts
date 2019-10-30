import { ModuleFormat as RollupFormat } from 'rollup'

export function getDefaultFileName(format: RollupFormat) {
  return format === 'cjs' ? `[name][min][ext]` : `[name].[format][min][ext]`
}
