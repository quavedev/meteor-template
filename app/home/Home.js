import React from 'react';
import { Meteor } from 'meteor/meteor';
import { useNavigate } from 'react-router-dom';
import { useLoggedUser } from 'meteor/quave:logged-user-react';
import { RoutePaths } from '../general/RoutePaths';
import { useSubscribe, useFind } from 'meteor/react-meteor-data';
import { ClicksCollection } from '../clicks/ClicksCollection';
import { useAlert } from 'meteor/quave:alert-react-tailwind';
import { Button } from '../components/Button';

export function Home() {
  const { openAlert } = useAlert();
  const navigate = useNavigate();
  const { loggedUser, isLoadingLoggedUser } = useLoggedUser();

  useSubscribe('countData');

  const documents = useFind(() => ClicksCollection.find(), []);

  const onCount = async () => {
    try {
      await Meteor.callAsync('clicks.increment');
      openAlert('Incremented!');
    } catch (e) {
      openAlert(e.reason);
    }
  };
  const onDouble = async () => {
    try {
      await Meteor.callAsync('clicks.doubleIncrementGmail');
      openAlert('Incremented by 2!');
    } catch (e) {
      openAlert(e.reason);
    }
  };

  const onInvalidUpdate = async () => {
    try {
      await Meteor.callAsync('clicks.invalidUpdate');
    } catch (e) {
      openAlert(e.reason);
    }
  };

  const clickDocument = documents[0];
  return (
    <div>
      <div className="flex w-full flex-col items-center justify-between gap-2 text-center lg:flex-row lg:text-left">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
          <span className="block">
            Ready to use Meteor{' '}
            {window.__meteor_runtime_config__.meteorRelease.replace(
              'METEOR@',
              ''
            )}
            ?
          </span>
          <span className="block text-indigo-600">Template by quave</span>
        </h2>
      </div>
      <main>
        <div className="mt-12 flex w-full flex-col items-center space-y-2">
          <div className="text-lg font-bold text-indigo-700">Clicks</div>
          <div className="text-3xl font-semibold">
            {clickDocument?.getCountText() || 'No clicks yet'}
          </div>
          {clickDocument && (
            <div className="text-sm italic text-gray-500">
              (I'm using a collection helper)
            </div>
          )}
          <div className="flex flex-col gap-4">
            <Button onClick={onCount}>Click to increment now</Button>
            {loggedUser && (
              <Button onClick={onDouble}>
                Click to double increment (only for Gmail)
              </Button>
            )}
            <Button onClick={onInvalidUpdate} tertiary>
              Send invalid update
            </Button>
          </div>
          <div>
            coming from MongoDB <span className="text-green-700">clicks</span>{' '}
            collection
          </div>
          {loggedUser && (
            <>
              <div className="text-lg font-bold">
                Logged as {loggedUser.emails[0].address}
              </div>
              <Button secondary onClick={() => navigate(RoutePaths.PRIVATE)}>
                Go to private page
              </Button>
            </>
          )}
          <a
            onClick={() =>
              loggedUser ? Meteor.logout() : navigate(RoutePaths.ACCESS)
            }
            className={`cursor-pointer text-base font-medium text-indigo-700 hover:text-indigo-500 ${
              isLoadingLoggedUser ? 'invisible' : ''
            }`}
          >
            {loggedUser ? 'Log out' : 'Access'}
            <span aria-hidden="true"> &rarr;</span>
          </a>
        </div>
      </main>

      <footer className="mt-8 py-4">
        <div className="container mx-auto text-center">
          <a
            href="https://www.quave.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer text-base font-medium text-indigo-700 hover:text-indigo-500"
          >
            quave.dev
          </a>
        </div>
      </footer>
    </div>
  );
}
