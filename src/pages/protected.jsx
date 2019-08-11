import React from "react";

export default function ProtectedPage() {
  return (
    <div className="container-fluid">
      <div className="alert alert-primary" role="alert">
        Welcome to protected page! You are now authorized to access protected pages.
      </div>
      <div className="btn-group" role="group" aria-label="Menu">
        <a type="button" className="btn btn-primary nav-button" href="/">Dashboard</a>
        <a type="button" className="btn btn-primary nav-button" href="/logout">Logout</a>
      </div>
    </div>
  )  ;
}
