import React, { useEffect, useState } from 'react';
import Layout from '../components/layout';
import { profileService } from '../services/profile.services';
import '../styles/layout.css';
import '../styles/dashbored.css';
import { visService } from "../services/card.service";
import { Transaction } from '../types/transaction';
import { transactionsService } from '../services/transactions.service';
import IncomeBar from '../components/IncomeBar';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

const DashboardPage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [showUpdateProfileForm, setShowUpdateProfileForm] = useState(false);
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [totalIncomeAndExpenses, setTotalIncomeAndExpenses] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const filters = {
          date: "2023-12-22",
          category: "Groceries",
        };
        const filteredTransactions = await transactionsService.getAllTransactions(filters);
        setTransactions(filteredTransactions);

        const labels = filteredTransactions.map((transaction: Transaction) => transaction.date);
        const amounts = filteredTransactions.map((transaction: Transaction) => transaction.amount);

        setChartData({
          labels,
          datasets: [
            {
              label: "Transaction Amounts",
              data: amounts,
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderWidth: 2,
              tension: 0.4,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, []);

  useEffect(() => {
    const fetchTotalIncomeAndExpenses = async () => {
      try {
        const response = await visService.getTotalIncomeAndExpenses();
        setTotalIncomeAndExpenses(response);
      } catch (error) {
        console.error("Error fetching total income and expenses:", error);
      }
    };

    fetchTotalIncomeAndExpenses();
  }, []);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const toggleUpdateProfileForm = () => setShowUpdateProfileForm((prev) => !prev);
  const toggleChangePasswordForm = () => setShowChangePasswordForm((prev) => !prev);

  const [passwordData, setPasswordData] = useState({
    email: '',
    password: '',
  });

  const pieData = totalIncomeAndExpenses && {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        data: [totalIncomeAndExpenses.income, totalIncomeAndExpenses.expenses],
        backgroundColor: ['#36A2EB', '#FF6384'],
        hoverBackgroundColor: ['#36A2EB', '#FF6384'],
      },
    ],
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileService.getProfile();
        setProfile(data.profile);
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
        const maxExpenseData = await visService.getMaxExpense();
        getMaxExpense(maxExpenseData);

        const minExpenseData = await visService.getMinExpense();
        getMinExpense(minExpenseData);

        const balanceData = await visService.getBalance();
        getBalance(balanceData);

        const spent12Months = await visService.getSpentLast12Months();
        getSpentLast12Months(spent12Months);

        const spent30Days = await visService.getSpentLast30Days();
        getSpentLast30Days(spent30Days);
      } catch (error) {
        console.error("Error fetching card data:", error);
      }
    };

    fetchCardData();
  }, []);

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
                <button onClick={toggleUpdateProfileForm}>
                  {showUpdateProfileForm ? 'Hide Update Profile' : 'Update Profile'}
                </button>
                <button onClick={toggleChangePasswordForm}>
                  {showChangePasswordForm ? 'Hide Change Password' : 'Change Password'}
                </button>
              </div>
            ) : (
              <p>Loading profile...</p>
            )}
          </div>

          <hr className="divider-line" />

          <div className="dashboard-content">
            <h1>Welcome to Your Dashboard</h1>
            <p>Here is a summary of your financial activity.</p>
          </div>

          <div className="visualization-section">
            <h2>Financial Overview</h2>
            <div className="pie-and-cards-container">
              <div className="pie">
                <h3>Income vs Expenses</h3>
                {totalIncomeAndExpenses ? <Pie data={pieData} /> : <p>Loading Chart...</p>}
              </div>
              <div className="income-bar">
              {/* <h3>Income by Source</h3> */}
              {/* Use IncomeBar component, no need for incomeData or chartData */}
              <IncomeBar />
            </div>
              <div className="cards-section">
                <h3>Your Financial Highlights</h3>
                <div className="cards-container">
                  <div className="card"><h4>Max Expense</h4><p>{maxExpense ? `$${maxExpense}` : "Loading..."}</p></div>
                  <div className="card"><h4>Min Expense</h4><p>{minExpense ? `$${minExpense}` : "Loading..."}</p></div>
                  <div className="card"><h4>Balance</h4><p>{balance ? `$${balance}` : "Loading..."}</p></div>
                  <div className="card"><h4>Spent (Last 12 Months)</h4><p>{spentLast12Months ? `$${spentLast12Months}` : "Loading..."}</p></div>
                  <div className="card"><h4>Spent (Last 30 Days)</h4><p>{spentLast30Days ? `$${spentLast30Days}` : "Loading..."}</p></div>
                </div>
              </div>
            </div>

            <div>
              <h3>Transaction Line Graph</h3>
              {chartData ? (
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: true, position: "top" } },
                    scales: {
                      x: { title: { display: true, text: "Date" } },
                      y: { title: { display: true, text: "Amount" } },
                    },
                  }}
                />
              ) : (
                <p>Loading Chart...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
