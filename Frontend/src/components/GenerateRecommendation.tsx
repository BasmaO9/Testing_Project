import { Suspense, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';
import { recommendationService } from '../services/recommendation.service';
// import '../styles/recommendation.css'
export const GenerateRecommendation = () => {
  const [recommendation, setRecommendation] = useState<String>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  
  function handleClick(){
    setShowModal(true);
    setRecommendation('');
    setLoading(true);
    setError('');
    const GenerateRecommendation = async () => {
        try {
          const response = await recommendationService.generateRecommendation();
          setRecommendation(response);
        } catch (error) {
          setError('Error loading recommendations');
        } finally {
          setLoading(false);
        }
      };
      
    GenerateRecommendation();
  }

  const closeModal = () => setShowModal(false);

//   if (loading) return <LoadingSpinner />;
//   if (error) return <p>{error}</p>;

  return (
    <div className='recomendation'>
      <div className="recommendation-container">
        {/* <h2 className="recommendation-header">New Recommendation!</h2> */}
        <button className="recommendation-button" onClick={handleClick}>
          Generate a New Recommendation ✨
        </button>
      </div>
        {showModal && (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-popup" onClick={e => e.stopPropagation()}>
          <button className="close-btn" onClick={closeModal}>&times;</button>
          <h3>Recommendation</h3>
          <div className="model-text">
            {loading && <p className="loading-text">Generating a recommendation...</p>}
            {error && <p className="error-text">{error}</p>}
            {recommendation && (
              <div className="recommendation-data">
                <p className='text'>{JSON.stringify(recommendation, null, 2)}</p> 
              </div>
            )}
          </div>
        </div>
      </div>
    )}

    </div>


  );
};



export default function App() {
    return (
      <div>
        <ErrorBoundary fallback={<p>Error loading recommendations. Please try again later.</p>}>
          <Suspense fallback={<LoadingSpinner />}>
            <GenerateRecommendation />
          </Suspense>
        </ErrorBoundary>
      </div>
    );
  }
