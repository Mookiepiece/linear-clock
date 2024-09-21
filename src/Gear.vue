<script setup lang="ts">
import { on } from './ui/on';
import { useElementSize } from './utils';
import { Ref, computed, reactive, ref, watch, watchEffect } from 'vue';
import { ClockState } from './app';
import DropdownButton from './components/DropdownButton.vue';
import TIcon from './components/TIcon.vue';
import { trap } from './ui/trap';

const DAY = 24 * 3600 * 1000;

const open = defineModel<boolean>('open');
const root = ref<HTMLElement>();
watchEffect(onCleanup => {
  if (open.value && root.value) {
    onCleanup(trap(root.value));
  }
});

const state = reactive({ a: 0, b: 0 });

const snapping = computed(() => ClockState.snapping);

const volume = reactive({
  a: computed({ get: () => state.a / DAY, set: v => (state.a = v * DAY) }),
  b: computed({ get: () => state.b / DAY, set: v => (state.b = v * DAY) }),
});

const stateText = reactive({
  a: computed(() => ClockState.today.add(DAY * volume.a).format('HH:mm')),
  b: computed(() => ClockState.today.add(DAY * volume.b).format('HH:mm')),
});

watch(
  open,
  () => {
    [state.a, state.b] = [ClockState.vivid[0], ClockState.vivid[1]];
  },
  { flush: 'sync', immediate: true },
);

const submit = () => {
  ClockState.vivid = [state.a, state.b];
  open.value = false;
};

const main = ref<HTMLElement | undefined>();
const size = useElementSize(main);
const sizing = computed(() => Number(Math.min(size.width, size.height)));

const idle = computed(() => state.b === state.a);

const rainbow = (() => {
  const r = computed(() => sizing.value * 0.3575);
  const strokeWidth = computed(() => sizing.value * 0.035);
  const dasharray = computed(
    () => `${(volume.b - volume.a) * r.value * 2 * Math.PI} 1000000`,
  );
  const rotate = computed(() => volume.a * 360 + 90);

  return reactive({ r, strokeWidth, dasharray, rotate });
})();

const rainbowShadow = (() => {
  const r = computed(() => sizing.value * 0.1875);
  const strokeWidth = computed(() => sizing.value * 0.375);
  const dasharray = computed(
    () => `${(1 + volume.a - volume.b) * r.value * 2 * Math.PI} 1000000`,
  );
  const rotate = computed(() => volume.b * 360 + 90);

  return reactive({ r, strokeWidth, dasharray, rotate });
})();

const dots = computed(() => {
  return Array(24)
    .fill(0)
    .map((_, i) => {
      const deg = (i / 24) * Math.PI * 2;

      const r = sizing.value * 0.315;
      const x = Math.round(-Math.sin(deg) * r);
      const y = Math.round(Math.cos(deg) * r);

      return { i, x, y };
    });
});

let pressed = ref<false | 'A' | 'B'>(false);
let within = ref(false);

const label = reactive({
  visible: computed(() => pressed.value || within.value),
  left: '',
  top: '',
  text: '',
});

const screen = ref<HTMLElement>();
watchEffect(onCleanup => {
  const $screen = screen.value;
  if (!$screen) return;
  const $main = main.value;
  if (!$main) return;

  const pointer2Offset = (e: PointerEvent) => {
    const { left, top, right, bottom } = $screen.getBoundingClientRect();
    const o = [(right + left) / 2, (top + bottom) / 2];
    return [e.clientX - o[0], e.clientY - o[1]];
  };

  const pointer2Degree = (e: PointerEvent) => {
    const [x, y] = pointer2Offset(e);

    return ((Math.atan2(y, x) / Math.PI) * 180 + 270) % 360;
  };

  const _cache = new WeakMap<PointerEvent, number>();
  const pointer2Value = (e: PointerEvent) =>
    _cache.get(e) ??
    (() => {
      const value = pointer2Degree(e) / 360;
      _cache.set(e, value);
      return value;
    })();

  const pointer2RoundedTime = (e: PointerEvent) => {
    const value = pointer2Value(e);
    const _snapping = snapping.value * 60 * 1000;
    return Math.round((value * DAY) / _snapping) * _snapping;
  };

  const pointer2Label = (e: PointerEvent) => {
    const { left, top } = $main.getBoundingClientRect();
    const [x, y] = [e.clientX - left, e.clientY - top];
    [label.left, label.top] = [x + 'px', y + 'px'];

    const time = pointer2RoundedTime(e);

    label.text = ClockState.today.add(time).format('HH:mm');
  };

  onCleanup(
    on($screen).pointerdown(e => {
      pressed.value = 'B';
      $screen.setPointerCapture(e.pointerId);

      state.a = state.b = pointer2RoundedTime(e);

      pointer2Label(e);
    }),
  );

  onCleanup(on($screen).pointerenter(() => (within.value = true)));
  onCleanup(on($screen).pointerleave(() => (within.value = false)));

  const setTime = (e: PointerEvent) => {
    if (!pressed.value) return;
    const time = pointer2RoundedTime(e);

    switch (pressed.value) {
      case 'A':
        state.a = time;
        state.b = (state.b % DAY) + +(state.b < state.a) * DAY;
        break;
      case 'B':
        state.b = time + +(time < state.a) * DAY;
        break;
    }
  };

  onCleanup(
    on($main).pointermove(e => {
      pointer2Label(e);
      setTime(e);
    }),
  );

  onCleanup(
    on($main).pointerup(e => {
      setTime(e);
      pressed.value = false;
    }),
  );
});

