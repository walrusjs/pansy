// @ts-ignore
import * as slash from 'slash';
import { lodash } from '@walrus/shared-utils';
import { Externals } from '@pansy/types';

export default function(externals: Externals, id: string, parentId?: string) {
  id = slash(id);

  if (!lodash.isArray(externals)) {
    externals = [externals] as Externals;
  }

  for (const external of externals) {
    if (
      lodash.isString(external) &&
      (id === external || id.includes(`/node_modules/${external}/`))
    ) {
      return true;
    }
    if (lodash.isRegExp(external)) {
      if (external.test(id)) {
        return true;
      }
    }
    if (typeof external === 'function') {
      if (external(id, parentId)) {
        return true;
      }
    }
  }

  return false;
}
