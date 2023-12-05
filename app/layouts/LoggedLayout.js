import React from 'react';
import { ConditionalLayout } from './ConditionalLayout';

export function LoggedLayout({ children }) {
  return <ConditionalLayout onlyLogged>{children}</ConditionalLayout>;
}
