import React, { createContext, useContext } from 'react';
import { charactersStore } from './CharacterStores';

// Create stores object (you can add more stores here later)
const stores = {
  charactersStore,
};

// Create context
const StoreContext = createContext(stores);

// Provider component
export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <StoreContext.Provider value={stores}>
      {children}
    </StoreContext.Provider>
  );
};

// Custom hook to use stores
export const useStores = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStores must be used within a StoreProvider');
  }
  return context;
};

// Individual store hooks for convenience
export const useCharactersStore = () => useStores().charactersStore;
