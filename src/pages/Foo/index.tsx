import React from 'react';
import { Link } from 'react-router-dom';
import './Foo.scss';

const Bar = () => <div></div>;

console.log();

const Foo: React.FC = () => {
  return (
    <div className="foo">
      <div>sadad</div>
      <Bar />
      <Link to="/">home</Link>
      <Link to="/foo">foo</Link>
    </div>
  );
};

export default Foo;
