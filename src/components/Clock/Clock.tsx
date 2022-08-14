import { Storages } from '@/storages';
import { Box } from '@mookiepiece/strawberry-farm';
import { useStorage } from '@mookiepiece/strawberry-farm/shared';
import React, { useState, useEffect, useCallback } from 'react';
import { useMedia } from 'react-use';
import $ from '@/utils/$';
import DaySettings from '../DaySettings';
import FocusRail from '../FocusRail/FocusRail';
import MainRail from '../MainRail';
import { ClockContext } from './exports';
import './styles.scss';
import { TIMESTAMP_24H } from '@/utils/constants';
import { time } from '@/utils/time';

const useNow = () => {
  const [date, setDate] = useState(() => new Date());

  useEffect(() => {
    const i = setInterval(() => setDate(() => new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  const now = time.toTimestamp(time.create(date.getHours(), date.getMinutes(), date.getSeconds()));

  return now;
};

const Clock: React.FC = () => {
  const [{ dayStart, dayEnd }] = useStorage(Storages.lc_local);

  const now = useNow();

  const dayEndShifted = dayEnd + (dayEnd < dayStart ? TIMESTAMP_24H : 0);
  const nowShifted = now + (now < dayStart ? TIMESTAMP_24H : 0);
  const dayDuration = dayEndShifted - dayStart;

  const percentage2Timestamp = useCallback(
    (v: number) => (v / 100) * dayDuration + dayStart,
    [dayDuration, dayStart]
  );

  const timestamp2Percentage = useCallback(
    (t: number) => $.clamp($.round2(((t - dayStart) / dayDuration) * 100)),
    [dayStart, dayDuration]
  );

  const [focusPeriod, setFocusPeriod] = useState<[number | null, number | null]>([null, null]);

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

          percentage2Timestamp,
          timestamp2Percentage,
          focusPeriod,
          setFocusPeriod,
        }}
      >
        <MainRail />
        <Box horizontal={!sm} gap={10} align="center">
          <DaySettings />
          <FocusRail />
        </Box>
      </ClockContext.Provider>
    </div>
  );
};

export default Clock;
