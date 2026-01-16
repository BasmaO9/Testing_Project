import React, { useEffect, useState } from 'react';
import Layout from '../components/layout';
import { profileService } from '../services/profile.services';
import '../styles/layout.css';
import '../styles/dashbored.css';
import { visService } from "../services/card.service";
import { Transaction } from '../types/transaction';
import { transactionsService } from '../services/transactions.service';
import IncomeBar from '../components/IncomeBar';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

const DashboardPage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [showUpdateProfileForm, setShowUpdateProfileForm] = useState(false);
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({ name: '', email: '', phone: '' });
  const [passwordData, setPasswordData] = useState({ email: '', password: '' });
  const [totalIncomeAndExpenses, setTotalIncomeAndExpenses] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<any>(null);

  const [isFilterOn, setIsFilterOn] = useState(false);
  const [tempMonth, setTempMonth] = useState('');
  const [tempYear, setTempYear] = useState('2025');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('2025');

  const queryParams = isFilterOn ? {
    ...(selectedMonth && { month: selectedMonth }),
    ...(selectedYear && { year: selectedYear }),
  } : {};

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const filteredTransactions = await transactionsService.getAllTransactions({ ...queryParams });
        setTransactions(filteredTransactions);

        const labels = filteredTransactions.map((t: Transaction) => t.date);
        const amounts = filteredTransactions.map((t: Transaction) => t.amount);

        setChartData({
          labels,
          datasets: [
            {
              label: 'Transaction Amounts',
              data: amounts,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderWidth: 2,
              tension: 0.4,
            },
          ],
        });
      } catch (err) {
        console.error("Error fetching transactions:", err);
      }
    };

    fetchTransactions();
  }, [selectedMonth, selectedYear, isFilterOn]);

  useEffect(() => {
    const fetchTotalIncomeAndExpenses = async () => {
      try {
        const response = await visService.getTotalIncomeAndExpenses({ ...queryParams });
        setTotalIncomeAndExpenses(response);
      } catch (error) {
        console.error("Error fetching total income and expenses:", error);
      }
    };

    fetchTotalIncomeAndExpenses();
  }, [selectedMonth, selectedYear, isFilterOn]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileService.getProfile();
        setProfile(data.profile);
        setUpdateFormData({ name: data.profile.name, email: data.profile.email, phone: data.profile.phone });
        setPasswordData({ email: data.profile.email, password: '' });
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
      }
    };
    fetchProfile();
  }, []);

  const [maxExpense, getMaxExpense] = useState<number | null>(null);
  const [minExpense, getMinExpense] = useState<number | null>(null);
  const [balance, getBalance] = useState<number | null>(null);
  const [spentLast12Months, getSpentLast12Months] = useState<number | null>(null);
  const [spentLast30Days, getSpentLast30Days] = useState<number | null>(null);

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        const max = await visService.getMaxExpense({ ...queryParams });
        const min = await visService.getMinExpense({ ...queryParams });
        const bal = await visService.getBalance({ ...queryParams });
        const last12 = await visService.getSpentLast12Months();
        const last30 = await visService.getSpentLast30Days();

        getMaxExpense(max);
        getMinExpense(min);
        getBalance(bal);
        getSpentLast12Months(last12);
        getSpentLast30Days(last30);
      } catch (error) {
        console.error("Error fetching card data:", error);
      }
    };

    fetchCardData();
  }, [selectedMonth, selectedYear, isFilterOn]);

  const pieData = totalIncomeAndExpenses && typeof totalIncomeAndExpenses.income === 'number' && typeof totalIncomeAndExpenses.expenses === 'number'
    ? {
        labels: ['Income', 'Expenses'],
        datasets: [
          {
            data: [totalIncomeAndExpenses.income, totalIncomeAndExpenses.expenses],
            backgroundColor: ['#36A2EB', '#FF6384'],
            hoverBackgroundColor: ['#36A2EB', '#FF6384'],
          },
        ],
      }
    : null;

  return (
    <Layout>
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="profile-section">
            {error && <p className="error-message">{error}</p>}
            {profile ? (
              <div className="profile-details">
                <h2>Hello, {profile.name}!</h2>
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>Phone:</strong> {profile.phone}</p>
                <button onClick={() => setShowUpdateProfileForm(prev => !prev)}>
                  {showUpdateProfileForm ? 'Hide Update Profile' : 'Update Profile'}
                </button>
                <button onClick={() => setShowChangePasswordForm(prev => !prev)}>
                  {showChangePasswordForm ? 'Hide Change Password' : 'Change Password'}
                </button>

                {showUpdateProfileForm && (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      await profileService.updateProfile(updateFormData);
                      alert('Profile updated successfully');
                      setShowUpdateProfileForm(false);
                    } catch (err: any) {
                      alert(err);
                    }
                  }}>
                    <input type="text" value={updateFormData.name} onChange={(e) => setUpdateFormData({ ...updateFormData, name: e.target.value })} placeholder="Name" />
                    <input type="email" value={updateFormData.email} onChange={(e) => setUpdateFormData({ ...updateFormData, email: e.target.value })} placeholder="Email" />
                    <input type="text" value={updateFormData.phone} onChange={(e) => setUpdateFormData({ ...updateFormData, phone: e.target.value })} placeholder="Phone" />
                    <button type="submit">Save</button>
                  </form>
                )}

                {showChangePasswordForm && (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      await profileService.changePassword(passwordData);
                      alert('Password changed successfully');
                      setPasswordData({ ...passwordData, password: '' });
                      setShowChangePasswordForm(false);
                    } catch (err: any) {
                      alert(err);
                    }
                  }}>
                    <input type="email" value={passwordData.email} onChange={(e) => setPasswordData({ ...passwordData, email: e.target.value })} placeholder="Email" />
                    <input type="password" value={passwordData.password} onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })} placeholder="New Password" />
                    <button type="submit">Change Password</button>
                  </form>
                )}
              </div>
            ) : <p>Loading profile...</p>}
          </div>

          <hr className="divider-line" />

          <div className="dashboard-content">
            <h1>Welcome to Your Dashboard</h1>
            <div className="filter-controls" style={{ margin: '20px 0' }}>
              <label className="switch">
                <input type="checkbox" checked={isFilterOn} onChange={() => setIsFilterOn(!isFilterOn)} />
                <span className="slider round"></span>
              </label>
              <span style={{ marginLeft: '10px' }}>{isFilterOn ? 'Filter: ON' : 'Filter: OFF'}</span>
              {isFilterOn && (
                <>
                  &nbsp;&nbsp;
                  <label>
                    Month:&nbsp;
                    <select value={tempMonth} onChange={(e) => setTempMonth(e.target.value)}>
                      <option value="">--</option>
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                  </label>
                  &nbsp;&nbsp;
                  <label>
                    Year:&nbsp;
                    <input type="number" value={tempYear} onChange={(e) => setTempYear(e.target.value)} min="2000" max="2100" step="1" />
                  </label>
                  <button onClick={() => { setSelectedMonth(tempMonth); setSelectedYear(tempYear); }} style={{ marginLeft: '10px' }}>Done</button>
                </>
              )}
            </div>
          </div>

          <div className="visualization-section">
            <h2>Financial Overview</h2>
            <div className="pie-and-cards-container">
              <div className="pie">
                <h3>Income vs Expenses</h3>
                {pieData ? <Pie data={pieData} /> : <p>Loading Chart...</p>}
              </div>
              <div className="income-bar">
                <IncomeBar queryParams={queryParams} />
              </div>
              <div className="cards-section">
                <div className="cards-container">
                  <div className="card"><h4>Max Expense</h4><p>{maxExpense !== null ? `$${maxExpense}` : "Loading..."}</p></div>
                  <div className="card"><h4>Min Expense</h4><p>{minExpense !== null ? `$${minExpense}` : "Loading..."}</p></div>
                  <div className="card"><h4>Balance</h4><p>{balance !== null ? `$${balance}` : "Loading..."}</p></div>
                  <div className="card"><h4>Spent (Last 12 Months)</h4><p>{spentLast12Months !== null ? `$${spentLast12Months}` : "Loading..."}</p></div>
                  <div className="card"><h4>Spent (Last 30 Days)</h4><p>{spentLast30Days !== null ? `$${spentLast30Days}` : "Loading..."}</p></div>
                </div>
              </div>
            </div>
            <div>
              <h3>Transaction Line Graph</h3>
              {chartData ? (
                <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: true, position: "top" } }, scales: { x: { title: { display: true, text: "Date" } }, y: { title: { display: true, text: "Amount" } } } }} />
              ) : <p>Loading Chart...</p>}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;