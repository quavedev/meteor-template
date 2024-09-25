import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Passwordless } from 'meteor/quave:accounts-passwordless-react';

import { RoutePaths } from '../general/RoutePaths';

export function Access() {
  const navigate = useNavigate();

  const onEnterToken = () => {
    navigate(RoutePaths.PRIVATE);
  };

  return (
    <div className="flex w-full flex-col items-center">
      <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
        <span className="block">Access</span>
      </h2>
      <Passwordless onEnterToken={onEnterToken} />
      <a
        onClick={() => navigate(RoutePaths.HOME)}
        className="mt-5 cursor-pointer text-base font-medium text-indigo-700 hover:text-indigo-600"
      >
        <span aria-hidden="true"> &larr;</span> Back to Home
      </a>
    </div>
  );
}
