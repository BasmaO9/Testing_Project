import { ChangeEvent, Suspense, useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';
import { recommendationService } from '../services/recommendation.service';
import { Budget } from '../types/budget';
import { budgetService } from '../services/budget.service';
import '../styles/budget.css'; // Adjust the path according to your folder structure


const ShowBudget = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  let handleSave = async (id:string|undefined)=>{
    //call service to update the budget
    let budgetUpdated = budgets.filter((bud)=>bud._id===id);
    const response = await budgetService.updateBudget(id as string,budgetUpdated[0]);
    console.log(response);
  }
  let handleCancel  = async ()=>{  
    //call the service to 
    const response = await budgetService.getBudgets();
      setBudgets(response as Budget[]);
  }

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
  },[]);

  

  if (loading) return <LoadingSpinner />;
  if (error) return <p>{error}</p>;

  function handleSliderChange(e: ChangeEvent<HTMLInputElement>, _id: string | undefined): void {
    let temp = budgets ;
    temp = temp.map((budget)=>{
      if (budget._id===_id) return {...budget,limit:+e.target.value};
      else return budget;
    });
    setBudgets(temp);
  }

  return (
    <div className='budget '>
<div className="p-4"><h2>Budgets</h2>
  <div className="budget-grid">
  {budgets.map((budget) => (
    <div key={budget._id} className="budget-item">
      <div className="budget-image">
        <img
          src={budget?.category?.category_img}
          alt="image"
          width="40"
          height="40"
        />
      </div>
      <div className="budget-category">
        Category: {budget?.category?.category}
      </div>
      <div className="budget-value">
        <strong>Limit: </strong>
        <input
          type="range"
          min="1000"
          max="200000"
          value={""+budget.limit}
          onChange={(e) => handleSliderChange(e, budget._id)}
          style={{ width: '100%' }}
        />
        <span>{budget?.limit}</span>
        <button onClick={(e)=>handleSave(budget._id)}>
          Save
        </button>
        <button onClick={handleCancel}>
          Cancel
        </button>
      </div>
      <div className="budget-value">
        <strong>Total Spent: </strong>{budget?.total_spent}
      </div>
    </div>
  ))}
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
          <ShowBudget/>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
