import React from 'react';
import { StoreContext } from './StoreContextDefinition';
import { charactersStore } from './CharacterStore';

const store = { charactersStore };

// Provider component
export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  );
};
