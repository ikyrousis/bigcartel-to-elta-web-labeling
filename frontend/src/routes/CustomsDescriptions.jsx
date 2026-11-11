import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { countriesOfOrigin } from "../models/originCountries";
import BackButton from '../components/BackButton';


// Accept HS tariff numbers of exactly 6, 8 or 10 digits
const isValidHs = (value) => /^(\d{6}|\d{8}|\d{10})$/.test(value.trim());

function CustomsDescriptions() {
  const { customsDescriptions, setCustomsDescriptions } = useAppContext();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [attempted, setAttempted] = useState(false);
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
    setAttempted(true);

    if (customsDescriptions.length === 0) {
      setError('Please add at least one category.');
      return;
    }

    // Field-level hints are shown inline under each invalid input
    const hasInvalidHS = customsDescriptions.some(c => !c.hsTarifNumber?.trim() || !isValidHs(c.hsTarifNumber));
    const hasMissingOrigin = customsDescriptions.some(c => !c.countryOfOrigin?.trim());
    if (hasInvalidHS || hasMissingOrigin) return;

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
                  {(() => {
                    const hs = category.hsTarifNumber || '';
                    const hsInvalid = !isValidHs(hs);
                    const showHint = hsInvalid && (hs !== '' || attempted);
                    return (
                      <>
                        <input
                          placeholder="6, 8 or 10 digits"
                          type="text"
                          value={hs}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            handleCategoryChange(category.id, 'hsTarifNumber', val);
                          }}
                          className={showHint ? 'field-invalid' : ''}
                        />
                        {showHint && (
                          <span className="field-hint">{hs ? 'Must be 6, 8 or 10 digits' : 'Required'}</span>
                        )}
                      </>
                    );
                  })()}
                </td>
                <td>
                  {(() => {
                    const originMissing = !category.countryOfOrigin?.trim();
                    const showHint = originMissing && attempted;
                    return (
                      <>
                        <select
                          value={category.countryOfOrigin || ''}
                          onChange={(e) => handleCategoryChange(category.id, 'countryOfOrigin', e.target.value)}
                          className={`mapping-select${showHint ? ' field-invalid' : ''}`}
                        >
                          <option value="" disabled>Select</option>
                          {countriesOfOrigin.map(c => (
                            <option key={c.code} value={c.code}>
                              {c.code} - {c.name}
                            </option>
                          ))}
                        </select>
                        {showHint && (
                          <span className="field-hint">Please select</span>
                        )}
                      </>
                    );
                  })()}
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