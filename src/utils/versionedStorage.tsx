import React, { SetStateAction } from 'react';
import { EqualityChecker, StateSelector } from 'zustand';
import shallow from 'zustand/shallow';
import { zustand, ZustandStore } from './zustand';

export type STORAGE_META = {
  meta: {
    version: number;
  };
};

type StorageModel<T extends Record<string, any>> = {
  meta: {
    version: number;
    versionBeforeUpgrade: number | undefined;
  };
  get(): T;
  set: React.Dispatch<React.SetStateAction<T>>;
  subscribe: ZustandStore<T>['subscribe'];
  useStore: ZustandStore<T>;
};

export type StorageModelUpgradeFn = Record<string, (legacyValue: any) => any>;

export const versionedStorage = <T extends Record<string, any>>({
  root,
  initialValue,
  version,
  upgradeFn = {},
  storage,
}: {
  root: string;
  initialValue: T;
  version: number;
  upgradeFn?: StorageModelUpgradeFn;
  storage: Storage;
}): StorageModel<T> => {
  let _obj: T & STORAGE_META;

  let versionBeforeUpgrade: number | undefined;

  try {
    _obj = JSON.parse(storage.getItem(root) || 'throws an error');

    if (_obj) {
      if (typeof _obj.meta.version !== 'number' || _obj.meta.version > version) throw new Error();
      versionBeforeUpgrade = _obj.meta.version;

      Object.entries(upgradeFn)
        .filter(([ver]) => Number(ver) < version || Number(ver) > _obj.meta.version)
        .forEach(([, fn]) => {
          _obj = fn(_obj);
        });
    }
  } catch (e) {
    _obj = { meta: { version }, ...initialValue };
  }

  if (JSON.stringify(_obj) !== storage.getItem(root)) {
    storage.setItem(root, JSON.stringify(_obj));
  }

  const { meta, ..._objRaw } = _obj as any;
  const objRaw: T = _objRaw;

  const useStore = zustand<T>(() => objRaw);

  useStore.subscribe(t => {
    storage.setItem(root, JSON.stringify({ meta: { version }, ...t }));
  });

  return {
    meta: {
      version,
      versionBeforeUpgrade,
    },
    useStore,
    get: useStore.getState,
    set: useStore.setState,
    subscribe: useStore.subscribe,
  };
};

export const useStorage = <S extends Record<string, any>, U = S>(
  storageModel: StorageModel<S>,
  selector?: StateSelector<S, U>,
  equals?: EqualityChecker<U>
): [U, React.Dispatch<React.SetStateAction<S>>] => {
  const value = storageModel.useStore<U>(
    selector as any,
    (selector ? equals ?? shallow : undefined) as any
  );

  return [value, storageModel.set];
};
