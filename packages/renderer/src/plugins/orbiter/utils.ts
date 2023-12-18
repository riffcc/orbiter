export const removeUndefined = <T extends {[key: string]: unknown}>(vals: T): T => {
  return Object.fromEntries(Object.entries(vals).filter(x => x[1] !== undefined)) as T; // Not exactly precise, but depends on [this problem](https://stackoverflow.com/questions/54489817/typescript-partialt-type-without-undefined) to be fixed.
};
