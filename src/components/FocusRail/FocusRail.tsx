import React, { useContext } from 'react';
import { ClockContext } from '../Clock/exports';
import MiniRail from '../MiniRail';
import './styles.scss';

const FocusRail: React.FC = () => {
  const {
    nowShifted,
    focusPeriod: [focusPeriodStart, focusPeriodEnd],
  } = useContext(ClockContext);

  if (!focusPeriodStart || !focusPeriodEnd || focusPeriodStart === focusPeriodEnd) return null;

  return (
    <div className="focus-rail">
      <MiniRail now={nowShifted} startTime={focusPeriodStart} endTime={focusPeriodEnd} />
    </div>
  );
};

export default FocusRail;
