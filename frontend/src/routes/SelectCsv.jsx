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
    <div style={{ padding: '2rem' }}>
      <h2>📂 Select your BigCartel orders export file</h2>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <p>{fileName}</p>
    </div>
  );
}

export default SelectCsv;
