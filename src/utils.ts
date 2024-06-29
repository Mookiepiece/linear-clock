import { Ref, reactive, watchEffect } from 'vue';

export const clamp = (min = 0, value = 0, max = 100) =>
  Math.min(max, Math.max(min, value));

export const useElementSize = (ref: Ref<Element | null | undefined>) => {
  const size = reactive({
    width: 0,
    height: 0,
  });

  watchEffect(onCleanup => {
    const $el = ref.value;
    if ($el) {
      const ro = new ResizeObserver(([entry]) => {
        const [{ blockSize, inlineSize }] = entry.borderBoxSize;
        [size.width, size.height] = [inlineSize, blockSize];
      });
      ro.observe($el);

      onCleanup(() => ro.disconnect());
    }
  });

  return size;
};
