import React, { useEffect } from 'react';
import { Route } from 'react-router-dom';
import { useAuth } from '../../providers/authProvider';

const ProtectedRoute = (props) => {
  const { isAuthenticated, loginWithRedirect } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      loginWithRedirect({ appState: { targetUrl: window.location.href }});
    }
  }, [isAuthenticated, loginWithRedirect]);

  return (
    <Route {...props} />
    );
};

export default ProtectedRoute;

/**
 * Reverse way of doing it
 *
import { Route as ReactRouterRoute, RouteProps } from 'react-router-dom';
import useRouter from 'use-react-router';
import { useAuth } from 'utils/authProvider';

export const AnonymousRoute = ReactRouterRoute;

const Route = (props: RouteProps): JSX.Element => {
  const { auth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.history.push('/user/sign-in');
    }
  }, [auth, router]);

  return <ReactRouterRoute {...props} />;
};
 */