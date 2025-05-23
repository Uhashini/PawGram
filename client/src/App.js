import React from "react";
import "./App.css"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUp from "./components/Auth/SignUp";
import Login from "./components/Auth/Login";
import PrivateRoute from "./components/Auth/PrivateRoute";
import { useAuth } from "./components/Auth/AuthContext";

const Home = () => {
  const { currentUser, logout } = useAuth();

  return (
    <div>
      <h1>Welcome to Pawgram! You are logged in.</h1>
      <p>Hello, {currentUser?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
<div className="App-logo">
  <img src="/logo.png"></img>
</div>
function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
