import { fixture, snapshot } from './utils';

snapshot({
  title: 'babel:with-config',
  input: 'index.js',
  cwd: fixture('babel/with-config')
});

snapshot(
  {
    title: 'babel:disable-config',
    input: 'index.js',
    cwd: fixture('babel/with-config')
  },
  {
    babel: {
      babelrc: false
    }
  }
);

snapshot({
  title: 'babel:object-rest-spread',
  input: 'index.js',
  cwd: fixture('babel/object-rest-spread')
});
