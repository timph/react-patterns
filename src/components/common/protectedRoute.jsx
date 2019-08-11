import React, { useEffect } from 'react';
import { Route } from 'react-router-dom';
import { useAuth } from '../../providers/authProvider';

const ProtectedRoute = ({
  children,
  path,
  exact = false,
  ...rest
}) => {
  const { isAuthenticated, loginWithRedirect } = useAuth();

  useEffect(() => {
    (async function() {
      if (!isAuthenticated && typeof loginWithRedirect === 'function') {
        // @ts-ignore
        await loginWithRedirect({
          appState: { targetUrl: window.location.href },
        });
      }
    })();
  }, [isAuthenticated, loginWithRedirect, path]);

  return (
    <Route path={path} exact={exact} {...rest}>
      {isAuthenticated && children}
    </Route>
  );
};

export default ProtectedRoute;
