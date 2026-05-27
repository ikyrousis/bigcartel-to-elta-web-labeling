import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { countriesOfOrigin } from "../models/originCountries";
import BackButton from '../components/BackButton';


function CustomsDescriptions() {
  const { customsDescriptions, setCustomsDescriptions } = useAppContext();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAdd = () => {
    if (!input.trim()) return;
    setCustomsDescriptions([...customsDescriptions, {
      id: crypto.randomUUID(),
      description: input.trim(),
      hsTarifNumber: '',
      countryOfOrigin: ''
    }]);
    setInput('');
    if (error) setError('');
  };

  const handleNext = () => {
    if (customsDescriptions.length === 0) {
      setError('Please add at least one category.');
      return;
    }

    const missingHS = customsDescriptions.find(c => !c.hsTarifNumber?.trim());
    if (missingHS) {
      setError(`HS Tarif Number is required — missing on "${missingHS.description}"`);
      return;
    }

    const missingOrigin = customsDescriptions.find(c => !c.countryOfOrigin?.trim());
    if (missingOrigin) {
      setError(`Country of Origin is required — missing on "${missingOrigin.description}"`);
      return;
    }

    setError('');
    navigate('/map-products');
  };

  const handleCategoryChange = (id, field, value) => {
    setCustomsDescriptions(
      customsDescriptions.map(cat =>
        cat.id === id ? { ...cat, [field]: value } : cat
      )
    );
  };

  const handleDelete = (id) => {
    setCustomsDescriptions(customsDescriptions.filter(cat => cat.id !== id));
  };

  return (
    <div className="page-wrapper">
      <div className="centered-container centered-container--wide">
        <h2>📝 Enter Customs Categories</h2>

        <div className="input-with-button">
          <div className="input-button-wrapper">
            <input
              placeholder="e.g. Accessory, T-Shirt"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="description-input"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button onClick={handleAdd} className="embedded-add-button">+</button>
          </div>
        </div>

        {error && <p className="field-error" role="alert">{error}</p>}

        <table className="data-table">
          <colgroup>
            <col style={{ width: '25%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '45%' }} />
            <col style={{ width: '10%' }} />
          </colgroup>
          <thead>
            <tr>
              <th>Customs Description</th>
              <th>HS Tarif Number</th>
              <th>Country of Origin</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customsDescriptions.map((category) => (
              <tr key={category.id} className="description-row">
                <td>{category.description}</td>
                <td>
                  <input
                    placeholder="Required"
                    type="text"
                    value={category.hsTarifNumber || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      handleCategoryChange(category.id, 'hsTarifNumber', val);
                    }}
                  />
                </td>
                <td>
                  <select
                    value={category.countryOfOrigin || ''}
                    onChange={(e) => handleCategoryChange(category.id, 'countryOfOrigin', e.target.value)}
                    className="mapping-select"
                  >
                    <option value="" disabled>Select</option>
                    {countriesOfOrigin.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.code} — {c.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button onClick={() => handleDelete(category.id)} className="delete-button">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="button-group">
          <BackButton />
          <button className="btn-primary" onClick={handleNext}>Next</button>
        </div>
      </div>
    </div>
  );
}

export default CustomsDescriptions;