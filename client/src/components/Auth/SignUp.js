import React, { useState } from "react";
import { auth } from "../../firebase"; // Adjust path if needed
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/");  // Redirect to homepage after signup success
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
    <div className="auth-box">
      <img src="/auth.png" alt="Pawgram logo" className="auth-logo"/>
    <form onSubmit={handleSubmit}>
      <h2>Sign Up</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <button type="submit">Sign Up</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>Already have an account? <a href="/login">Login</a>
</p>

    </form>
    </div>
    </div>
  );
};

export default SignUp;
