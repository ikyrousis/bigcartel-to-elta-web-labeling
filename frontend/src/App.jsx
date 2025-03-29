import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import SelectCsv from './routes/SelectCsv';
import ProductDetails from './routes/ProductDetails';
import CoreWeight from './routes/CoreWeight'; 
import CustomsDescriptions from './routes/CustomsDescriptions';
import MapProducts from './routes/MapProducts';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<SelectCsv />} />
          <Route path="/product-details" element={<ProductDetails />} />
          <Route path="/core-weight" element={<CoreWeight />} /> 
          <Route path="/customs-descriptions" element={<CustomsDescriptions />} />
          <Route path="/map-products" element={<MapProducts />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
