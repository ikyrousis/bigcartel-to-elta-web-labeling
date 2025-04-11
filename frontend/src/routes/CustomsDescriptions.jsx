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
    <div style={{ padding: '2rem' }}>
      <h2>📝 Enter Customs Description Categories</h2>

      <input
        placeholder="e.g. Accessory, T-Shirt"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ marginRight: '1rem' }}
      />

      <div style={{ marginTop: '1rem' }}>
        <button onClick={handleAdd} style={{ ...buttonStyle, marginRight: '1rem' }}>Add Description</button>
      </div>

      <ul>
        {customsDescriptions.map((desc, index) => (
          <li key={index}>{desc}</li>
        ))}
      </ul>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button onClick={handleBack} style={buttonStyle}>Back</button>
        <button onClick={handleNext} style={buttonStyle}>Next</button>
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: '0.5rem 1rem',
  fontSize: '1rem',
  borderRadius: '6px',
  border: '1px solid #ccc',
  background: '#f9f9f9',
  cursor: 'pointer'
};

export default CustomsDescriptions;
