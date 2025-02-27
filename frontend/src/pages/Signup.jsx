import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';

const FormContainer = styled.div`max-width: 400px; margin: 50px auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;`;
const ErrorMessage = styled.p`color: red; font-size: 0.9rem; margin-top: 10px;`;

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/users/signup', { username, email, password });
      console.log('Signup successful:', res.data);
      navigate('/login');
    } catch (err) {
      if (err.response) {
        switch (err.response.status) {
          case 400: setError('Please fill in all required fields'); break;
          case 409: setError('Username or email already exists'); break;
          case 500: setError('Server error - please try again later'); break;
          default: setError('Signup failed - please check your details');
        }
      } else {
        setError('Network error - please check your connection');
      }
      console.error('Signup error:', err.response || err.message);
    }
  };

  return (
    <FormContainer>
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Sign Up</button>
      </form>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <p>Already have an account? <Link to="/login">Login here</Link></p>
    </FormContainer>
  );
};

export default Signup;