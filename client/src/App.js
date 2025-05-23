import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUp from "./components/Auth/SignUp";
import Login from "./components/Auth/Login";
import PrivateRoute from "./components/Auth/PrivateRoute";
import { useAuth } from "./components/Auth/AuthContext";
import CreatePost from "./components/Post/CreatePost";

const Home = () => {
  const { currentUser, logout } = useAuth();

  return (
    <div className="home-container">
      <header className="App-header">
        <img src="/logo.png" alt="Pawgram Logo" className="App-logo" />
        <button onClick={logout} class="logout-button">Logout</button>
        <p class="username">{currentUser?.email}</p>
      </header>
      <h1>Welcome to Pawgram! You are logged in.</h1>
      <p>Hello, {currentUser?.email}</p>
    
      <center><CreatePost /></center>
    </div>
  );
};

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
