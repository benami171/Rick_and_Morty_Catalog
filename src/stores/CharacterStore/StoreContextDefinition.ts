import { createContext } from 'react';
import { charactersStore } from './CharacterStore';

const store = { charactersStore };

export const StoreContext = createContext(store);
