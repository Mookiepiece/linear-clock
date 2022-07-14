import { versionedStorage } from '@/utils/versionedStorage';

const lc_local = versionedStorage<{
  day_start: number;
  day_end: number;
}>({
  root: 'lc_local',
  storage: localStorage,
  version: 1,
  initialValue: {
    day_start: (() => {
      const today0800 = new Date(0);
      today0800.setHours(6, 0, 0, 0);
      return today0800.getTime();
    })(),
    day_end: (() => {
      const today2230 = new Date(0);
      today2230.setHours(22, 30, 0, 0);
      return today2230.getTime();
    })(),
  },
});

export const Storages = {
  lc_local,
};
