import React from 'react';
import { Route, Switch } from 'react-router-dom';

import { RoutePaths } from './RoutePaths';
import { Home } from '../home/Home';
import { Access } from '../access/Access';

export const Routes = () => (
  <Switch>
    <Route exact path={RoutePaths.HOME} component={Home} />
    <Route exact path={RoutePaths.ACCESS} component={Access} />
    <Route component={() => <div>not found</div>} />
  </Switch>
);
