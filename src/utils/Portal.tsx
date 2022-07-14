/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type React from 'react';
import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/index';

let starfallModalRoot: HTMLDivElement | null = null;
let starfallNotificationRoot: HTMLDivElement | null = null;

export const setup = (key: 'Modal' | 'Notification'): HTMLDivElement => {
  if (!starfallModalRoot || !starfallNotificationRoot) {
    starfallModalRoot = document.createElement('div');
    starfallModalRoot.style.position = 'fixed';
    starfallModalRoot.style.height = '0';
    starfallModalRoot.style.top = '0';
    starfallModalRoot.classList.add('starfallModalRoot');
    document.body.appendChild(starfallModalRoot);

    starfallNotificationRoot = document.createElement('div');
    starfallNotificationRoot.style.position = 'fixed';
    starfallNotificationRoot.style.height = '0';
    starfallNotificationRoot.style.top = '0';
    starfallNotificationRoot.classList.add('starfallNotificationRoot');
    document.body.appendChild(starfallNotificationRoot);
  }

  return {
    Modal: starfallModalRoot,
    Notification: starfallNotificationRoot,
  }[key];
};

export const Portal: React.FC = ({ children }) => {
  const isMounted = useMountedStatePlus();
  return isMounted ? ReactDOM.createPortal(children, setup('Modal')) : null;
};

export const NotificationPortal: React.FC = ({ children }) => {
  const isMounted = useMountedStatePlus();
  return isMounted ? ReactDOM.createPortal(children, setup('Notification')) : null;
};

export const useMountedStatePlus = (): boolean => {
  const [state, setState] = useState(false);

  useEffect(() => {
    setState(true);
  }, []);

  return state;
};
