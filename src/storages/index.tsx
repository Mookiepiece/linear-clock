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
      const t = new Date(0);
      t.setHours(6, 0, 0, 0);
      return t.getTime();
    })(),
    dayEnd: (() => {
      const t = new Date(0);
      t.setHours(22, 30, 0, 0);
      return t.getTime();
    })(),
    snapping: 15,
  },
});

export const Storages = {
  lc_local,
};
