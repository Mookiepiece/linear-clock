import shims from './shims';

const HOURS = [...Array(24).keys()];

export const hourMarksBetween = (
  _startTime: number | Date,
  _endTime: number | Date
): {
  hour: number;
  percentage: number;
}[] => {
  const [startTime, endTime] = [
    typeof _startTime === 'number' ? new Date(_startTime) : _startTime,
    typeof _endTime === 'number' ? new Date(_endTime) : _endTime,
  ];

  const d = new Date(startTime);
  d.setMinutes(0);
  d.setSeconds(0);
  d.setMilliseconds(0);

  const oclocks = HOURS.filter(t => {
    d.setHours(t);
    return d.getTime() >= startTime.getTime() && d.getTime() <= endTime.getTime();
  });

  const oclocksWithPosition = oclocks.map(hour => {
    d.setHours(hour);
    return {
      hour,
      percentage: shims.round2(
        ((d.getTime() - startTime.getTime()) / (endTime.getTime() - startTime.getTime())) * 100
      ),
    };
  });

  return oclocksWithPosition;
};
