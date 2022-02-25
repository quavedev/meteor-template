import React from 'react';
import { Meteor } from 'meteor/meteor';
import { useHistory } from 'react-router-dom';
import { useLoggedUser } from 'meteor/quave:logged-user-react';
import { RoutePaths } from '../general/RoutePaths';

export const Home = () => {
  const history = useHistory();
  const { loggedUser, isLoadingLoggedUser } = useLoggedUser();

  return (
    <>
      <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
        <span className="block">Ready to use Meteor?</span>
        <span className="block text-indigo-600">Template by quave</span>

        <div>
          <a
            onClick={() =>
              loggedUser ? Meteor.logout() : history.push(RoutePaths.ACCESS)
            }
            className={`cursor-pointer text-base font-medium text-indigo-700 hover:text-indigo-600 ${
              isLoadingLoggedUser ? 'invisible' : ''
            }`}
          >
            {loggedUser ? 'Log out' : 'Access'}
            <span aria-hidden="true"> &rarr;</span>
          </a>
        </div>
      </h2>

      <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
        <div className="inline-flex rounded-md shadow">
          <a
            target="_blank"
            href="https://www.quave.dev"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-5 py-3 text-base font-medium text-white hover:bg-indigo-700"
          >
            Visit quave.dev
          </a>
        </div>
      </div>
    </>
  );
};
