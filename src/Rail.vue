<script setup lang="ts">
import { Dayjs } from 'dayjs';
import { computed } from 'vue';
import { format } from './app';

const props = defineProps<{
  now: Dayjs;
  range: [Dayjs, Dayjs];
  showLabels?: boolean;
}>();

const hourLabels = computed(() => {
  if (!props.showLabels) return [];
  let [s, e] = props.range;

  const total = +e - +s;

  const firstMark = s.get('h') + +!!s.get('m');
  const lastMark = +e.isAfter(s, 'date') * 24 + e.get('h');

  return Array(lastMark + 1 - firstMark)
    .fill(0)
    .map((_, index) => {
      const hour = firstMark + index;

      const percentage = format.float(
        ((+s.startOf('h').set('h', hour) - +s) / total) * 100,
      );

      return { hour, percentage };
    });
});

const width = computed(() => {
  const [now, [s, e]] = [props.now, props.range];
  if (+now > +e) return 0 + '%';
  return Number((((+now - +s) / (+e - +s)) * 100).toPrecision(4)) + '%';
});
</script>

<template>
  <div class="Rail">
    <div class="bar">
      <div class="fill" :style="{ width }"></div>
    </div>
    <span
      class="label"
      v-for="label in hourLabels"
      :style="{ left: label.percentage + '%' }"
      :data-title="label['hour']"
    ></span>
  </div>
</template>

<style>
.Rail {
  position: relative;
  --rail-height: 40px;

  --color-empty: #0000000d;
  --color-empty2: #00000008;

  --color-shadow: #d2690029;
  --color-shadow2: #ffe9bb;
  --color-fill: #fc3;
  --color-fill2: #f2b23a;

  --fill-box-shadow: 5px 5px 5px var(--color-shadow),
    -5px -5px 5px var(--color-shadow2);

  --fill-background: linear-gradient(
    110deg,
    var(--color-fill),
    var(--color-fill2)
  );

  @media (prefers-color-scheme: dark) {
    & {
      --color-empty: #0000003a;
      --color-empty2: #00000030;

      --color-shadow: #d6b72e11;
      --color-shadow2: #cf8e0011;
      --color-fill: #c28d1c;
      --color-fill2: #c28410;
    }
  }

  .bar {
    height: var(--rail-height);

    background: linear-gradient(
      0deg,
      var(--color-empty) 2%,
      var(--color-empty2) 10%,
      var(--color-empty2) 80%,
      var(--color-empty) 90%
    );
    border-top-right-radius: 4px;
  }

  .fill {
    position: relative;
    max-width: 100%;
    height: 100%;
    background: var(--fill-background);
    border-top-left-radius: 4px;
    box-shadow: var(--fill-box-shadow);
  }

  .label {
    position: absolute;
    top: var(--rail-height);
    font-size: 13px;
    color: var(--ink);
    transform: translateX(-50%);

    &::before {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      display: block;
      width: 2px;
      height: 3px;
      background: var(--ink);
      opacity: 0.5;
      content: '';
    }
    &::after {
      content: attr(data-title);
    }
  }

  &.Small {
    --rail-height: 10px;

    --fill-box-shadow: 2px 2px 2px var(--color-shadow),
      -2px -2px 2px var(--color-shadow2);

    .bar,
    .fill {
      border-radius: 0;
    }
  }
}
</style>
