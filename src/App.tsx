
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import './App.module.scss'
import { Routes, Route } from 'react-router-dom';
import { StoreProvider } from './stores/CharacterStore/StoreContext';
import CharactersPage from './pages/CharactersPage';
import CharacterDetailPage from './pages/CharacterDetailPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <StoreProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<CharactersPage />} />
          <Route path="/character/:id" element={<CharacterDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </StoreProvider>
  );
}

export default App;
