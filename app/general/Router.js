import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { RoutePaths } from './RoutePaths';
import { Home } from '../home/Home';
import { Access } from '../access/Access';
import { NotFound } from './NotFound';
import { Private } from '../private/Private';
import { PublicLayout } from '../layouts/PublicLayout';
import { AnonymousLayout } from '../layouts/AnonymousLayout';
import { LoggedLayout } from '../layouts/LoggedLayout';

export const Router = () => (
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
