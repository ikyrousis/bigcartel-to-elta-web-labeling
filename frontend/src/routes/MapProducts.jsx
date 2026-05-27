import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import BackButton from '../components/BackButton';

function MapProducts() {
  const {
    uniqueProducts,
    customsDescriptions,
    productToCategory,
    setProductToCategory,
    csvPath,
    productDetails,
    corePackagingWeight
  } = useAppContext();

  const [mapping, setMapping] = useState(() => ({ ...productToCategory }));
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSelect = (product, categoryIndex) => {
    const category = customsDescriptions[categoryIndex];
    setMapping(prev => ({ ...prev, [product]: category }));
    if (error) setError('');
  };

  const handleFinish = () => {
    const missing = uniqueProducts.find(p => !mapping[p]);
    if (missing) {
      setError(`Please assign a category to "${missing}"`);
      return;
    }

    setError('');
    setProductToCategory(mapping);

    window.electronAPI.runLabelGenerator({
      csvPath,
      productDetails,
      corePackagingWeight,
      productToCategory: mapping
    });
  };

  return (
    <div className="page-wrapper">
      <div className="centered-container">
        <h2>🔗 Match Products to Customs Categories</h2>

        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Customs Category</th>
            </tr>
          </thead>
          <tbody>
            {uniqueProducts.map((product) => (
              <tr key={product}>
                <td>{product}</td>
                <td>
                  <select
                    className="mapping-select"
                    value={customsDescriptions.findIndex(c => c === mapping[product])}
                    onChange={(e) => handleSelect(product, parseInt(e.target.value))}
                  >
                    <option value="-1" disabled>Select category</option>
                    {customsDescriptions.map((category) => (
                      <option key={category.id} value={customsDescriptions.indexOf(category)}>
                        {category.description} (HS: {category.hsTarifNumber || 'N/A'}, Origin: {category.countryOfOrigin || 'N/A'})
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {error && <p className="field-error" role="alert">{error}</p>}

        <div className="button-group">
          <BackButton />
          <button className="btn-primary" onClick={handleFinish}>Run Label Generator</button>
        </div>
      </div>
    </div>
  );
}

export default MapProducts;