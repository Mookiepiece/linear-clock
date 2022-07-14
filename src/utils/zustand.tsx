import React from 'react';
import create, {
  Destroy,
  State,
  GetState,
  Subscribe,
  StoreMutatorIdentifier,
  UseBoundStore,
  Mutate,
} from 'zustand';

/** Copy */
type StoreApi<T extends State> = {
  setState: React.Dispatch<React.SetStateAction<T>>;
  getState: GetState<T>;
  subscribe: Subscribe<T>;
  destroy: Destroy;
};

/** Copy */
type Get<T, K, F = never> = K extends keyof T ? T[K] : F;

/** Copy */
type StateCreator<
  T extends State,
  Mis extends [StoreMutatorIdentifier, unknown][] = [],
  Mos extends [StoreMutatorIdentifier, unknown][] = [],
  U = T
> = ((
  setState: Get<Mutate<StoreApi<T>, Mis>, 'setState', undefined>,
  getState: Get<Mutate<StoreApi<T>, Mis>, 'getState', undefined>,
  store: Mutate<StoreApi<T>, Mis>,
  $$storeMutations: Mis
) => U) & {
  $$storeMutators?: Mos;
};

/** Copy */
export type ZustandStore<
  T extends State,
  Mos extends [StoreMutatorIdentifier, unknown][] = []
> = UseBoundStore<Mutate<StoreApi<T>, Mos>>;

/** Copy */
type Create = {
  <T extends State, Mos extends [StoreMutatorIdentifier, unknown][] = []>(
    initializer: StateCreator<T, [], Mos>
  ): ZustandStore<T, Mos>;
  <T extends State>(): <Mos extends [StoreMutatorIdentifier, unknown][] = []>(
    initializer: StateCreator<T, [], Mos>
  ) => ZustandStore<T, Mos>;
};

/**
 * `Strawberry Farm Zustand` VS `Vanilla Zustand`
 *
 * - setState always runs in `replace` mode
 */
export const zustand = ((_initializer: any) => {
  let initializer = _initializer;
  if (typeof _initializer === 'function') {
    initializer = (_set: any, ...rest: any) =>
      _initializer(function set(value: any, replace = true) {
        _set(value, replace);
      }, ...rest);
  }

  const store: ReturnType<typeof create> = create(initializer);

  const _setState = store.setState;

  store.setState = (value, replace = true) => _setState(value, replace);
  return store;
}) as Create;
