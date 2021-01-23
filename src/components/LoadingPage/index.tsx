import NProgress from 'nprogress'; // progress bar
import 'nprogress/nprogress.css'; // progress bar style
import React, { useEffect } from 'react';

export default function Hhhh() {
  useEffect(() => {
    NProgress.start();

    return () => {
      NProgress.done();
    };
  }, []);

  return <div>{Array(100).fill(`Loading`).join('  •  ')}</div>;
}
