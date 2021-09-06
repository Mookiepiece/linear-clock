export default {
  clamp: (v: number, min = 0, max = 100): number => Math.max(min, Math.min(max, v)),
  round2: (v: number): number => Math.round(v * 100) / 100,
  print(_time: number | Date, format: 'HM' | 'HMS' = 'HM'): string {
    const time = typeof _time === 'number' ? new Date(_time) : _time;

    return [time.getHours(), time.getMinutes(), format === 'HMS' ? time.getSeconds() : 'null']
      .filter(v => v !== 'null')
      .map(v => v.toString().padStart(2, '0'))
      .join(':');
  },
};
