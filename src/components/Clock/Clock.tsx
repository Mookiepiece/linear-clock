import { Storages } from '@/storages';
import { Box } from '@mookiepiece/strawberry-farm';
import { useStorage } from '@mookiepiece/strawberry-farm/shared';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useMedia } from 'react-use';
import $ from '@/utils/$';
import DaySettings from '../DaySettings';
import FocusRail from '../FocusRail/FocusRail';
import MainRail from '../MainRail';
import { ClockContext, ClockFnContext } from './exports';
import './styles.scss';
import { TIMESTAMP_24H } from '@/utils/constants';

const Clock: React.FC = () => {
  const [{ dayStart, dayEnd }] = useStorage(Storages.lc_local);

  const [time, setTime] = useState(() => new Date(0));

  useEffect(() => {
    const i = setInterval(
      () =>
        setTime(
          () =>
            new Date(
              ((new Date().getTime() + 1000 * 60 * 60 * 8) % (1000 * 60 * 60 * 24)) -
                1000 * 60 * 60 * 8
            )
        ),
      1000
    );
    return () => clearInterval(i);
  }, []);
  const now = time.getTime();

  const dayEndShifted = dayEnd + (dayEnd < dayStart ? TIMESTAMP_24H : 0);
  const nowShifted = now + (now < dayStart ? TIMESTAMP_24H : 0);

  const dayDuration = dayEndShifted - dayStart;

  const point2time = useCallback(
    (v: number) => {
      return (v / 100) * dayDuration + dayStart;
    },
    [dayDuration, dayStart]
  );

  const time2point = useCallback(
    (t: number) => {
      return $.clamp($.round2(((t - dayStart) / dayDuration) * 100));
    },
    [dayStart, dayDuration]
  );

  const clockFnContextValue = useMemo(
    () => ({
      point2time,
      time2point,
    }),
    [point2time, time2point]
  );

  const sm = useMedia('(mim-width: 576px)');

  return (
    <div className="clock">
      <ClockContext.Provider
        value={{
          dayStart,
          dayEnd,
          dayEndShifted,
          now,
          nowShifted,
        }}
      >
        <ClockFnContext.Provider value={clockFnContextValue}>
          <MainRail />

          <Box horizontal={!sm} gap={10} align="center">
            <DaySettings />
            <FocusRail />
          </Box>
        </ClockFnContext.Provider>
      </ClockContext.Provider>
    </div>
  );
};

export default Clock;
