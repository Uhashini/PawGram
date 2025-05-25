import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUp from "./components/Auth/SignUp";
import Login from "./components/Auth/Login";
import PrivateRoute from "./components/Auth/PrivateRoute";
import { useAuth } from "./components/Auth/AuthContext";
import CreatePost from "./components/Post/CreatePost";
import PostFeed from "./components/Post/PostFeed";
import UserProfile from "./components/User/UserProfile";
import { Link } from "react-router-dom";


const Home = () => {
  const { currentUser, logout } = useAuth();

  return (
    <div className="home-container">
      <header className="App-header">
        <img src="/logo.png" alt="Pawgram Logo" className="App-logo" />
        
        <div className="header-right">
          <Link to={`/profile/${currentUser?.email}`} className="user-profile-link">
            <img src="/default-user-icon.png" alt="Profile" className="user-icon" />
          </Link>

          <button onClick={logout} className="logout-button">Logout</button>
        </div>
        
        <p className="username">{currentUser?.email}</p>
      </header>

      <h1>Welcome to Pawgram! You are logged in.</h1>
      <p>Hello, {currentUser?.email}</p>
      <PostFeed />
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
        <Route path="/profile/:userId" element={<UserProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
