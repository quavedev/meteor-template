import React from 'react';
import { ConditionalLayout } from './ConditionalLayout';

export const LoggedLayout = ({ children }) => (
  <ConditionalLayout onlyLogged>{children}</ConditionalLayout>
);
