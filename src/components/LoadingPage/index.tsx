import NProgress from 'nprogress'; // progress bar
import 'nprogress/nprogress.css'; // progress bar style
import React, { useEffect } from 'react';

const LoadingPage: React.FC = () => {
  useEffect(() => {
    NProgress.start();

    return () => {
      NProgress.done();
    };
  }, []);

  return <div>{Array(100).fill(`Loading`).join('  •  ')}</div>;
};

export default LoadingPage;
