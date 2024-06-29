interface IBag {
  (cb?: () => void): void;
  (cb: AbortController): AbortController;
}
/**
 * The bag collects callbacks and signals, then execute and dump them all if no argument was provided.
 * To collect and unsubscribe clean up functions.
 */
export const Bag = (): IBag => {
  const set = new Set<(() => void) | AbortController>();

  const bag = (cb => {
    if (cb) {
      set.add(cb);
      if (cb instanceof AbortController) {
        return cb;
      }
    } else {
      set.forEach(_ => (_ instanceof AbortController ? _.abort() : _()));
      set.clear();
    }
  }) as IBag;

  return bag;
};

export const Bags = <T extends object>() => {
  const weakMap = new WeakMap<T, IBag>();

  const getBag = (i: T) => {
    if (weakMap.has(i)) {
      return weakMap.get(i)!;
    }
    const bag = Bag();
    weakMap.set(i, bag);
    return bag;
  };

  const resetBag = (i: T) => {
    weakMap.get(i)?.();
    return getBag(i);
  };

  return { getBag, resetBag, weakMap };
};
