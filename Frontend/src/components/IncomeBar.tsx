import React, { useEffect, useState } from 'react';
import { visService } from '../services/card.service';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ChartOptions,
  TooltipItem,
} from 'chart.js';
import '../styles/IncomeBar.css';

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Props to optionally receive filters
interface IncomeBarProps {
  queryParams?: {
    month?: string;
    year?: string;
  };
}

const IncomeBar: React.FC<IncomeBarProps> = ({ queryParams = {} }) => {
  const [incomeData, setIncomeData] = useState<{ category: string; total: number }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchIncomeBySource = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await visService.getIncomeBySource(queryParams);
        setIncomeData(response || []);
      } catch (err: any) {
        console.error(err);
        setError('Failed to fetch income data.');
      } finally {
        setLoading(false);
      }
    };

    fetchIncomeBySource();
  }, [JSON.stringify(queryParams)]); // Refetch when filters change

  const chartData = {
    labels: incomeData.map((item) => item.category),
    datasets: [
      {
        label: 'Income by Source',
        data: incomeData.map((item) => item.total),
        backgroundColor: '#36A2EB',
        borderColor: '#36A2EB',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'bar'>) => {
            const value = context.raw as number;
            return `$${value.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Income Source',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Total Income ($)',
        },
      },
    },
  };

  // Render states
  if (loading) return <div>Loading income data...</div>;
  if (error) return <div className="error-text">{error}</div>;
  if (!incomeData.length) return <div>No income data for the selected filter.</div>;

  return (
    <div className="income-bar-container">
      <h2>Income by Source</h2>
      <div className="bar-chart">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default IncomeBar;
