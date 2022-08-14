export type Time = {
  hour: number;
  minute: number;
  second: number;
};

export const time = {
  create: (hour: number, minute = 0, second = 0): Time => ({ hour, minute, second }),
  toTimestamp: (t: Time): number => ((t.hour * 60 + t.minute) * 60 + t.second) * 1000,
  fromTimeStamp: (timestamp: number): Time =>
    time.create(
      Math.floor(timestamp / 3600000),
      Math.floor((timestamp % 3600000) / 60000),
      (timestamp % 60000) / 1000
    ),
  print(time: Time, format: 'HM' | 'HMS' = 'HM'): string {
    return [time.hour % 24, time.minute, format === 'HMS' ? time.second : 'null']
      .filter(v => v !== 'null')
      .map(v => v.toString().padStart(2, '0'))
      .join(':');
  },
};
