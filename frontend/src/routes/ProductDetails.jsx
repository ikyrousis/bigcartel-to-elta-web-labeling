import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import BackButton from '../components/BackButton';

function ProductDetails() {
  const { uniqueProducts, productDetails, setProductDetails } = useAppContext();
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setForm({ ...productDetails });
  }, [productDetails]);

  const handleChange = (product, field, value) => {
    setForm(prev => ({
      ...prev,
      [product]: { ...prev[product], [field]: value }
    }));
    if (error) setError('');
  };

const handleNumericChange = (product, field) => (e) => {
  const raw = e.target.value;
  const decimals = field === 'weight' ? 3 : 2;
  if (raw !== '' && !new RegExp(`^\\d*\\.?\\d{0,${decimals}}$`).test(raw)) return;
  handleChange(product, field, raw >= 0 ? raw : '');
};

  const handleNext = () => {
    const missing = uniqueProducts.find(
      (product) => !form[product]?.weight || !form[product]?.customsValue
    );
    if (missing) {
      setError(`Please fill out all fields for "${missing}"`);
      return;
    }

    setError('');
    setProductDetails(form);
    navigate('/core-weight');
  };

  return (
    <div className="page-wrapper">
      <div className="centered-container">
        <h2>📦 Enter Weight & Value for Products</h2>

        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Weight (kg)</th>
              <th>Customs Value (€)</th>
            </tr>
          </thead>
          <tbody>
            {uniqueProducts.map((product) => (
              <tr key={product}>
                <td>{product}</td>
                <td>
                  <input
                    placeholder="0.000"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form[product]?.weight || ''}
                    onChange={handleNumericChange(product, 'weight')}
                  />
                </td>
                <td>
                  <input
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form[product]?.customsValue || ''}
                    onChange={handleNumericChange(product, 'customsValue')}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {error && <p className="field-error" role="alert">{error}</p>}

        <div className="button-group">
          <BackButton />
          <button className="btn-primary" onClick={handleNext}>Next</button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;