import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

function CustomsDescriptions() {
  const { customsDescriptions, setCustomsDescriptions } = useAppContext();
  const [input, setInput] = useState('');
  const navigate = useNavigate();

  const handleAdd = () => {
    if (!input.trim()) return;
    setCustomsDescriptions([...customsDescriptions, input.trim()]);
    setInput('');
  };

  const handleNext = () => {
    if (customsDescriptions.length === 0) {
      alert('Please add at least one description.');
      return;
    }
    navigate('/map-products');
  };

  const handleBack = () => {
    navigate('/core-weight');
  };

  return (
    <div className="page-wrapper">
      <div className="centered-container">
        <h2>📝 Enter Customs Description Categories</h2>

        <div className="input-with-button">
          <div className="input-button-wrapper">
            <input
              placeholder="e.g. Accessory, T-Shirt"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="description-input"
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button
              onClick={handleAdd}
              className="embedded-add-button"
            >
              +
            </button>
          </div>
        </div>

        <div className="descriptions-list">
          {customsDescriptions.map((desc, index) => (
            <div key={index} className="description-item">
              {desc}
            </div>
          ))}
        </div>

        <div className="button-group">
          <button onClick={handleBack}>Back</button>
          <button onClick={handleNext}>Next</button>
        </div>
      </div>
    </div>
  );
}

export default CustomsDescriptions;
