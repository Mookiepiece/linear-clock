import clsx from 'clsx';
import React from 'react';
import './styles.scss';

type TextProps = {
  color?: 'pink';
  solid?: boolean;
};

const Text: React.FC<TextProps> = ({ children, color, solid }) => {
  return (
    <span
      className={clsx(
        'lc-text color-primary-d',
        solid && 'lc-text--solid',
        `lc-text--color-${color}`
      )}
    >
      {children}
    </span>
  );
};

export default Text;
