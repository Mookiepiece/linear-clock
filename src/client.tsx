import React from 'react';
import { hydrate } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { loadableReady } from '@loadable/component';
import App from './App';
import nProgress from 'nprogress';

nProgress.start();
loadableReady().then(() => {
  hydrate(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
    document.getElementById('root')
  );
  nProgress.done();
});

if (module.hot) {
  module.hot.accept();
}
