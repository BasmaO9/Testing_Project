import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});

const SecurityQuestion = () => {
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the security question when component mounts
    const fetchSecurityQuestion = async () => {
      try {
        const response = await api.get('/api/auth/security-question');
        setSecurityQuestion(response.data.question);
      } catch (err: any) {
        setError('Failed to fetch security question');
        console.error(err);
      }
    };

    fetchSecurityQuestion();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/auth/verify-security-question', { answer });
      if (response.data.verified) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError('Incorrect answer. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="login-container">
        <h2 className="login-heading">Security Verification</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="securityQuestion">Security Question:</label>
            <p className="security-question">{securityQuestion}</p>
          </div>
          <div className="form-group">
            <label htmlFor="answer">Your Answer:</label>
            <input
              type="text"
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
              className="input-field"
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-button">
            Verify
          </button>
        </form>
      </div>
    </div>
  );
};

export default SecurityQuestion; 