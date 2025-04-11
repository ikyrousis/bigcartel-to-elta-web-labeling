import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

function ProductDetails() {
  const { uniqueProducts, productDetails, setProductDetails } = useAppContext();
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    setForm({ ...productDetails });
  }, [productDetails]);

  const handleChange = (product, field, value) => {
    setForm(prev => ({
      ...prev,
      [product]: {
        ...prev[product],
        [field]: value
      }
    }));
  };

  const handleNext = () => {
    const missing = uniqueProducts.find(
      (product) => !form[product]?.weight || !form[product]?.customsValue
    );
    if (missing) {
      alert(`Please fill out all fields for "${missing}"`);
      return;
    }

    setProductDetails(form);
    navigate('/core-weight');
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100%',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '600px',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <h2>📦 Enter Weight & Value for Products</h2>
  
        {uniqueProducts.map((product) => (
          <div
            key={product}
            style={{
              marginBottom: '1rem',
              width: '100%',
            }}
          >
            <strong>{product}</strong>
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                width: '100%',
              }}
            >
              <input
                placeholder="Weight (kg)"
                type="number"
                step="0.01"
                style={{ flex: 1 }}
                value={form[product]?.weight || ''}
                onChange={(e) => handleChange(product, 'weight', e.target.value)}
              />
              <input
                placeholder="Customs Value (€)"
                type="number"
                step="0.01"
                style={{ flex: 1 }}
                value={form[product]?.customsValue || ''}
                onChange={(e) => handleChange(product, 'customsValue', e.target.value)}
              />
            </div>
          </div>
        ))}
  
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button onClick={handleBack}>Back</button>
          <button onClick={handleNext}>Next</button>
        </div>
      </div>
    </div>
  );  
}

export default ProductDetails;
