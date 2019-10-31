import { ModuleFormat } from 'rollup';
import { chalk as colors } from '@walrus/shared-utils';
import prettyBytes from 'pretty-bytes';
import boxen from 'boxen';
import textTable from 'text-table';
import stringWidth from 'string-width';
import logger from '../logger';

export interface Asset {
  absolute: string;
  source: string;
}

export type Assets = Map<string, Asset>;

export function getDefaultFileName(format: ModuleFormat) {
  return format === 'cjs' ? `[name][min][ext]` : `[name].[format][min][ext]`;
}

export async function printAssets(assets: Assets, title: string) {
  const gzipSize = await import('gzip-size').then((res) => res.default);
  const table = await Promise.all(
    [...assets.keys()].map(async (relative) => {
      const asset = assets.get(relative) as Asset;
      const size = asset.source.length;
      return [colors.green(relative), prettyBytes(size), prettyBytes(await gzipSize(asset.source))];
    })
  );
  table.unshift(['File', 'Size', 'Gzipped'].map((v) => colors.dim(v)));
  logger.success(title);
  logger.log(
    boxen(
      textTable(table, {
        stringLength: stringWidth
      })
    )
  );
}
