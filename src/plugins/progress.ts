import { Plugin, PluginContext } from 'rollup';
import logger from '../logger';

export default function({ title }: { title: string }): Plugin {
  return {
    name: 'progress',
    buildStart() {
      logger.progress(title);
    },

    transform(this: PluginContext, code: string, id: string) {
      if (!process.env.CI && process.stdout.isTTY) {
        logger.progress(`Bundling ${id.replace(process.cwd(), '.')}`);
      }
      return null;
    }
  };
}
