import { ChangeEvent, Suspense, useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';
import { Budget } from '../types/budget';
import { budgetService } from '../services/budget.service';
import '../styles/budget.css';

const ShowBudget = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const handleSave = async (id: string | undefined) => {
    if (!id) return;
    try {
      const budgetUpdated = budgets.find((bud) => bud._id === id);
      if (budgetUpdated) {
        await budgetService.updateBudget(id, budgetUpdated);
        // Optionally add toast notification here
        console.log('Budget updated successfully');
      }
    } catch (error) {
      console.error('Error updating budget:', error);
    }
  };

  const handleCancel = async () => {
    try {
      const response = await budgetService.getBudgets();
      setBudgets(response as Budget[]);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const response = await budgetService.getBudgets();
        setBudgets(response as Budget[]);
      } catch (error) {
        setError('Error loading budgets');
      } finally {
        setLoading(false);
      }
    };

    fetchBudgets();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <p>{error}</p>;

  const handleSliderChange = (e: ChangeEvent<HTMLInputElement>, _id: string | undefined): void => {
    if (!_id) return;
    setBudgets((prevBudgets) =>
      prevBudgets.map((budget) =>
        budget._id === _id ? { ...budget, limit: +e.target.value } : budget
      )
    );
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentBudgets = budgets.slice(indexOfFirst, indexOfLast);

  return (
    <div className="budget">
      <div className="p-4">
        <div className="budget-title">
          <h1>Budgets</h1>
        </div>
        <div className="budget-grid">
          {currentBudgets.map((budget) => (
            <div key={budget._id} className="budget-item">
              <div className="budget-header">
                <div className="budget-image">
                  <img
                    src={budget?.category?.category_img}
                    alt={budget?.category?.category || 'Category'}
                    width="50"
                    height="50"
                  />
                </div>
                <div className="budget-category">
                  <p>Category: {budget?.category?.category}</p>
                </div>
              </div>
              <div className="budget-value">
                <strong>Limit: ${budget?.limit?.toLocaleString()}</strong>
                <input
                  type="range"
                  min="1000"
                  max="200000"
                  value={budget.limit}
                  onChange={(e) => handleSliderChange(e, budget._id)}
                  style={{ width: '100%' }}
                />
                <button onClick={() => handleSave(budget._id)}>Save</button>
                <button onClick={handleCancel}>Cancel</button>
              </div>
              <div className="budget-value">
                <strong>Total Spent: ${budget?.total_spent?.toLocaleString()}</strong>
              </div>
            </div>
          ))}
        </div>
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>Page {currentPage} of {Math.ceil(budgets.length / itemsPerPage)}</span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={indexOfLast >= budgets.length}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowBudget;