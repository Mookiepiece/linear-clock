import React, { useState, useEffect } from 'react';
import './styles.scss';

const now = () => {
  const now = new Date();
  const today0800 = new Date(now);
  today0800.setHours(8, 0, 0, 0);
  const today2230 = new Date(now);
  today2230.setHours(22, 30, 0, 0);

  return {
    now,
    today0800,
    today2230,
  };
};

const Clock = () => {
  const [time, setTime] = useState(now);

  useEffect(() => {
    const i = setInterval(() => setTime(now), 1000);
    return () => clearInterval(i);
  }, []);

  const d2230_0800 = time.today2230.getTime() - time.today0800.getTime();
  const dnow_0800 = time.now.getTime() - time.today0800.getTime();
  const d2230_now = time.today2230.getTime() - time.now.getTime();

  const point2time = (v: number) => {
    return (v / 100) * d2230_0800;
  };

  const time2point = (t: number) => {
    return (t / d2230_0800) * 100;
  };

  return (
    <div className="clock">
      <div className="lines-wrap">
        <div
          className="line-wrap"
          style={
            {
              '--clock-color': '#f7ac53',
              width: `${time2point(dnow_0800)}%`,
            } as React.CSSProperties
          }
        >
          <div className="line"></div>
        </div>
        <div
          className="line-wrap"
          style={
            {
              '--clock-color': '#85ffad',
              width: `${time2point(d2230_now)}%`,
            } as React.CSSProperties
          }
        >
          <div className="line"></div>
        </div>
      </div>
      <div className="time-label">{time.now.toLocaleTimeString()}</div>
    </div>
  );
};

export default Clock;
