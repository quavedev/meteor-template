import { useNavigate } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { RoutePaths } from '../general/RoutePaths';
import React from 'react';

export const ErrorFallback = ({ error, resetErrorBoundary }) => {
  const navigate = useNavigate();

  return (
    <div role="alert">
      {Meteor.isDevelopment && (
        <div className="bg-white pl-10 pt-10">
          <p>DEV ONLY!</p>
          <p>Something went wrong:</p>
          <pre>{error.message}</pre>
          <button onClick={resetErrorBoundary}>Try again</button>
        </div>
      )}
      <div className="mt-16 mb-4 flex w-full flex-col items-center justify-center space-y-16">
        <div>
          <a
            onClick={() => {
              resetErrorBoundary();
              navigate(RoutePaths.HOME);
            }}
          >
            Home
          </a>
        </div>
        <div>An error happened. Contact support please!</div>
      </div>
    </div>
  );
};