const handlers = computed(() => {
  const R = sizing.value * 0.4375;

  const place = (v: number) => {
    const radius = v * 2 * Math.PI;
    const x = (-Math.sin(radius) * R).toFixed(0) + 'px';
    const y = (Math.cos(radius) * R).toFixed(0) + 'px';
    return { x, y };
  };

  return [place(volume.a), place(volume.b)];
});

const useHandler = (el: Ref<HTMLElement | undefined>, mapping: 'A' | 'B') => {
  watchEffect(onCleanup => {
    const $el = el.value;
    if (!$el) return;
    onCleanup(
      on($el).pointerdown(e => {
        $el.setPointerCapture(e.pointerId);
        pressed.value = mapping;
      }),
    );
  });
};
const handlerA = ref<HTMLElement>();
const handlerB = ref<HTMLElement>();
useHandler(handlerA, 'A');
useHandler(handlerB, 'B');
</script>

<template>
  <Teleport to="body">
    <i-edge v-if="open" />
    <Transition>
      <div
        class="GearModal"
        v-if="open"
        tabindex="-1"
        ref="root"
        @keydown.esc.prevent="open = false"
      >
        <main ref="main" :style="{ '--sizing': sizing + 'px' }">
          <div class="screen" ref="screen">
            <div
              class="dot"
              v-for="{ x, y, i } in dots"
              :style="{ '--x': x + 'px', '--y': y + 'px' }"
              :data-label="!(i % 3) ? i : undefined"
            ></div>
            <svg id="RainbowShadow" :class="[idle && 'hidden']">
              <circle
                :r="rainbowShadow.r"
                cx="50%"
                cy="50%"
                fill="transparent"
                :stroke-width="rainbowShadow.strokeWidth"
                :stroke-dasharray="rainbowShadow.dasharray"
                :style="{
                  transform: `rotate(${rainbowShadow.rotate}deg)`,
                  transformOrigin: 'center',
                }"
              ></circle>
            </svg>
            <svg id="Rainbow">
              <linearGradient
                id="RainbowGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" style="stop-color: #fd3" />
                <stop offset="100%" style="stop-color: #39f" />
              </linearGradient>
              <linearGradient
                id="RainbowGradientDark"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" style="stop-color: #005" />
                <stop offset="100%" style="stop-color: #000616" />
              </linearGradient>

              <circle
                id="Rainbow"
                :r="rainbow.r"
                cx="50%"
                cy="50%"
                fill="transparent"
                :stroke-width="rainbow.strokeWidth"
                :stroke-dasharray="rainbow.dasharray"
                :style="{
                  transform: `rotate(${rainbow.rotate}deg)`,
                  transformOrigin: 'center',
                }"
              ></circle>
            </svg>
          </div>
          <div
            ref="handlerA"
            class="handler"
            :class="[idle && 'hidden']"
            :style="{ '--x': handlers[0].x, '--y': handlers[0].y }"
          ></div>
          <div
            ref="handlerB"
            class="handler"
            :class="[idle && 'hidden']"
            :style="{ '--x': handlers[1].x, '--y': handlers[1].y }"
          ></div>
          <div
            id="GearLabel"
            class="Glass --1"
            :class="[!label.visible && 'hidden']"
            :style="{
              left: label.left,
              top: label.top,
            }"
          >
            {{ label.text }}
          </div>
        </main>
        <footer>
          <div>
            <DropdownButton
              :options="[1, 5, 10, 15]"
              v-model="ClockState.snapping"
            >
              <TIcon i="subway-line" />
            </DropdownButton>
          </div>
          <button @click="open = false">
            <TIcon i="close" />
          </button>
          <div class="Typo --3">{{ stateText.a }} ~ {{ stateText.b }}</div>
          <button @click="submit">
            <TIcon i="check" />
          </button>
        </footer>
      </div>
    </Transition>
    <i-edge v-if="open" />
  </Teleport>
