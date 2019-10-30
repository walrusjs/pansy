export {
  NormalizedConfig,
  Externals,
  Config,
  ConfigEntryObject,
  Format,
  Env,
  RollupConfig
} from './config';

export interface BannerInfo {
  /** library name */
  name?: string
  /** package version */
  version?: string
  /** Author name or object */
  author?: any
  /** License name, like MIT */
  license?: string
}

export type Banner = string | BannerInfo | boolean;

export interface RunContext {
  unresolved: Set<string>
}

export interface Options {
  /**
   * Log level
   */
  logLevel?: 'verbose' | 'quiet'
  /**
   * Always show stack trace
   */
  stackTrace?: boolean
  /**
   * Use a custom config file rather than auto-loading bili.config.js
   */
  configFile?: string | boolean
  /**
   * The root directory to resolve files from
   * Useful for mono-repo
   * e.g. You can install Bili in root directory and leaf packages can use their own Bili config file:
   * - `bili --root-dir packages/foo`
   * - `bili --root-dir packages/bar`
   */
  rootDir?: string
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

export interface RunContext {
  unresolved: Set<string>
}
