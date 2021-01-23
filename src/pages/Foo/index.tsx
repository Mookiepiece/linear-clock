import React from 'react';
import { Link } from 'react-router-dom';
import './Foo.css';

const Bar = () => <div></div>;

export default function Foo() {
  return (
    <div className="foo">
      <div>sadad</div>
      <Bar />
      <Link to="/">home</Link>
      <Link to="/foo">foo</Link>
    </div>
  );
}
