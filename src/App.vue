<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import Rail from './Rail.vue';
import dayjs, { Dayjs } from 'dayjs';
import { ClockState, format } from './app';
import { on } from './ui/on';
import { clamp } from './utils';
import Gear from './Gear.vue';
import TIcon from './components/TIcon.vue';

const range = computed(() => {
  const today = dayjs().startOf('day');
  return [
    dayjs(+today + ClockState.vivid[0]),
    dayjs(+today + ClockState.vivid[1]),
  ] as const;
});

const rightPercentage = computed(() => {
  const [now, [s, e]] = [ClockState.now, range.value];
  return (100 - ((+now - +s) / (+e - +s)) * 100).toFixed(2) + '%';
});

const rail = ref<HTMLDivElement>();

const hover = ref(false);
const active = ref(false);

const pointed = reactive<(Dayjs | null)[]>([null, null]);
const marked = computed(() => {
  if (!pointed[0] || !pointed[1]) return pointed;
  return +pointed[1] > +pointed[0] ? pointed : [...pointed].reverse();
});

const markedLeft = computed(() =>
  marked.value.map(d => {
    if (!d) return '';
    const [s, e] = range.value;
    return ((+d - +s) / (+e - +s)) * 100 + '%';
  }),
);

const label = reactive({
  left: '',
  time: dayjs(),
  subtitle: '',
});

onMounted(() => {
  const $rail = rail.value!;

  const pointer2Value = (e: PointerEvent) => {
    const x = e.clientX;
    const { left, width } = $rail.getBoundingClientRect();
    return clamp(0, x - left, width) / width;
  };
  const value2Day = (value: number) => {
    const [s, e] = range.value;
    return dayjs(+s + (+e - +s) * value);
  };

  on($rail).pointermove(e => {
    hover.value = true;

    const value = pointer2Value(e);
    label.left = format.float(value * 100) + '%';
    label.subtitle = format.float(100 - value * 100) + '%';
    label.time = value2Day(value);
  });

  on($rail).pointerleave(() => (hover.value = false));

  on($rail).pointerdown(e => {
    $rail.setPointerCapture(e.pointerId);
    active.value = true;

    [pointed[0], pointed[1]] = [value2Day(pointer2Value(e)), null];

    const off1 = on($rail).pointermove(e => {
      pointed[1] = value2Day(pointer2Value(e));
    });
    const off2 = on($rail).pointerup(e => {
      pointed[1] = value2Day(pointer2Value(e));

      if (+pointed[0]! === +pointed[1]) pointed[0] = pointed[1] = null;

      active.value = false;

      off1();
      off2();
    });
  });
});

const subtitle = computed(() => {
  const [now, [s, e]] = [ClockState.now, [marked.value[0]!, marked.value[1]!]];
  const width = clamp(0, Number(((+now - +s) / (+e - +s)) * 100), 100);
  return format.float(100 - width) + '%';
});

const open = ref(false);
</script>

<template>
  <main>
    <div class="MainRailContainer" ref="rail">
      <Rail
        show-labels
        :now="ClockState.now"
        :range="[range[0], range[1]]"
        class="TheMainRail"
      />
      <div
        class="MainGlass Glass --1"
        :class="[active && 'active']"
        :aria-hidden="!hover"
        :style="{
          left: label.left,
        }"
      >
        {{ label.time.format('HH:mm') }} <sub>{{ label.subtitle }}</sub>
      </div>
      <div
        class="Mark A"
        v-if="markedLeft[0]"
        :style="{ left: markedLeft[0] }"
      ></div>
      <div
        class="Mark B"
        v-if="markedLeft[1]"
        :style="{ left: markedLeft[1] }"
      ></div>

      <span class="Typo --1" style="margin-top: 30px">
        {{ ClockState.now.format('HH:mm:ss') }}
        <sub>{{ rightPercentage }}</sub>
      </span>
    </div>

    <footer>
      <button @click="open = true">
        <TIcon i="compass" />
      </button>
      <div v-if="marked.every(Boolean)">
        <Rail
          class="Small"
          :now="ClockState.now"
          :range="[marked[0]!, marked[1]!]"
        />
        <span class="Typo --3">
          {{ marked[0]!.format('HH:mm:ss') }} ~
          {{ marked[1]!.format('HH:mm:ss') }}
          <sub>{{ subtitle }}</sub>
        </span>
      </div>
    </footer>
    <Gear v-model:open="open" />
  </main>
</template>

<style scoped>
main {
  position: relative;
  top: 50%;
  height: 180px;
  transform: translateY(-50%) translateY(-0px);
  margin-inline: 30px;
}

@media not (min-width: 700px) {
  main {
    margin-inline: 10px;
  }
}

.MainRailContainer {
  height: 140px;
  cursor: crosshair;

  user-select: none;
}

.MainGlass {
  transform: translateX(-50%) translateY(-45px);

  &[aria-hidden='true'] {
    opacity: 0;
  }

  ::before {
    position: absolute;
    top: 40px;
    left: calc(50% - 1px);
    display: block;
    width: 2px;
    height: 80px;
    background: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 2px,
      #0002 2px,
      #0002 4px
    );
    content: '';
  }
}

.Mark {
  position: absolute;
  top: -10px;
  left: 0;
  width: 2px;
  &::before {
    display: block;
    border: 5px solid transparent;
    border-top-color: var(--color-primary);
    transform: translateX(-50%);
    content: '';
  }
}

footer {
  display: grid;
  grid: auto / 60px min(500px, calc(100% - 70px));
  gap: 10px;
  align-items: center;
}
</style>
