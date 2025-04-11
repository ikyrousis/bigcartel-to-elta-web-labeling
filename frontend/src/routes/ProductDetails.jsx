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
    <div className="page-wrapper">
      <div className="centered-container">
        <h2>📦 Enter Weight & Value for Products</h2>
        
        <div className="product-details-container">
          {uniqueProducts.map((product) => (
            <div key={product} className="product-input-group">
              <h3>{product}</h3>
              <div className="input-row">
                <input
                  placeholder="Weight (kg)"
                  type="number"
                  step="0.01"
                  value={form[product]?.weight || ''}
                  onChange={(e) => handleChange(product, 'weight', e.target.value)}
                />
                <input
                  placeholder="Customs Value (€)"
                  type="number"
                  step="0.01"
                  value={form[product]?.customsValue || ''}
                  onChange={(e) => handleChange(product, 'customsValue', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="button-group">
          <button onClick={handleBack}>Back</button>
          <button onClick={handleNext}>Next</button>
        </div>
      </div>
    </div>
  ); 
}

export default ProductDetails;