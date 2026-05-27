import { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [csvPath, setCsvPath] = useState('');
  const [uniqueProducts, setUniqueProducts] = useState([]);
  const [productDetails, setProductDetails] = useState({});
  const [corePackagingWeight, setCorePackagingWeight] = useState('');
  const [customsDescriptions, setCustomsDescriptions] = useState([]);
  const [productToCategory, setProductToCategory] = useState({});

  return (
    <AppContext.Provider
      value={{
        csvPath, setCsvPath,
        uniqueProducts, setUniqueProducts,
        productDetails, setProductDetails,
        corePackagingWeight, setCorePackagingWeight,
        customsDescriptions, setCustomsDescriptions,
        productToCategory, setProductToCategory
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside <AppProvider>');
  return ctx;
};