/// <reference types="vite/client" />

type IFeatherProps = {
  /** The icon name. */
  i: keyof typeof IFeatherElement.names;
};

export type CustomElements = {
  'i-edge': DefineComponent<IFeatherProps>;
};

declare module 'vue' {
  interface GlobalComponents extends CustomElements {}
}
