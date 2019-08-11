import React, { useState, useEffect, useContext, Children } from 'react';
import createAuth0Client from '@auth0/auth0-spa-js';

const defaultRedirectCallback = (appState) => {
  window.history.replaceState(
    {},
    document.title,
    (appState && appState.targetUrl) || window.location.pathname
  );
};

const loadUser = async (authUser, token) => {
  const userId = authUser.sub.slice('auth0|'.length);
  const response = await fetch(
    `${process.env.REACT_APP_SERVER_HOST}/api/user/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    }
  );
  const userData = await response.json();
  return { ...authUser, ...(await userData) };
};

export const AuthContext = React.createContext({});
export const useAuth = () => useContext(AuthContext);
export function AuthenticationProvider({
  onRedirectCallback = defaultRedirectCallback,
  domain = process.env.REACT_APP_AUTH0_DOMAIN || '',
  clientId = process.env.REACT_APP_CLIENT_ID || '',
  redirectUri = window.location.origin,
  children,
}) {
  const [auth0Client, setAuth0Client] = useState();
  const [isAuthenticated, setIsAuthenticated] = useState();
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // if we are offline for development
    if (!navigator.onLine) {
      setLoading(false);
      setIsAuthenticated(true);
      setAuth0Client({});
      setUser({ name: 'Off Liner', email: 'user@offline.com' });
      return;
    }

    (async function() {
      const auth0FromHook = await createAuth0Client({
        domain: domain,
        client_id: clientId,
        redirect_uri: redirectUri,
      });
      setAuth0Client(auth0FromHook); // set auth0Client to auth0 client hook

      // Check for success url that came back from auth0
      if (window.location.search.includes('code=')) {
        try {
          const { appState } = await auth0FromHook.handleRedirectCallback();
          onRedirectCallback(appState);
        } catch (err) {
          // Do not reload the page
          onRedirectCallback(null);
        }
      }

      const isAuthenticated = await auth0FromHook.isAuthenticated();
      setIsAuthenticated(isAuthenticated);

      if (isAuthenticated) {
        const token = await auth0FromHook.getTokenSilently();
        let user = await auth0FromHook.getUser();
        try {
          // user overloaded with data from our own
          user = await loadUser(user, token);
        } catch (err) {
          console.error(`Error loading additional user data: ${err}`);
        }
        setUser(user);
      }

      setLoading(false);
    })();
    // eslint-disable-next-line
  }, []);

  const handleRedirectCallback = async () => {
    setLoading(true);
    await auth0Client.handleRedirectCallback();
    const user = await auth0Client.getUser();
    setLoading(false);
    setIsAuthenticated(true);
    setUser(user);
  };

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        isAuthenticated,
        user,
        loading,
        handleRedirectCallback,
        getIdTokenClaims: (...p) => auth0Client.getIdTokenClaims(...p),
        loginWithRedirect: (...p) => auth0Client.loginWithRedirect(...p),
        getTokenSilently: (...p) => auth0Client.getTokenSilently(...p),
        getTokenWithPopup: (...p) => auth0Client.getTokenWithPopup(...p),
        logout: (...p) => auth0Client.logout(...p),
      },
    },
    Children.only(children)
  );
}
