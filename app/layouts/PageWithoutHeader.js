import React from 'react';

export const PageWithoutHeader = ({ children }) => (
  <div className="mx-auto flex w-full max-w-7xl flex-col py-12 px-4 sm:px-6 lg:items-center lg:justify-between lg:py-24 lg:px-8">
    {children}
  </div>
);
