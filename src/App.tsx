import React from 'react';
import { Route, Switch } from 'react-router-dom';
import './App.css';
import LoadingPage from './components/LoadingPage';
import loadable from '@loadable/component';

const LoadableHome = loadable(() => import('./pages/Home'), { fallback: <LoadingPage /> });
const LoadableFoo = loadable(() => import('./pages/Foo'), { fallback: <LoadingPage /> });

const App = () => (
  <Switch>
    <Route exact path="/" component={LoadableHome} />
    <Route exact path="/foo" component={LoadableFoo} />
  </Switch>
);

export default App;
