import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Router } from './Router';
import { AlertProvider, Alert } from 'meteor/quave:alert-react-tailwind';
import { Loading } from '../components/Loading';
import { PageWithHeader } from '../layouts/PageWithHeader';

export const App = () => (
  <BrowserRouter>
    <Suspense
      fallback={
        <PageWithHeader>
          <Loading name="suspense" />
        </PageWithHeader>
      }
    >
      <AlertProvider>
        <div className="h-full bg-indigo-50 p-4 lg:p-24">
          <Alert />
          <Router />
        </div>
      </AlertProvider>
    </Suspense>
  </BrowserRouter>
);
