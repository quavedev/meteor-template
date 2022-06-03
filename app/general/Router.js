import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { RoutePaths } from './RoutePaths';
import { Home } from '../home/Home';
import { Access } from '../access/Access';
import { NotFound } from './NotFound';

export const Router = () => (
  <Routes>
    <Route path={RoutePaths.HOME} element={<Home />} />
    <Route path={RoutePaths.ACCESS} element={<Access />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);
