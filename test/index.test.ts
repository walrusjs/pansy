import { snapshot, fixture } from './utils';

snapshot({
  title: 'defaults',
  input: 'index.js',
  cwd: fixture('defaults')
});

snapshot(
  {
    title: 'exclude file',
    input: 'index.js',
    cwd: fixture('exclude-file')
  },
  {
    externals: ['./foo.js']
  }
);

snapshot(
  {
    title: 'extendOptions',
    input: ['foo.js', 'bar.js'],
    cwd: fixture('extend-options')
  },
  {
    output: {
      format: ['umd', 'umd-min', 'cjs']
    },
    extendConfig(config, { format }) {
      if (format === 'umd') {
        config.output.moduleName = 'umd';
      }
      if (format.endsWith('-min')) {
        config.output.moduleName = 'min';
      }
      return config;
    }
  }
);

snapshot(
  {
    title: 'bundle-node-modules',
    input: 'index.js',
    cwd: fixture('bundle-node-modules')
  },
  {
    bundleNodeModules: true
  }
);

snapshot({
  title: 'async',
  input: 'index.js',
  cwd: fixture('async')
});

snapshot(
  {
    title: 'uglify',
    input: 'index.js',
    cwd: fixture('uglify')
  },
  {
    output: {
      format: 'cjs-min'
    }
  }
);

snapshot(
  {
    title: 'inline-certain-modules',
    input: 'index.js',
    cwd: fixture('inline-certain-modules')
  },
  {
    bundleNodeModules: ['fake-module']
  }
);

snapshot(
  {
    title: 'target:browser',
    input: 'index.js',
    cwd: fixture('target/browser')
  },
  {
    output: {
      target: 'browser'
    }
  }
);
