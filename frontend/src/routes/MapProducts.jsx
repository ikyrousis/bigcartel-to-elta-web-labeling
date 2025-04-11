import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

function MapProducts() {
  const {
    uniqueProducts,
    customsDescriptions,
    productToDescription,
    setProductToDescription,
    csvPath,
    productDetails,
    corePackagingWeight
  } = useAppContext();

  const [mapping, setMapping] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    setMapping({ ...productToDescription });
  }, [productToDescription]);

  const handleSelect = (product, value) => {
    setMapping(prev => ({
      ...prev,
      [product]: value
    }));
  };

  const handleFinish = () => {
    const missing = uniqueProducts.find(p => !mapping[p]);
    if (missing) {
      alert(`Please assign a description to "${missing}"`);
      return;
    }

    setProductToDescription(mapping);

    window.electronAPI.runLabelGenerator({
      csvPath,
      productDetails,
      corePackagingWeight,
      productToDescription: mapping
    });
  };

  const handleBack = () => {
    navigate('/customs-descriptions');
  };

  return (
    <div className="page-wrapper">
      <div className="centered-container">
        <h2>🔗 Match Products to Customs Descriptions</h2>

        <div className="mapping-container">
          {uniqueProducts.map((product, index) => (
            <div key={product}>
              <div className="mapping-item">
                <span className="mapping-product" style={{ textAlign: 'left' }}>{product}</span>
                <select
                  className="mapping-select"
                  value={mapping[product] || ''}
                  onChange={(e) => handleSelect(product, e.target.value)}
                >
                  <option value="" disabled>Select category</option>
                  {customsDescriptions.map((desc, i) => (
                    <option key={i} value={desc}>{desc}</option>
                  ))}
                </select>
              </div>
              {index < uniqueProducts.length - 1 && <div className="mapping-divider" />}
            </div>
          ))}
        </div>

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