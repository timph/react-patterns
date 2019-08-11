import React from 'react';
import logo from "../logo.svg";

export default function Main() {
  return (
    <div className="App">
      <header className="App-header">
        <p>React Patterns</p>
      </header>

      <ul>
        <li className="pattern-line-item"><a href='/logout'>Logout</a></li>
        <li className="pattern-line-item">
          <a href="/protected" rel="noopener noreferrer">
            Protected Route with Auth0
          </a>
        </li>
      </ul>
    </div>
  );
}
