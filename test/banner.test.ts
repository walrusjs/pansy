import { fixture, snapshot } from './utils';

/**
 * 开启Banner，自动读取package.json中的信息
 */
snapshot(
  {
    title: 'banner:true default',
    input: 'index.js',
    cwd: fixture('banner/default')
  },
  {
    banner: true
  }
);

/**
 * 直接指定Banner信息 BannerInfo
 */
snapshot(
  {
    title: 'banner:object',
    input: 'default.js',
    cwd: fixture()
  },
  {
    banner: {
      author: '阿康',
      license: 'MIT',
      name: 'pansy',
      version: '1.0.0'
    }
  }
);

/**
 * 直接指定Banner信息 string
 */
snapshot(
  {
    title: 'banner:string',
    input: 'default.js',
    cwd: fixture()
  },
  {
    banner: 'hello world'
  }
);
