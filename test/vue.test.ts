import { fixture, snapshot } from './utils';

snapshot({
  title: 'vue plugin',
  input: 'component.vue',
  cwd: fixture('vue')
});
