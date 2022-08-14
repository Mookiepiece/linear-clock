import $ from '@/utils/$';
import { time } from './time';

export const hourMarksBetween = (
  startTime: number,
  endTime: number
): {
  hour: number;
  percentage: number;
}[] => {
  const oclocksWithPosition: { hour: number; percentage: number }[] = [];

  const d = time.create(time.fromTimeStamp(startTime).hour);

  while (time.toTimestamp(d) <= endTime) {
    if (time.toTimestamp(d) >= startTime) {
      oclocksWithPosition.push({
        hour: d.hour,
        percentage: $.round2(((time.toTimestamp(d) - startTime) / (endTime - startTime)) * 100),
      });
    }
    d.hour += 1;
  }

  return oclocksWithPosition;
};
