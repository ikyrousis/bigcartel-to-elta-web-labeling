import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useState, useEffect } from 'react';
import BackButton from '../components/BackButton';

function CoreWeight() {
  const { corePackagingWeight, setCorePackagingWeight, markAsGift, setMarkAsGift } = useAppContext();
  const [weight, setWeight] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setWeight(corePackagingWeight || '');
  }, [corePackagingWeight]);

  const handleNext = () => {
    const numWeight = parseFloat(weight);
    if (!weight || isNaN(numWeight)) {
      setError('Please enter a valid weight.');
      return;
    }
    setError('');
    setCorePackagingWeight(weight);
    navigate('/customs-descriptions');
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
            placeholder="0.000"
            value={weight}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw !== '' && !/^\d*\.?\d{0,3}$/.test(raw)) return;
              setWeight(raw >= 0 ? raw : '');
              if (error) setError('');
            }}
            min="0"
          />
          <span className="input-suffix">kg</span>
        </div>

        {/* Gift option */}
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={markAsGift}
            onChange={(e) => setMarkAsGift(e.target.checked)}
          />
          Mark all shipments as gift
        </label>

        {error && <p className="field-error" role="alert">{error}</p>}

        <div className="button-group">
          <BackButton />
          <button className="btn-primary" onClick={handleNext}>Next</button>
        </div>
      </div>
    </div>
  );
}

export default CoreWeight;