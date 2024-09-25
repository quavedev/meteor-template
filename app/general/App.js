import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Router } from './Router';
import { AlertProvider, Alert } from 'meteor/quave:alert-react-tailwind';
import { Loading } from '../components/Loading';
import { PageWithHeader } from '../layouts/PageWithHeader';
import { MyAlert } from '../components/MyAlert';

export function App() {
  return (
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
            <Alert Component={MyAlert} />
            <Router />
          </div>
        </AlertProvider>
      </Suspense>
    </BrowserRouter>
  );
}
