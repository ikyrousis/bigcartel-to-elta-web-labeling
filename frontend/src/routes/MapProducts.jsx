import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

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

  const [mapping, setMapping] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    setMapping({ ...productToCategory });
  }, [productToCategory]);

  const handleSelect = (product, categoryIndex) => {
    const category = customsDescriptions[categoryIndex];
    setMapping(prev => ({
      ...prev,
      [product]: category
    }));
  };

  const handleFinish = () => {
    const missing = uniqueProducts.find(p => !mapping[p]);
    if (missing) {
      alert(`Please assign a category to "${missing}"`);
      return;
    }

    setProductToCategory(mapping);

    window.electronAPI.runLabelGenerator({
      csvPath,
      productDetails,
      corePackagingWeight,
      productToCategory: mapping
    });
  };

  const handleBack = () => {
    navigate('/customs-descriptions');
  };

  return (
    <div className="page-wrapper">
      <div className="centered-container">
        <h2>🔗 Match Products to Customs Categories</h2>

          <table className="product-table">
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
                      {customsDescriptions.map((category, i) => (
                        <option key={i} value={i}>
                          {category.description} (HS: {category.hsTarifNumber || 'N/A'}, Origin: {category.countryOfOrigin || 'N/A'})
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        <div className="button-group">
          <button onClick={handleBack}>Back</button>
          <button onClick={handleFinish} className="primary-button">
            Run Label Generator
          </button>
        </div>
      </div>
    </div>
  );
}

export default MapProducts;
