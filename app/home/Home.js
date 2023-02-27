import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Link, useNavigate } from 'react-router-dom';
import { useLoggedUser } from 'meteor/quave:logged-user-react';
import { RoutePaths } from '../general/RoutePaths';

export const Home = () => {
  const navigate = useNavigate();
  const { loggedUser, isLoadingLoggedUser } = useLoggedUser();

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full justify-between">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
          <span className="block">Ready to use Meteor?</span>
          <span className="block text-indigo-600">Template by quave</span>
        </h2>

        <a
          target="_blank"
          href="https://www.quave.dev"
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-5 py-3 text-base font-medium text-white hover:bg-indigo-700"
        >
          Visit quave.dev
        </a>
      </div>

      <div className="mt-2 flex flex-col space-y-2">
        {loggedUser && <Link to={RoutePaths.PRIVATE}>See private page</Link>}
        <a
          onClick={() =>
            loggedUser ? Meteor.logout() : navigate(RoutePaths.ACCESS)
          }
          className={`cursor-pointer text-base font-medium text-indigo-700 hover:text-indigo-600 ${
            isLoadingLoggedUser ? 'invisible' : ''
          }`}
        >
          {loggedUser ? 'Log out' : 'Access'}
          <span aria-hidden="true"> &rarr;</span>
        </a>
      </div>
    </div>
  );
};
