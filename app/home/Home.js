import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Link, useNavigate } from 'react-router-dom';
import { useLoggedUser } from 'meteor/quave:logged-user-react';
import { RoutePaths } from '../general/RoutePaths';
import { useSubscribe, useFind } from 'meteor/react-meteor-data';
import { ClicksCollection } from '../clicks/ClicksCollection';

export const Home = () => {
  const navigate = useNavigate();
  const { loggedUser, isLoadingLoggedUser } = useLoggedUser();
  useSubscribe('countData');

  const documents = useFind(() => ClicksCollection.find(), []);

  const onCount = () => {
    Meteor.call('clicks.increment');
  };

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full flex-col items-center justify-between gap-2 text-center lg:flex-row lg:text-left">
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
      <div className="mt-12 flex w-full flex-col items-center space-y-2">
        <div className="text-lg font-bold text-indigo-700">Clicks</div>
        <div className="text-3xl font-semibold">{documents[0]?.count || 0}</div>
        <div>
          <button
            onClick={onCount}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-5 py-3 text-base font-medium text-white hover:bg-indigo-700"
          >
            Click to increment
          </button>
        </div>
        <div>
          coming from MongoDB <span className="text-green-700">clicks</span>{' '}
          collection
        </div>
      </div>

      <div className="mt-12 flex flex-col space-y-2">
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
