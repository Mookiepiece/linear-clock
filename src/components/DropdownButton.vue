<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { on } from '../ui/on';
import { onClickAway } from '../ui/onClickAway';
import { Bag } from '../ui/collection';
import { trap } from '../ui/trap';

const model = defineModel();

const props = defineProps<{
  options: number[];
}>();

const reference = ref<HTMLElement>();
const popper = ref<HTMLElement>();

const open = ref(false);

const submit = (value: number) => {
  open.value = false;
  model.value = value;
};

const auto = (els: Element[], cb: () => void) => {
  const bag = Bag();

  const ro = new ResizeObserver(cb);
  bag(() => ro.disconnect());

  els.forEach(el => {
    ro.observe(el);
    for (
      let p: Element | null = el;
      p && p !== document.documentElement;
      p = p.parentElement
    ) {
      if (p.scrollWidth > p.clientWidth) bag(on(p).scroll(() => cb()));
    }
  });

  bag(on(window).resize(() => cb()));

  return () => bag();
};

const place = () => {
  const $ref = reference.value!;
  const $pop = popper.value!;

  const ref = $ref.getBoundingClientRect();
  const pop = $pop.getBoundingClientRect();

  const x = ref.left + ref.width / 2 - pop.width / 2;
  const y = ref.top - pop.height;

  $pop.style.setProperty('--x', x + 'px');
  $pop.style.setProperty('--y', y + 'px');
  $pop.style.setProperty('transform', y + 'px');
};

const bag = Bag();
const onEnter = () => {
  const $ref = reference.value!;
  const $pop = popper.value!;
  bag(auto([$ref, $pop], place));
  bag(
    onClickAway([$ref, $pop], () => {
      open.value = false;
    }),
  );
};

watchEffect(onCleanup => {
  const [$open, $pop] = [open.value, popper.value];
  if ($open && $pop) {
    onCleanup(trap($pop));
  }
});
const current = ref(
  Math.max(
    props.options.findIndex(i => i === model.value),
    0,
  ),
);

const onBeforeLeave = () => {
  bag();
};
</script>

<template>
  <button ref="reference" @click="open = !open">
    <slot />
    <div class="label">{{ model !== 1 ? model : undefined }}</div>
  </button>
  <Teleport to="body">
    <Transition @enter="onEnter" @before-leave="onBeforeLeave">
      <div v-if="open" ref="popper" data-positioner>
        <div data-popper-content @keydown.esc="open = !open">
          <div
            role="listbox"
            tabindex="0"
            @keydown.left="
              current = (current - 1 + options.length) % options.length
            "
            @keydown.right="current = (current + 1) % options.length"
            @keydown.space.prevent="submit(options[current])"
            @keydown.enter.prevent="submit(options[current])"
          >
            <div
              role="option"
              v-for="(o, i) of options"
              @click="() => submit(o)"
              :class="{ current: current === i }"
            >
              {{ o }}
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
button {
  position: relative;
}

.label {
  position: absolute;
  right: 5px;
  bottom: 4px;
  font-size: 12px;
  font-weight: 700;
}

[data-positioner] {
  position: fixed;
  left: 0;
  top: 0;
  transform: translate(var(--x), var(--y));
  outline: 0;

  &:is(.v-enter-active, .v-leave-active) {
    transition: outline 0.2s var(--wave);

    [data-popper-content] {
      transform-origin: center bottom;
      transition: transform 0.2s var(--wave);
    }
  }
  &:is(.v-enter-from, .v-leave-to) {
    outline-color: red;

    [data-popper-content] {
      transform: scale(0);
    }
  }
  &:is(.v-enter-from, .v-leave-to) {
    outline-color: green;
  }
}
[data-popper-content] {
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 2px;
  box-shadow: 0 2px 12px #0001;
}

[role='listbox'] {
  display: flex;
  outline: 0;
}
[role='option'] {
  width: 60px;
  height: 40px;
  display: grid;
  place-content: center;
  font-size: 18px;
  font-weight: 600;
  color: var(--ink);
  cursor: grid;

  user-select: none;

  &:hover {
    background-color: #0001;
  }
  &:active {
    background-color: #0002;
  }
  cursor: pointer;
}

[role='listbox']:focus-visible .current {
  outline: 2px solid;
  outline-offset: -2px;
}
</style>
