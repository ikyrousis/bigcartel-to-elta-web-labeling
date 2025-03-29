import { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [csvPath, setCsvPath] = useState('');
  const [uniqueProducts, setUniqueProducts] = useState([]);
  const [productDetails, setProductDetails] = useState({});
  const [corePackagingWeight, setCorePackagingWeight] = useState('');
  const [customsDescriptions, setCustomsDescriptions] = useState([]);
  const [productToDescription, setProductToDescription] = useState({});

  return (
    <AppContext.Provider
      value={{
        csvPath, setCsvPath,
        uniqueProducts, setUniqueProducts,
        productDetails, setProductDetails,
        corePackagingWeight, setCorePackagingWeight,
        customsDescriptions, setCustomsDescriptions,
        productToDescription, setProductToDescription
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
