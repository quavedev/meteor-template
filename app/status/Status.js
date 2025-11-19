import React from 'react';
import { Link } from 'react-router-dom';
import { ServerStatus } from '../components/ServerStatus';
import { RoutePaths } from '../general/RoutePaths';

export function Status() {
  return (
    <div>
      <div className="mb-6">
        <Link
          to={RoutePaths.HOME}
          className="text-base font-medium text-indigo-700 hover:text-indigo-500"
        >
          &larr; Back to Home
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Server Status</h1>
      <ServerStatus />
    </div>
  );
}
