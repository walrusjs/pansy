import { BannerInfo } from '@pansy/types';
import getBanner from '../get-banner';

describe('getBanner', () => {
  it('不输出Banner', () => {
    expect(getBanner(false)).toEqual('');
    expect(getBanner('')).toEqual('');
  });

  it('输出指定的字符串', () => {
    expect(getBanner('Hello World')).toEqual('Hello World');
  });

  it('输出完整的Banner', () => {
    const bannerInfo: BannerInfo = {
      name: 'pansy',
      version: '0.0.1',
      author: '阿康',
      license: 'MIT'
    };
    expect(getBanner(bannerInfo)).toEqual('/*!\n' +
      ` * pansy v0.0.1\n` +
      ` * (c) 阿康\n` +
      ` * Released under the MIT License.\n` +
      ' */'
    );
  });
});
