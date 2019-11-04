import { existsSync } from 'fs';
import { join } from 'path';
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

/**
 * 按顺序获取文件
 * @param cwd 目录
 * @param files 获取的文件顺序
 * @param returnRelative
 */
export function getExistFile({
  cwd,
  files,
  returnRelative
}: {
  cwd: string;
  files: string[];
  returnRelative: boolean;
}) {
  for (const file of files) {
    const absFilePath = join(cwd, file);
    if (existsSync(absFilePath)) {
      return returnRelative ? file : absFilePath;
    }
  }
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
