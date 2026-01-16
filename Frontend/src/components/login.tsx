import React, { useState } from 'react';
import { loginService } from '../services/login.service';
import { registerService } from '../services/reg.services'; // Import the register service
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // For registration
  const [phone, setPhone] = useState(''); // For registration
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // To toggle between login and registration
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const params = { email, password };
      const response = await loginService.Login(params);

      setError('');
      setMessage(response.message);
      navigate('/security-question');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const params = { 
        name, 
        email, 
        phone, 
        password,
        securityQuestion,
        securityAnswer 
      };
      const response = await registerService.Register(params);

      setError('');
      setMessage(response.message); // Show success message
      setIsRegistering(false); // Switch back to login form after successful registration
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="page-wrapper">
      <div className={`login-container ${isRegistering ? 'register' : ''}`}>
        <h2 className="login-heading">{isRegistering ? 'Register' : 'Login'}</h2>
        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="login-form">
          {isRegistering && (
            <>
              <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone:</label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label htmlFor="securityQuestion">Security Question:</label>
                <input
                  type="text"
                  id="securityQuestion"
                  value={securityQuestion}
                  onChange={(e) => setSecurityQuestion(e.target.value)}
                  required
                  className="input-field"
                  placeholder="e.g., What was your first pet's name?"
                />
              </div>
              <div className="form-group">
                <label htmlFor="securityAnswer">Security Answer:</label>
                <input
                  type="text"
                  id="securityAnswer"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  required
                  className="input-field"
                />
              </div>
            </>
          )}
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-field"
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          {message && <p className="success-message">{message}</p>}
          <button type="submit" className="login-button">
            {isRegistering ? 'Register' : 'Login'}
          </button>
        </form>
        <p className="toggle-form" onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? 'Already have an account? Login' : 'Don\'t have an account? Register'}
        </p>
      </div>
    </div>
  );
};
