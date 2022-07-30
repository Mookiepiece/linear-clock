import { versionedStorage } from '@mookiepiece/strawberry-farm/shared';

const lc_local = versionedStorage<{
  dayStart: number;
  dayEnd: number;
  snapping: number;
}>({
  root: 'lc_local',
  storage: localStorage,
  version: 2,
  initialValue: {
    dayStart: (() => {
      const today0800 = new Date(0);
      today0800.setHours(6, 0, 0, 0);
      return today0800.getTime();
    })(),
    dayEnd: (() => {
      const today2230 = new Date(0);
      today2230.setHours(22, 30, 0, 0);
      return today2230.getTime();
    })(),
    snapping: 15,
  },
});

export const Storages = {
  lc_local,
};
