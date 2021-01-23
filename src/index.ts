import http from 'http';
import open from 'open';
import { dev } from './utils/env';

// Use `app#callback()` method here instead of directly
// passing `app` as an argument to `createServer` (or use `app#listen()` instead)
// @see https://github.com/koajs/koa/blob/master/docs/api/index.md#appcallback
let currentHandler = require('./server').default.callback();
const server = http.createServer(currentHandler);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  if (dev) {
    console.log(`🚀 [dev] browser opened at ${port}\n`);
    open(`http://localhost:${port}`);
  } else {
    console.log(`🚀 server started at ${port}\n`);
  }
});

if (module.hot) {
  console.info('✅  Server-side HMR Enabled!');

  module.hot.accept('./server', function () {
    console.log('🔁  HMR Reloading `./server`...');
    try {
      const newHandler = require('./server').default.callback();
      server.removeListener('request', currentHandler);
      server.on('request', newHandler);
      currentHandler = newHandler;
    } catch (error) {
      console.error(error);
    }
  });
}
