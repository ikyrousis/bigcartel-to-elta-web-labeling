import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

function CustomsDescriptions() {
  const { customsDescriptions, setCustomsDescriptions } = useAppContext();
  const [input, setInput] = useState('');
  const navigate = useNavigate();

  const handleAdd = () => {
    if (!input.trim()) return;
    setCustomsDescriptions([...customsDescriptions, {
      description: input.trim(),
      hsTarifNumber: '',
      countryOfOrigin: ''
    }]);
    setInput('');
  };

  const handleNext = () => {
    if (customsDescriptions.length === 0) {
      alert('Please add at least one category.');
      return;
    }
    navigate('/map-products');
  };

  const handleBack = () => {
    navigate('/core-weight');
  };

  const handleCategoryChange = (index, field, value) => {
    const updated = [...customsDescriptions];
    updated[index][field] = value;
    setCustomsDescriptions(updated);
  };

  const handleDelete = (index) => {
    const updated = [...customsDescriptions];
    updated.splice(index, 1);
    setCustomsDescriptions(updated);
  };

  return (
    <div className="page-wrapper">
      <div className="centered-container">
        <h2>📝 Enter Customs Categories</h2>

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

        <table className="descriptions-table">
          <thead>
            <tr>
              <th>Customs Description</th>
              <th>HS Tarif Number</th>
              <th>Country of Origin</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customsDescriptions.map((category, index) => (
              <tr key={index} className="description-row">
                <td>{category.description}</td>
                <td>
                  <input
                    placeholder="Optional"
                    type="text"
                    value={category.hsTarifNumber || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      handleCategoryChange(index, 'hsTarifNumber', val);
                    }}
                  />
                </td>
                <td>
                  <input
                    placeholder="Optional"
                    type="text"
                    maxLength="2"
                    value={category.countryOfOrigin || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^A-Za-z]/g, '').toUpperCase();
                      handleCategoryChange(index, 'countryOfOrigin', val);
                    }}
                  />
                </td>
                <td>
                  <button
                    onClick={() => handleDelete(index)}
                    className="delete-button"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="button-group">
          <button onClick={handleBack}>Back</button>
          <button onClick={handleNext}>Next</button>
        </div>
      </div>
    </div>
  );
}

export default CustomsDescriptions;
