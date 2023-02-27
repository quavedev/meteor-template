import React from 'react';
import { useNavigate } from 'react-router-dom';

import { RoutePaths } from '../general/RoutePaths';

export const Private = () => {
  const navigate = useNavigate();

  const goHome = () => {
    navigate(RoutePaths.HOME);
  };

  return (
    <div className="flex flex-grow flex-col items-center">
      <h2 className="mt-48 text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
        <span className="block">You are in the private page</span>
        <div>
          <a
            onClick={goHome}
            className="mt-5 cursor-pointer text-base font-medium text-indigo-700 hover:text-indigo-600"
          >
            <span aria-hidden="true"> &larr;</span> Back to Home
          </a>
        </div>
      </h2>
    </div>
  );
};
