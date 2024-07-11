import { inject } from 'vue';

import type Orbiter from './orbiter';

export const useOrbiter = () => {
  const orbiter = inject<Orbiter>('constl');
  if (orbiter) return {orbiter};
  throw new Error('Orbiter not found. Did you register the Orbiter plugin with Vue?');
};

export const removeUndefined = <T extends {[key: string]: unknown}>(vals: T): T => {
  return Object.fromEntries(Object.entries(vals).filter(x => x[1] !== undefined)) as T; // Not exactly precise, but depends on [this problem](https://stackoverflow.com/questions/54489817/typescript-partialt-type-without-undefined) to be fixed.
};
