import { computed, reactive } from 'vue';
import { useStorage } from '@vueuse/core';
import dayjs from 'dayjs';

export const LinearClockLocal = useStorage('LinearClock', {
  vivid: [6 * 3600 * 1000, 22 * 3600 * 1000] as [number, number],
  snapping: 15,
});

export const format = {
  float: (x: number) =>
    x.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    }),
};

export const ClockState = reactive({
  vivid: computed({
    get: () => LinearClockLocal.value.vivid,
    set: v => (LinearClockLocal.value.vivid = v),
  }),
  snapping: computed({
    get: () => LinearClockLocal.value.snapping,
    set: v => (LinearClockLocal.value.snapping = v),
  }),

  now: dayjs(),
  today: dayjs().startOf('day'),

  percentage2Timestamp: (() => 0) as (_: number) => number,
  timestamp2Percentage: (() => 0) as (_: number) => number,

  focusPeriod: [null, null] as [number | null, number | null],
});

const now = dayjs();
setTimeout(
  () =>
    setInterval(() => {
      ClockState.now = dayjs();
      if (ClockState.now.date() !== ClockState.today.date()) {
        ClockState.today = ClockState.now.startOf('day');
      }
    }, 1000),
  1000 - (+now % 1000),
);
