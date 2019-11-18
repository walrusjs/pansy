import { Plugin as RollupPlugin } from 'rollup';
import resolveFrom from 'resolve-from';
import formatTime from 'pretty-ms';
import progressPlugin from './plugins/progress';
import logger from './logger';
import nodeResolvePlugin from './plugins/node-resolve';
import { NormalizedConfig } from './types';

type PluginFactory = (opts: any) => RollupPlugin;
type GetPlugin = (rootDir: string, name: string, config: NormalizedConfig) => PluginFactory | Promise<PluginFactory>;

function localRequire(rootDir: string, name: string, { silent, cwd }: { silent?: boolean; cwd?: string } = {}) {
  cwd = cwd || rootDir;
  const resolved = silent ? resolveFrom.silent(cwd, name) : resolveFrom(cwd, name);
  return resolved && require(resolved);
}

const getPlugin: GetPlugin = (rootDir: string, name: string, config: NormalizedConfig) => {
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
      : name.charAt(0) === '@'
      ? require(name)
      : localRequire(rootDir, `rollup-plugin-${name}`);

  if (name === 'terser') {
    return plugin.terser;
  }

  return plugin.default || plugin;
};

export default getPlugin;
