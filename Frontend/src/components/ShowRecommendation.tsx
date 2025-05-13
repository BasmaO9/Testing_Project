import { Suspense, useEffect, useState } from 'react';
import { Recommendation } from '../types/recommendation';
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';
import { recommendationService } from '../services/recommendation.service';
import GenerateRecommendation from './GenerateRecommendation';

const ShowRecommendations = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;


  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecommendations = recommendations.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Pagination handlers
  const totalPages = Math.ceil(recommendations.length / itemsPerPage);
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };


  useEffect(() => {
    const getRecommendations = async () => {
      try {
        const response = await recommendationService.getRecommendations();
        setRecommendations(response);
      } catch (error) {
        setError('Error loading recommendations');
      } finally {
        setLoading(false);
      }
    };
    
    getRecommendations();
  },[]);

  

  if (loading) return <LoadingSpinner />;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-4">
      <h2>Recommendations</h2>
      <table className="recommendations-table" style={{maxWidth:1200}}> 
        <tbody>
          {currentRecommendations.map((recommendation) => (
            <tr key={recommendation._id}>
              <td className="recommendation-text">{recommendation.text}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="generate-rec">
        <GenerateRecommendation /> 
      </div>
      <div className='pagination'>
        <button onClick={handlePreviousPage} disabled={currentPage === 1}> Previous </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
        </div >
      </div>
   
  );
};

export default function App() {
  return (
    <div>
      <ErrorBoundary fallback={<p>Error loading recommendations. Please try again later.</p>}>
        <Suspense fallback={<LoadingSpinner />}>
          <ShowRecommendations />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
