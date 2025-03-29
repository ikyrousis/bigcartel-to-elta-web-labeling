import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

function CoreWeight() {
  const { setCorePackagingWeight } = useAppContext();
  const [weight, setWeight] = useState('');
  const navigate = useNavigate();

  const handleNext = () => {
    if (!weight || isNaN(weight)) {
      alert('Please enter a valid weight in kilograms.');
      return;
    }
    setCorePackagingWeight(weight);
    navigate('/customs-descriptions');
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
      <button onClick={handleNext} style={{ marginLeft: '1rem' }}>Next</button>
    </div>
  );
}

export default CoreWeight;
