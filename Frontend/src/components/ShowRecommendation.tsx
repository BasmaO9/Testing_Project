import { Suspense, useEffect, useState } from 'react';
import { Recommendation } from '../types/recommendation';
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';
import { recommendationService } from '../services/recommendation.service';

const ShowRecommendations = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecommendations = recommendations.slice(indexOfFirstItem, indexOfLastItem);

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
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-4">
      <div className="recommendation-list">
        {currentRecommendations.map((recommendation) => (
          <div key={recommendation._id} className="recommendation-item">
            <p className="recommendation-text">{recommendation.text}</p>
          </div>
        ))}
      </div>
      <div className="pagination">
        <button onClick={handlePreviousPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default ShowRecommendations;