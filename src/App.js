import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';
import ProtectedRoute from './components/common/protectedRoute';
import { useAuth } from './providers/authProvider';
import Main from './pages/main';
import ProtectedPage from "./pages/protected";

function App() {
  const { loading, logout } = useAuth();
  if (loading) {
    return <div>Loading</div>;
  }

  return (
    <Router>
      <Suspense fallback={<div>Loading</div>}>
        <Switch>
          <Route exact path='/'>
            <Main />
          </Route>
          <Route path='/logout'>
            {() => logout && logout()}
          </Route>
          <ProtectedRoute exact path='/protected'>
            <ProtectedPage />
          </ProtectedRoute>
        </Switch>
      </Suspense>
    </Router>
  );
}

export default App;
