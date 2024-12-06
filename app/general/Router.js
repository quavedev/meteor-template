import React from 'react';
import { Route, Routes } from 'react-router';

import { RoutePaths } from './RoutePaths';
import { Home } from '../home/Home';
import { Access } from '../access/Access';
import { NotFound } from './NotFound';
import { PublicLayout } from '../layouts/PublicLayout';
import { AnonymousLayout } from '../layouts/AnonymousLayout';
import { LoggedLayout } from '../layouts/LoggedLayout';
import { lazyNamed } from '../../utils/reactUtils';

const Private = lazyNamed(() => import('../private/Private'), 'Private');

export function Router() {
  return (
    <Routes>
      <Route
        path={RoutePaths.HOME}
        element={
          <PublicLayout>
            <Home />
          </PublicLayout>
        }
      />
      <Route
        path={RoutePaths.ACCESS}
        element={
          <AnonymousLayout>
            <Access />
          </AnonymousLayout>
        }
      />
      <Route
        path={RoutePaths.PRIVATE}
        element={
          <LoggedLayout>
            <Private />
          </LoggedLayout>
        }
      />
      <Route
        path="*"
        element={
          <PublicLayout>
            <NotFound />
          </PublicLayout>
        }
      />
    </Routes>
  );
}
