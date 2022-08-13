import React, { useContext, useEffect, useState } from 'react';
import { ClockContext } from '../Clock/exports';
import { MainRailMitt } from '../MainRail/exports';
import MiniRail from '../MiniRail';
import './styles.scss';

const FocusRail: React.FC = () => {
  const { nowShifted } = useContext(ClockContext);
  const [[startMark, endMark], setMark] = useState<[number, number] | []>([]);

  useEffect(() => {
    MainRailMitt.on('MARK', se => setMark(se));
    MainRailMitt.on('UNMARK', () => setMark([]));
  }, []);

  if (!startMark || !endMark) return null;

  return (
    <div className="focus-rail">
      <MiniRail now={nowShifted} startTime={startMark} endTime={endMark} />
    </div>
  );
};

export default FocusRail;
