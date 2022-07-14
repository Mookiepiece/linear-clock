import shims from '@/utils/shims';
import React, { useEffect, useState } from 'react';
import { MainRailMitt } from '../MainRail/exports';
import Rail from '../Rail';
import './styles.scss';

const FocusRail: React.FC = () => {
  const [[startMark, endMark], setMark] = useState<[number, number] | []>([]);

  useEffect(() => {
    MainRailMitt.on('MARK', se => setMark(se));
    MainRailMitt.on('UNMARK', () => setMark([]));
  }, []);

  if (!startMark || !endMark) return null;

  return (
    <div className="focus-rail">
      Focusing ({shims.print(startMark)} - {shims.print(endMark)})
      <br />
      <br />
      <Rail startTime={startMark} endTime={endMark} />
    </div>
  );
};

export default FocusRail;
