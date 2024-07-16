import React from 'react';
import { ConditionalLayout } from './ConditionalLayout';

export function AnonymousLayout({ children }) {
  return <ConditionalLayout onlyAnonymous>{children}</ConditionalLayout>;
}
