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
  
        <table className="product-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Weight (kg)</th>
              <th>Customs Value (€)</th>
              <th>HS Tarif Number</th>
              <th>Country of Origin</th>
            </tr>
          </thead>
          <tbody>
            {uniqueProducts.map((product) => (
              <tr key={product}>
                <td>{product}</td>
                <td>
                  <input
                    placeholder="Weight (kg)"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form[product]?.weight || ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      handleChange(product, 'weight', val >= 0 ? e.target.value : '');
                    }}
                  />
                </td>
                <td>
                  <input
                    placeholder="Customs Value (€)"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form[product]?.customsValue || ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      handleChange(product, 'customsValue', val >= 0 ? e.target.value : '');
                    }}
                  />
                </td>
                <td>
                  <input
                    placeholder="Optional"
                    type="text"
                    value={form[product]?.hsTarifNumber || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      handleChange(product, 'hsTarifNumber', val);
                    }}
                  />
                </td>
                <td>
                  <input
                    placeholder="Optional"
                    type="text"
                    maxLength="2"
                    value={form[product]?.countryOfOrigin || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^A-Za-z]/g, '').toUpperCase();
                      handleChange(product, 'countryOfOrigin', val);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
  
        <div className="button-group">
          <button className="nav-button" onClick={handleBack}>Back</button>
          <button className="nav-button primary" onClick={handleNext}>Next</button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
