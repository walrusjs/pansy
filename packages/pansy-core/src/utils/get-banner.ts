import { Banner } from '@pansy/types';
import { lodash } from '@walrus/shared-utils';
import stringifyAuthor from 'stringify-author';

/**
 * 获取Banner信息
 * @param banner banner配置
 * @param pkg package.json 中的数据
 */
export default (
  banner?: Banner,
  pkg?: { [k: string]: any }
): string => {
  if (!banner || lodash.isString(banner)) {
    return banner as string || '';
  }

  banner = { ...pkg, ...(banner === true ? {} : banner) };

  let author = '';

  if (lodash.isString(banner.author)) {
    author = banner.author;
  }

  if (lodash.isObject(banner.author)) {
    author = stringifyAuthor(banner.author)
  }

  const license = banner.license || '';

  return (
    '/*!\n' +
    ` * ${banner.name} v${banner.version}\n` +
    ` * (c) ${author || ''}\n` +
    (license && ` * Released under the ${license} License.\n`) +
    ' */'
  )
}
