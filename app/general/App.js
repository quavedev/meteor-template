import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Routes } from './Routes';
import { AlertProvider, Alert } from 'meteor/quave:alert-react-tailwind';

export const App = () => (
  <Router>
    <AlertProvider>
      <div className="h-full bg-indigo-50">
        <Alert />
        <div className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:flex lg:items-center lg:justify-between lg:py-24 lg:px-8">
          <Routes />
        </div>
      </div>
    </AlertProvider>
  </Router>
);
