import { Config } from '@pansy/types'

const config: Config = {
  input: {
    index: 'src/index.ts',
    babel: 'src/babel/preset.ts'
  },
  bundleNodeModules: true,
  externals: [
    ...Object.keys(require('./package').dependencies),
    'spawn-sync' // from cross-spawn which is from execa which is from term-size which is from boxen
  ]
};

export default config
