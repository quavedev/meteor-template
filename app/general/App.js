import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Routes } from './Routes';
import { AlertProvider, Alert } from 'meteor/quave:alert-react-tailwind';

export const App = () => (
  <Router>
    <AlertProvider>
      <div className="bg-indigo-50 h-full">
        <Alert />
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-24 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <Routes />
        </div>
      </div>
    </AlertProvider>
  </Router>
);
