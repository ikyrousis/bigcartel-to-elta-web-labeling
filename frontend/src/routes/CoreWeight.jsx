import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

function CoreWeight() {
  const { corePackagingWeight, setCorePackagingWeight } = useAppContext();
  const [weight, setWeight] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setWeight(corePackagingWeight || '');
  }, [corePackagingWeight]);

  const handleNext = () => {
    if (!weight || isNaN(weight)) {
      alert('Please enter a valid weight.');
      return;
    }

    setCorePackagingWeight(weight);
    navigate('/customs-descriptions');
  };

  const handleBack = () => {
    navigate('/product-details');
  };

  return (
    <div className="page-wrapper">
      <div className="centered-container">
        <h2>📦 Core Packaging Weight</h2>
        
        <div className="input-group" style={{ maxWidth: '300px', margin: '2rem auto' }}>
          <input
            type="number"
            step="0.01"
            placeholder="e.g. 0.15"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
        
        <div className="button-group">
          <button onClick={handleBack}>Back</button>
          <button onClick={handleNext}>Next</button>
        </div>
      </div>
    </div>
  );
}

export default CoreWeight;