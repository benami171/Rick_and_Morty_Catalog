import { useContext } from 'react';
import { StoreContext } from './StoreContextDefinition';

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
