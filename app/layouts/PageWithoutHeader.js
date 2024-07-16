import React from 'react';

export function PageWithoutHeader({ children }) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-12 sm:px-6 lg:items-center lg:justify-between lg:px-8 lg:py-24">
      {children}
    </div>
  );
}
