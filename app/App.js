import React from 'react';

export const App = () => (
  <div className="bg-indigo-50 h-full">
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-24 lg:px-8 lg:flex lg:items-center lg:justify-between">
      <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
        <span className="block">Ready to use Meteor?</span>
        <span className="block text-indigo-600">Template by quave</span>
      </h2>
      <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
        <div className="inline-flex rounded-md shadow">
          <a
            target="_blank"
            href="https://www.quave.dev"
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Visit quave.dev
          </a>
        </div>
      </div>
    </div>
  </div>
);
