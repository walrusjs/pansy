import {
  ModuleFormat as RollupFormat,
  InputOptions,
  OutputOptions,
  Plugin as RollupPlugin
} from 'rollup';
import { Banner } from './';

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
type Diff<T extends keyof any, U extends keyof any> = ({ [P in T]: P } &
  { [P in U]: never } & { [x: string]: never })[T]
type Overwrite<T, U> = Pick<T, Diff<keyof T, keyof U>> & U;

export type OutputTarget = 'node' | 'browser';

export type Format =
  | RollupFormat
  | 'cjs-min'
  | 'es-min'
  | 'esm-min'
  | 'umd-min'
  | 'iife-min'
  | 'amd-min'
  | 'system-min';

export type External =
  | string
  | RegExp
  | ((id: string, parentId?: string) => boolean)

export interface FileNameContext {
  format: RollupFormat
  minify: boolean
}

export type Externals = Array<External>

export type Env = {
  [k: string]: string | number | boolean
}

export type ConfigEntryObject = { [entryName: string]: string };

export type GetFileName = (
  context: FileNameContext,
  defaultFileName: string
) => string

export interface ConfigOutput {
  /**
   * Output format(s). You can append `min` to the format to generate minified bundle.
   *
   * @default `cjs`
   * @cli `--format <format>`
   */
  format?: Format | Format[]
  /**
   * Output directory
   * @default `dist`
   * @cli `-d, --out-dir <dir>`
   */
  dir?: string
  /**
   * Output file name
   *
   * Default value:
   * - `[name][min][ext]` in `cjs` and `esm` format.
   * - `[name][min].[format].js` in other formats.
   *
   * Placeholders:
   * - `[name]`: The base name of input file. (without extension)
   * - `[format]`: The output format. (without `-min` suffix)
   * - `[min]`: It will replaced by `.min` when the format ends with `-min`, otherwise it's an empty string.
   *
   * The value can also be a function which returns the fileName template,
   * The placeholders are also available in the return value.
   *
   * @cli `--file-name <fileName>`
   */
  fileName?: string | GetFileName
  /**
   * Module name for umd bundle
   */
  moduleName?: string
  /**
   * Whether to minify output files regardless of format, using this option won't add `.min` suffix to the output file name.
   */
  minify?: boolean
  /**
   * Extract CSS into a single file.
   * @default `true`
   */
  extractCSS?: boolean
  /**
   * Generate source maps
   * @default `true` for minified bundle, `false` otherwise
   */
  sourceMap?: boolean
  /**
   * Exclude source code in source maps
   */
  sourceMapExcludeSources?: boolean
  /**
   * Output target
   * @default `node`
   * @cli `--target <target>`
   */
  target?: OutputTarget
}

interface ConfigOutputOverwrite {
  /**
   * Output directory, always a string
   */
  dir: string
}

export interface BabelPresetOptions {
  /**
   * Transform `async/await` to `Promise`.
   * @default `true`
   */
  asyncToPromises?: boolean
  /**
   * Custom JSX pragma. If you want to use Preact, set it to `h`.
   */
  jsx?: string
  /**
   * Replace `Object.assign` with your own method.
   * @example `myAssign`
   */
  objectAssign?: string
  /**
   * Disable .babelrc
   * By default Bili reads it
   */
  babelrc?: boolean
  /**
   * Disable babel.config.js
   */
  configFile?: boolean
  /**
   * Disable babel-preset-env but still use other babel plugins
   * In addtional we use rollup-plugin-buble after rollup-plugin-babel
   */
  minimal?: boolean
}

export type ExtendConfig = (
  config: NormalizedConfig,
  { format, input }: { format: Format; input: string[] | ConfigEntryObject }
) => NormalizedConfig;

export interface RollupInputConfig extends InputOptions {
  plugins: Array<RollupPlugin>
}

export interface RollupOutputConfig extends OutputOptions {
  dir: string
}

export interface RollupConfig {
  inputConfig: RollupInputConfig
  outputConfig: RollupOutputConfig
}

export type ExtendRollupConfig = (config: RollupConfig) => RollupConfig

export interface NormalizedConfig {
  input?: string | ConfigEntryObject | Array<ConfigEntryObject | string>;
  output: Overwrite<ConfigOutput, ConfigOutputOverwrite>;
  env?: Env
  bundleNodeModules?: boolean | string[]
  plugins: {
    [name: string]: any
  }
  resolvePlugins?: {
    [name: string]: any
  }
  externals: Externals
  globals?: {
    [k: string]: string
  }
  banner?: Banner;
  babel: BabelPresetOptions;
  extendConfig?: ExtendConfig;
  extendRollupConfig?: ExtendRollupConfig
}

export interface Config {
  input?: string | ConfigEntryObject | Array<ConfigEntryObject | string>
  output?: ConfigOutput;
  env?: Env;
  plugins?: {
    [name: string]: any
  };
  resolvePlugins?: {
    [name: string]: any
  };
  bundleNodeModules?: boolean | string[];
  externals?: Externals;
  globals?: {
    [k: string]: string;
  };
  banner?: Banner;
  babel?: BabelPresetOptions;
  /**
   * Extending Bili config
   */
  extendConfig?: ExtendConfig;
  /**
   * Extending generated rollup config
   */
  extendRollupConfig?: ExtendRollupConfig;
}