</template>

<style>
.GearModal {
  position: fixed;
  inset: 0;
  background: var(--color-bg);

  user-select: none;

  &.v-enter-active,
  &.v-leave-active {
    transition: transform 0.3s var(--wave);
    pointer-events: none;
  }
  &.v-enter-from,
  &.v-leave-to {
    transform: translateY(100%);
  }

  main {
    position: relative;
    display: grid;
    grid: var(--sizing) / var(--sizing);
    place-content: center;
  }

  .screen {
    position: absolute;
    top: calc(50% - var(--sizing) * 0.375);
    left: calc(50% - var(--sizing) * 0.375);
    --panel-sizing: calc(var(--sizing) * 0.75);
    width: var(--panel-sizing);
    aspect-ratio: 1;
    cursor: crosshair;
    clip-path: circle(50%);

    &::before {
      position: absolute;
      inset: 0;
      border-radius: 50%;

      /*
  background-image: linear-gradient(
    -60deg,
    #d5d4d0 0%,
    #d5d4d0 1%,
    #eeeeec 31%,
    #efeeec 75%,
    #e9e9e7 100%
  ); */
      background: linear-gradient(135deg, var(--color-bg) 66%, #0001 100%),
        var(--color-bg);

      box-shadow:
        0 2px 20px 3px inset #0001,
        0 0 0 2px inset #0001;
      content: '';
    }

    svg {
      position: absolute;
      width: 100%;
      aspect-ratio: 1;
    }
  }

  .dot {
    position: absolute;
    inset: 0;
    pointer-events: none;

    color: var(--gray-ink);

    &::before {
      position: absolute;
      left: calc(50% + var(--x));
      top: calc(50% + var(--y));
      --r: calc(var(--sizing) / 400);
      --d: calc(var(--r) * 2);
      width: var(--d);
      height: var(--d);
      display: block;
      border-radius: 999px;
      background-color: currentColor;
      transform: translate(-50%, -50%);
      content: '';
    }

    &[data-label]::after {
      position: absolute;
      left: calc(50% + 0.83 * var(--x));
      top: calc(50% + 0.83 * var(--y));
      font-size: calc(var(--sizing) / 30 + 5px);
      content: attr(data-label);
      transform: translate(-50%, -50%);
    }
  }

  #GearLabel {
    position: absolute;
    transform: translate(-50%, -50%) translateY(-45px);
    transition: opacity 0.2s var(--wave);

    &.hidden {
      opacity: 0;
    }
  }

  #RainbowShadow {
    circle {
      stroke: #0001;
    }
    transition: opacity 0.3s;
    &.hidden {
      opacity: 0;
      transition: none;
    }
  }

  #Rainbow {
    mix-blend-mode: color;
    stroke: url(#RainbowGradient);

    @media (prefers-color-scheme: dark) {
      stroke: url(#RainbowGradientDark);
    }
  }

  .handler {
    position: absolute;
    top: calc(50% + var(--y));
    left: calc(50% + var(--x));
    width: calc(var(--sizing) * 0.08);
    height: calc(var(--sizing) * 0.08);
    background-color: var(--color-bg);
    border-radius: 50%;
    box-shadow:
      -3px -3px 5px 0 #fffa,
      3px 3px 5px 0 #0001;
    transform: translate(-50%, -50%);
    touch-action: none;

    @media (prefers-color-scheme: dark) {
      box-shadow:
        -3px -3px 5px 0 #ddd1,
        3px 3px 5px 0 #0001;
    }

    &.hidden {
      display: none;
    }
  }

  footer {
    display: grid;
    grid: auto auto auto / auto;
    gap: 10px;
    place-content: center;
    place-items: center;

    > :first-child {
      grid-area: 1/1/2/4;
    }
  }
}

.GearModal {
  display: grid;
  grid: calc(100% - 85px) 85px / auto;
}
</style>
