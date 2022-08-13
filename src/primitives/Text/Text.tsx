import clsx from 'clsx';
import React from 'react';
import './styles.scss';

type TextProps = {
  color?: 'pink';
  solid?: boolean;
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5;
};

export const Text: React.FC<TextProps> = ({ children, color, solid, level = 3 }) => {
  return (
    <span
      className={clsx(
        'lc-text color-primary-d',
        solid && 'lc-text--solid',
        `lc-text--color-${color}`,
        `lc-text--level-` + level
      )}
    >
      {children}
    </span>
  );
};
