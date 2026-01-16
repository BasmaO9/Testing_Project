import { Recommendation } from '../types/recommendation';

interface RecommendationListProps {
  recommendations: Recommendation[];
}

export default function RecommendationList({ recommendations }: RecommendationListProps) {
  return (
    <div className="recommendation-list">
      {recommendations.map((recommendation) => (
        <div key={recommendation._id} className="recommendation-item">
          <p className="recommendation-text">{recommendation.text}</p>
        </div>
      ))}
    </div>
  );
}