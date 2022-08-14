import { time } from '@/utils/time';
import { versionedStorage } from '@mookiepiece/strawberry-farm/shared';

const lc_local = versionedStorage<{
  dayStart: number;
  dayEnd: number;
  snapping: number;
}>({
  root: 'lc_local',
  storage: localStorage,
  version: 3,
  initialValue: {
    dayStart: time.toTimestamp(time.create(6, 30)),
    dayEnd: time.toTimestamp(time.create(22, 30)),
    snapping: 15,
  },
});

export const Storages = {
  lc_local,
};
