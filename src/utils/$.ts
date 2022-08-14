const $ = {
  clamp: (v: number, min = 0, max = 100): number => Math.max(min, Math.min(max, v)),
  round2: (v: number): number => Math.round(v * 100) / 100,
};

export default $;
