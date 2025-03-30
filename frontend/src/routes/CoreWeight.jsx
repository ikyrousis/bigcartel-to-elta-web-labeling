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
    <div style={{ padding: '2rem' }}>
      <h2>📦 Core Packaging Weight</h2>
      <input
        type="number"
        step="0.01"
        placeholder="e.g. 0.15"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
      />
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button onClick={handleBack}>Back</button>
        <button onClick={handleNext}>Next</button>
      </div>
    </div>
  );
}

export default CoreWeight;
