// import React from 'react';
import {  BrowserRouter as Router,Route, Routes, Navigate } from 'react-router-dom';
import TransactionPage from './pages/TransactionsPage';
import BudgetPage from './pages/BudgetPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import SecurityQuestion from './components/SecurityQuestion';


function App() {
  return (
    <Router>
    <div>
      <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage/>} /> 
        <Route path="/security-question" element={<SecurityQuestion />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/transactions" element={<TransactionPage />} />
        <Route path="/recommendations" element={<BudgetPage />} />
      </Routes>
    </div>
  </Router>
  );
}

export default App;
