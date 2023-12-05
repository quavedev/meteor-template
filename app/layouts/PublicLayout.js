import React from 'react';
import { ConditionalLayout } from './ConditionalLayout';

export function PublicLayout({ children }) {
  return <ConditionalLayout>{children}</ConditionalLayout>;
}
