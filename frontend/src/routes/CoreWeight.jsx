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
    const numWeight = parseFloat(weight);
    
    if (!weight || isNaN(numWeight)) {
      alert('Please enter a valid weight.');
      return;
    }

    if (numWeight < 0) {
      alert('Weight cannot be negative.');
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
        
        <div className="guideline-box">
          <p>Enter the total weight in kilograms (kg) of all packaging materials</p>
          <p>(boxes, tape, etc.) that will be used for all shipments combined.</p>
        </div>
        
        <div className="core-weight-input">
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={weight}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setWeight(val >= 0 ? e.target.value : '');
            }}
            min="0"
          />
          <span className="input-suffix">kg</span>
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