import ShowRecommendations from '../components/ShowRecommendation';
import GenerateRecommendation from '../components/GenerateRecommendation';
import ShowBudget from '../components/ShowBudget';
import '../styles/budget.css';
import Layout from '../components/layout';

const RecommendationPage = () => {
  return (
    <Layout>
      <div className="budget-container">
        <div className="top-section">
          <ShowBudget />
        </div>
        <div className="bottom-section">
          <div className="left-section">
            <h2 className="recommendation-title">Your Recommendations</h2>
            <ShowRecommendations />
          </div>
          <div className="right-section">
            <div className="generate-rec">
              <GenerateRecommendation />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RecommendationPage;