import { ChangeEvent, Suspense, useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';
import { Budget } from '../types/budget';
import { budgetService } from '../services/budget.service';
import '../styles/budget.css'; // Adjust the path according to your folder structure

const ShowBudget = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;  // Set the number of budgets per page

  let handleSave = async (id: string | undefined) => {
    let budgetUpdated = budgets.filter((bud) => bud._id === id);
    const response = await budgetService.updateBudget(id as string, budgetUpdated[0]);
    console.log(response);
  };

  let handleCancel = async () => {
    const response = await budgetService.getBudgets();
    setBudgets(response as Budget[]);
  };

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const response = await budgetService.getBudgets();
        setBudgets(response as Budget[]);
      } catch (error) {
        setError('Error loading recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchBudgets();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <p>{error}</p>;

  function handleSliderChange(e: ChangeEvent<HTMLInputElement>, _id: string | undefined): void {
    let temp = budgets;
    temp = temp.map((budget) => {
      if (budget._id === _id) return { ...budget, limit: +e.target.value };
      else return budget;
    });
    setBudgets(temp);
  }

  // Pagination Logic: Determine the budgets to show for the current page
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
                    alt="image"
                    width="40"
                    height="40"
                  />
                </div>
                <div className="budget-category">
                  <p>  Category: {budget?.category?.category}</p>
                </div>
              </div>
              <div className="budget-value">
                <strong>Limit: {budget?.limit} $</strong>
                <input
                  type="range"
                  min="1000"
                  max="200000"
                  value={"" + budget.limit}
                  onChange={(e) => handleSliderChange(e, budget._id)}
                  style={{ width: '100%' }}
                />
                
                <button onClick={(e) => handleSave(budget._id)}>
                  Save
                </button>
                <button onClick={handleCancel}>
                  Cancel
                </button>
              </div>
              <div className="budget-value">
                <strong>Total Spent: {budget?.total_spent} $</strong>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span>Page {currentPage}</span>
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

export default function App() {
  return (
    <div>
      <ErrorBoundary fallback={<p>Error loading budgets. Please try again later.</p>}>
        <Suspense fallback={<LoadingSpinner />}>
          <ShowBudget />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
