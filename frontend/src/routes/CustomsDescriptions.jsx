import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

function CustomsDescriptions() {
  const [input, setInput] = useState('');
  const [descriptions, setDescriptions] = useState([]);
  const navigate = useNavigate();
  const { setCustomsDescriptions } = useAppContext();

  const addDescription = () => {
    if (input.trim() && !descriptions.includes(input.trim())) {
      setDescriptions([...descriptions, input.trim()]);
      setInput('');
    }
  };

  const handleNext = () => {
    if (descriptions.length === 0) {
      alert('Please add at least one customs description.');
      return;
    }
    setCustomsDescriptions(descriptions);
    navigate('/map-products');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>📝 Add Customs Descriptions</h2>
      <input
        placeholder="e.g. T-Shirt, DVD, Mug..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={addDescription}>Add</button>

      <ul>
        {descriptions.map((desc, i) => (
          <li key={i}>{desc}</li>
        ))}
      </ul>

      <button onClick={handleNext} disabled={descriptions.length === 0}>Next</button>
    </div>
  );
}

export default CustomsDescriptions;
