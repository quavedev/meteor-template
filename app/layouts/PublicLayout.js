import React from 'react';
import { ConditionalLayout } from './ConditionalLayout';

export const PublicLayout = ({ children }) => (
  <ConditionalLayout>{children}</ConditionalLayout>
);
