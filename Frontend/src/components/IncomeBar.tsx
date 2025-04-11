import React, { useEffect, useState } from 'react';
import { visService } from '../services/card.service';  // assuming this service is in place
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend, ChartOptions, TooltipItem } from 'chart.js';
import '../styles/IncomeBar.css'

// Registering required chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const IncomeBar: React.FC = () => {
  const [incomeData, setIncomeData] = useState<{ category: string; total: number }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchIncomeBySource = async () => {
      try {
        // Assuming `visService.getIncomeBySource` is correctly implemented to fetch the data
        const response = await visService.getIncomeBySource();
        setIncomeData(response);
      } catch (err: any) {
        setError('Failed to fetch income data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchIncomeBySource();
  }, []);

  const chartData = {
    labels: incomeData.map(item => item.category), // Categories on the X-axis
    datasets: [
      {
        label: 'Income by Source',
        data: incomeData.map(item => item.total), // Total income for each category
        backgroundColor: '#36A2EB', // Color for the bars
        borderColor: '#36A2EB',
        borderWidth: 1,
      },
    ],
  };

  // Explicitly type chartOptions as ChartOptions<'bar'>
  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top', // Valid values: 'top', 'right', 'bottom', 'left', 'center'
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'bar'>) => {
            const value = context.raw as number; // Cast value to a number
            return `$${value.toFixed(2)}`; // Display value as currency
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
        title: {
          display: true,
          text: 'Total Income ($)',
        },
        beginAtZero: true, // Ensures the y-axis starts at zero
      },
    },
  };

  if (loading) {
    return <div>Loading income data...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

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
