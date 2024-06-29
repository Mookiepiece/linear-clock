export type SFEventMap = HTMLElementEventMap | WindowEventHandlersEventMap;
type SFEvents = SFEventMap & Record<string, any>;

type EventModifiers =
  | 'stop'
  | 'prevent'
  | 'self'
  | 'capture'
  | 'once'
  | 'passive';
type SystemKeyModifiers = 'ctrl' | 'alt' | 'shift' | 'meta' | 'exact';
type KeyReconizerModifiers = 'key';
type Modifiers = EventModifiers | SystemKeyModifiers | KeyReconizerModifiers;

const systemModifiers = ['ctrl', 'shift', 'alt', 'meta'] as const;

type KeyedEvent = MouseEvent | KeyboardEvent | TouchEvent;
/**
 * https://github.com/vuejs/core/blob/ee4cd78a06e6aa92b12564e527d131d1064c2cd0/packages/runtime-dom/src/directives/vOn.ts#L14
 */
const modifierGuards: Record<
  string,
  (e: Event, set: Set<string>) => void | boolean
> = {
  stop: e => e.stopPropagation(),
  prevent: e => e.preventDefault(),
  self: e => e.target !== e.currentTarget,
  ctrl: e => !(e as KeyedEvent).ctrlKey,
  shift: e => !(e as KeyedEvent).shiftKey,
  alt: e => !(e as KeyedEvent).altKey,
  meta: e => !(e as KeyedEvent).metaKey,
  exact: (e, set) =>
    systemModifiers.some(m => (e as KeyedEvent)[`${m}Key`] && !set.has(m)),
};

export type ON<T extends EventTarget> = (target: T) => ON2;

export type ON2 = {
  [N in keyof SFEvents]: ON3<N, SFEvents[N]>;
};

export type ON3<N extends keyof SFEvents, E extends SFEvents[N]> = ((
  listener: (ev: E) => void,
) => () => void) & {
  [K in Modifiers]: ON3<N, E>;
} & (E extends KeyboardEvent
    ? {
        [K in string]: ON3<N, E>;
      }
    : void);

/**
 * Inspired by vue vOn
 */
export const on = <T extends EventTarget>(el: T) => {
  const _modifiers: string[] = [];

  const polaris = new Proxy(() => {}, {
    get(_, p) {
      _modifiers.push(p as string);
      return polaris;
    },
    apply(_, __, argArray) {
      const [type, ...m] = _modifiers;
      const set = new Set<Modifiers>(m as any[]);

      const capture = set.has('capture');
      const once = set.has('once');
      const passive = set.has('passive');
      set.delete('capture');
      set.delete('once');
      set.delete('passive');

      const codeVsKey: 'code' | 'key' = set.has('key') ? 'key' : 'code';
      set.delete('key');

      const fn = (e: Event) => {
        for (const modifier of set) {
          if (!modifierGuards[modifier]) {
            if (modifier !== (e as KeyboardEvent)[codeVsKey]) return;
          } else if (modifierGuards[modifier](e, set)) return;
        }

        argArray[0](e instanceof CustomEvent ? e.detail : e);
      };

      el.addEventListener(type, fn, { capture, once, passive });
      return () => el.removeEventListener(type, fn);
    },
  }) as any as ON2;
  return polaris;
};
