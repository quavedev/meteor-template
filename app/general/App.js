import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Router } from './Router';
import { AlertProvider, Alert } from 'meteor/quave:alert-react-tailwind';

export const App = () => (
  <BrowserRouter>
    <AlertProvider>
      <div className="h-full bg-indigo-50">
        <Alert />
        <div className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:flex lg:items-center lg:justify-between lg:py-24 lg:px-8">
          <Router />
        </div>
      </div>
    </AlertProvider>
  </BrowserRouter>
);
