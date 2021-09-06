import mitt from 'mitt';

export type Emitter<T> = {
  on<K extends keyof T>(type: K, handler: (event: T[K]) => void): void;
  off<K extends keyof T>(type: K, handler: (event: T[K]) => void): void;
  emit<K extends keyof T>(type: K, event: T[K]): void;
};

export const Mitt = <T>(): Emitter<T> => mitt() as unknown as Emitter<T>;
