import React from 'react';
import { useLoggedUser } from 'meteor/quave:logged-user-react';
import { Navigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { RoutePaths } from '../general/RoutePaths';
import { Loading } from '../components/Loading';
import { ErrorFallback } from '../components/ErrorFallback';
import { PageWithHeader } from './PageWithHeader';
import { PageWithoutHeader } from './PageWithoutHeader';

const InnerLayout = ({ children, onlyLogged, onlyAnonymous }) => {
  const { loggedUser, isLoadingLoggedUser } = useLoggedUser();

  if (isLoadingLoggedUser) {
    // you should return here your default skeleton layout
    return (
      <PageWithHeader>
        <Loading name="logged user" />
      </PageWithHeader>
    );
  }

  if (onlyLogged) {
    if (!loggedUser) {
      return <Navigate to={RoutePaths.ACCESS} replace />;
    }
    return <PageWithHeader>{children}</PageWithHeader>;
  }

  if (onlyAnonymous) {
    if (loggedUser) {
      return <Navigate to={RoutePaths.PRIVATE} replace />;
    }
    return <PageWithoutHeader>{children}</PageWithoutHeader>;
  }

  return <PageWithoutHeader>{children}</PageWithoutHeader>;
};

export const ConditionalLayout = ({ ...props }) => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <InnerLayout {...props} />
  </ErrorBoundary>
);
