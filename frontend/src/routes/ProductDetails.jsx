import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

function ProductDetails() {
  const { uniqueProducts, setProductDetails } = useAppContext();
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  const handleChange = (product, field, value) => {
    setForm((prev) => ({
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
    navigate('/core-weight'); // go to next screen
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>📦 Enter Weight & Value for Products</h2>
      {uniqueProducts.map((product) => (
        <div key={product} style={{ marginBottom: '1rem' }}>
          <strong>{product}</strong><br />
          <input
            placeholder="Weight (kg)"
            type="number"
            step="0.01"
            onChange={(e) => handleChange(product, 'weight', e.target.value)}
          />
          <input
            placeholder="Customs Value (€)"
            type="number"
            step="0.01"
            onChange={(e) => handleChange(product, 'customsValue', e.target.value)}
          />
        </div>
      ))}
      <button onClick={handleNext}>Next</button>
    </div>
  );
}

export default ProductDetails;
