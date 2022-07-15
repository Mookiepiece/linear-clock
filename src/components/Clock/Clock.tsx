import { Storages } from '@/storages';
import { useStorage } from '@/utils/versionedStorage';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import shims from '../../utils/shims';
import DaySettings from '../DaySettings';
import FocusRail from '../FocusRail/FocusRail';
import MainRail from '../MainRail';
import { ClockContext, ClockFnContext } from './exports';
import './styles.scss';

const Clock: React.FC = () => {
  const [{ day_end, day_start }, setLocalStorage] = useStorage(Storages.lc_local);

  const [dayStart, setDayStart] = useState(day_start);
  const [dayEnd, setDayEnd] = useState(day_end);

  useEffect(() => {
    setLocalStorage({
      day_start: dayStart,
      day_end: dayEnd,
    });
  }, [dayStart, dayEnd, setLocalStorage]);

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

  const d2230_0800 = dayEnd - dayStart;

  const point2time = useCallback(
    (v: number) => {
      return (v / 100) * d2230_0800 + dayStart;
    },
    [d2230_0800, dayStart]
  );

  const time2point = useCallback(
    (t: number) => {
      return shims.clamp(shims.round2(((t - dayStart) / d2230_0800) * 100));
    },
    [dayStart, d2230_0800]
  );

  const nowPercentage = time2point(now);

  const clockFnContextValue = useMemo(
    () => ({
      point2time,
      time2point,
    }),
    [point2time, time2point]
  );

  return (
    <div className="clock">
      <ClockContext.Provider
        value={{
          dayStart,
          dayEnd,
          now,
          nowPercentage,
        }}
      >
        <ClockFnContext.Provider value={clockFnContextValue}>
          <MainRail />

          <div
            style={{
              paddingTop: 16,
            }}
          >
            <DaySettings
              initialValue={[dayStart, dayEnd]}
              onChange={useCallback(([ds, de]) => {
                setDayStart(ds);
                setDayEnd(de);
              }, [])}
            />
          </div>
          <FocusRail />
        </ClockFnContext.Provider>
      </ClockContext.Provider>
    </div>
  );
};

export default Clock;
