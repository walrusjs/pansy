import { Config } from './src';

const config: Config = {
  input: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
    babel: 'src/babel/preset.ts'
  },
  bundleNodeModules: true,
  plugins: {
    copy: {
      targets: [{ src: 'src/template', dest: 'dist' }]
    }
  },
  externals: [
    ...Object.keys(require('./package').dependencies),
    'spawn-sync' // from cross-spawn which is from execa which is from term-size which is from boxen
  ]
};

export default config;
