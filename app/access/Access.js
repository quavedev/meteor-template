import React from 'react';
import { useHistory } from 'react-router-dom';
import { Passwordless } from 'meteor/quave:accounts-passwordless-react';
import { useLoggedUser } from 'meteor/quave:logged-user-react';
import { useAlert } from 'meteor/quave:alert-react-tailwind';

import { RoutePaths } from '../general/RoutePaths';

// classnames tailwind passwordless:
// appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-sm font-medium text-gray-700 mt-0 flex justify-end text-indigo-600 hover:text-indigo-500 cursor-pointer justify-center px-4 border-transparent text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 bg-red-50 bg-green-50 p-4 text-red-800 text-green-800 ml-auto pl-3 -mx-1.5 -my-1.5 inline-flex p-1.5 text-red-500 text-green-500 hover:bg-red-100 bg-green-100 focus:ring-offset-red-50 ring-offset-green-50 focus:ring-red-600 ring-green-600 sr-only mt-8 sm:mx-auto sm:w-full sm:max-w-md bg-white py-8 shadow sm:rounded-lg sm:px-10 space-y-6 mt-1

export const Access = () => {
  const { openAlert } = useAlert();
  const { loggedUser } = useLoggedUser();
  const history = useHistory();

  const onEnterToken = () => {
    history.push(RoutePaths.HOME);
    openAlert('Welcome!');
  };

  if (loggedUser) {
    return (
      <div className="flex flex-col items-center">
        <h3 className="text-lg px-3 py-2 text-base font-medium">
          You are already authenticated.
        </h3>
        <button onClick={() => history.push(RoutePaths.HOME)} type="button">
          Go Home
        </button>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center flex-grow">
      <Passwordless onEnterToken={onEnterToken} />
      <a
        onClick={() => history.push(RoutePaths.HOME)}
        className="mt-5 text-base font-medium text-indigo-700 hover:text-indigo-600 cursor-pointer"
      >
        <span aria-hidden="true"> &rarr;</span> Back to Home
      </a>
    </div>
  );
};
