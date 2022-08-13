import $ from '@/utils/$';
import { TIMESTAMP_1H } from './constants';

export const hourMarksBetween = (
  _startTime: number | Date,
  _endTime: number | Date
): {
  hour: number;
  percentage: number;
}[] => {
  const [startTime, endTime] = [
    _startTime instanceof Date ? _startTime.getTime() : _startTime,
    _endTime instanceof Date ? _endTime.getTime() : _endTime,
  ];

  const oclocksWithPosition: { hour: number; percentage: number }[] = [];

  const d = new Date(startTime);
  d.setMinutes(0);
  d.setSeconds(0);
  d.setMilliseconds(0);

  while (d.getTime() <= endTime) {
    if (d.getTime() >= startTime) {
      oclocksWithPosition.push({
        hour: d.getHours(),
        percentage: $.round2(((d.getTime() - startTime) / (endTime - startTime)) * 100),
      });
    }
    d.setTime(d.getTime() + TIMESTAMP_1H);
  }

  return oclocksWithPosition;
};
