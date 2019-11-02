import { fixture, snapshot } from './utils';

snapshot({
  title: 'Typescript',
  input: 'index.ts',
  cwd: fixture('typescript')
});
