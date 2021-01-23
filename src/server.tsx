import App from './App';
import React from 'react';
import { StaticRouter } from 'react-router-dom';
import Koa from 'koa';
import serve from 'koa-static';
import Router from '@koa/router';
import { renderToString } from 'react-dom/server';
import { ChunkExtractor, ChunkExtractorManager } from '@loadable/server';
import path from 'path';

const router = new Router();
router.get('/(.*)', ctx => {
  // We create an extractor from the statsFile
  const extractor = new ChunkExtractor({
    statsFile: path.resolve('build/loadable-stats.json'),
    // razzle client bundle entrypoint is client.js
    entrypoints: ['client'],
  });

  const context: Record<any, any> = {};

  console.log('[ 🤣 ]:', ctx.url, ctx.url.length);

  const markup = renderToString(
    <ChunkExtractorManager extractor={extractor}>
      <StaticRouter context={context} location={ctx.url}>
        <App />
      </StaticRouter>
    </ChunkExtractorManager>
  );
  context.url && ctx.redirect(context.url);

  // collect script tags
  const scriptTags = extractor.getScriptTags();

  // collect "preload/prefetch" links
  const linkTags = extractor.getLinkTags();

  // collect style tags
  const styleTags = extractor.getStyleTags();

  ctx.status = 200;
  ctx.body = `
    <!doctype html>
      <html lang="">
      <head>
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta charset="utf-8" />
        <title>Welcome to Razzle + Koa</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        ${linkTags}
        ${styleTags}
      </head>
      <body>
        <div id="root">${markup}</div>
        ${scriptTags}
      </body>
    </html>`;
});

const server = new Koa();
server
  // Serve static files located under `process.env.RAZZLE_PUBLIC_DIR`
  .use(serve(process.env.RAZZLE_PUBLIC_DIR!))
  .use(router.routes())
  .use(router.allowedMethods());

export default server;
