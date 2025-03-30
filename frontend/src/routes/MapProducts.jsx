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
    <div style={{ padding: '2rem' }}>
      <h2>🔗 Match Products to Customs Descriptions</h2>

      {uniqueProducts.map(product => (
        <div key={product} style={{ marginBottom: '1rem' }}>
          <label><strong>{product}</strong></label>
          <select
            value={mapping[product] || ''}
            onChange={(e) => handleSelect(product, e.target.value)}
          >
            <option value="" disabled>Select category</option>
            {customsDescriptions.map((desc, i) => (
              <option key={i} value={desc}>{desc}</option>
            ))}
          </select>
        </div>
      ))}

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button onClick={handleBack}>Back</button>
        <button onClick={handleFinish}>Run Label Generator</button>
      </div>
    </div>
  );
}

export default MapProducts;
