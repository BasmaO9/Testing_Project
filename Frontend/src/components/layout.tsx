
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoutService from '../services/logout.service'; // Your logout service
import { useEffect } from 'react';




interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(false);
  const [confirmLogout, setConfirmLogout] = useState<boolean>(false);
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'bot'; text: string }[]>([]);
  const [userInput, setUserInput] = useState('');
  const navigate = useNavigate();

  // Inside Layout component
    useEffect(() => {
      const savedHistory = localStorage.getItem('chatHistory');
      if (savedHistory) {
        setChatHistory(JSON.parse(savedHistory));
      }
    }, []);

    useEffect(() => {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }, [chatHistory]);


  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const handleLogoutClick = () => {
    setConfirmLogout(true);
  };

  const handleLogoutConfirmation = async (confirm: boolean) => {
    if (confirm) {
      try {
        await logoutService();
        navigate('/login');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
    setConfirmLogout(false);
  };

  const toggleChat = () => {
    setChatOpen(!chatOpen);
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = { sender: "user", text: userInput } as const;
    setChatHistory((prev) => [...prev, userMessage]);

    const input = userInput;
    setUserInput('');

    try {
      const botReply = await fetchBotResponse(input);
      setChatHistory((prev) => [...prev, { sender: 'bot', text: botReply }]);
    } catch (error) {
      console.error('Error getting bot reply:', error);
      setChatHistory((prev) => [
        ...prev,
        { sender: 'bot', text: 'Sorry, something went wrong.' },
      ]);
    }
  };

  const fetchBotResponse = async (message: string): Promise<string> => {
    const response = await fetch('http://localhost:3000/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }), // match your backend `message` key
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to fetch bot response.');
    }

    const data = await response.json();
    return data.response;
  };

  return (
    <div className="layout pastel-theme">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarVisible ? 'visible' : ''}`}>
        <ul className="sidebar-list">
          <li className="sidebar-item" onClick={() => navigate('/dashboard')}>Dashboard</li>
          <li className="sidebar-item" onClick={() => navigate('/transactions')}>Transactions</li>
          <li className="sidebar-item" onClick={() => navigate('/recommendations')}>Budgets</li>
          <li className="sidebar-item" onClick={handleLogoutClick}>Logout</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="content">
        {children}
      </div>

      {/* Menu Icon */}
      <i className="fa-solid fa-bars menu-icon" onClick={toggleSidebar}></i>

      {/* Logout Confirmation Dialog */}
      {confirmLogout && (
        <div className="confirmation-dialog">
          <p>Are you sure you want to log out?</p>
          <button onClick={() => handleLogoutConfirmation(true)}>Yes</button>
          <button onClick={() => handleLogoutConfirmation(false)}>No</button>
        </div>
      )}

      {/* Floating Chat Button */}
      <button className="chat-button" onClick={toggleChat} aria-label="Toggle chat">
        <i className="fa-solid fa-comments"></i>
      </button>

      {/* Chatbox */}
      {chatOpen && (
        <div className="chat-box">
          <div className="chat-header">
            <span>PennyWise</span>
            <button className="close-btn" onClick={toggleChat} aria-label="Close chat">×</button>
          </div>
          <div className="chat-body">
            {chatHistory.length === 0 && <div className="chat-message bot">Hi! I’m PennyWise, your budgeting sidekick. How can I help you today?</div>}
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-message ${msg.sender}`}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <div className="chat-input-container">
            <input
              type="text"
              placeholder="Type a message..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
            />
            <button onClick={sendMessage} aria-label="Send message">
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
