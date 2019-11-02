import path from 'path';
import { Bundler, Config, Options } from '../src';

process.env.BABEL_ENV = 'anything-not-test';

export function fixture(...args: string[]) {
  return path.join(__dirname, 'fixtures', ...args);
}

function generate(config: Config, options: Options) {
  const bundler = new Bundler(config, {
    logLevel: 'quiet',
    configFile: false,
    ...options
  });
  return bundler.run();
}

export function snapshot(
  { title, input, cwd }: { title: string; input: string | string[]; cwd?: string },
  config?: Config
) {
  test(title, async () => {
    const { bundles } = await generate(
      {
        input,
        ...config
      },
      {
        rootDir: cwd
      }
    );
    for (const bundle of bundles) {
      for (const relative of bundle.keys()) {
        const asset = bundle.get(relative);
        expect(asset && asset.source).toMatchSnapshot(`${title} ${relative}`);
      }
    }
  });
}
