import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

function SelectCsv() {
  const { setCsvPath, setUniqueProducts } = useAppContext();
  const [fileName, setFileName] = useState('');
  const navigate = useNavigate();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const path = file.path;
    setCsvPath(path);
    setFileName(file.name);

    try {
      const products = await window.electronAPI.parseCsv(path);
      setUniqueProducts(products);
      navigate('/product-details');
    } catch (err) {
      console.error('Failed to parse CSV:', err);
      alert('Error reading CSV. Check the format and try again.');
    }
  };

  return (
    <div className="page-wrapper">
      <div className="centered-container select-csv-container">
        <h2>📂 Select your BigCartel orders export file</h2>
        <div className="file-input-wrapper">
          <label className="custom-file-input">
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileChange}
              className="hidden-file-input" 
            />
            <span className="file-input-button">Choose CSV File</span>
            <span className="file-input-text">{fileName || "No file chosen"}</span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default SelectCsv;