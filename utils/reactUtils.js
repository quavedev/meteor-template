import { lazy } from 'react';

export const lazyNamed = (callImport, name) =>
  lazy(() => callImport().then((module) => ({ default: module[name] })));
