
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import './App.module.scss'
import Filter from "./components/Filter/Filter";
import CharactersCards from "./components/CharactersCards/CharactersCards";
import { useEffect, useState } from "react";
// this is going to be a rick and morty character catalog app
function App() {

  const [characters, setCharacters] = useState([]);
  const [page, setPage] = useState(2);
  const api = (`https://rickandmortyapi.com/api/character/?page=${page}`);
  const [info, setInfo] = useState(null); // to store pagination info

  
  // fetch the data from the api while handling fetching errors
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(api);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setCharacters(data.results);
        setInfo(data.info); // Store pagination info
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
      }
    };

    fetchData();
  }, [api]);



  return (
    <div className="App">
      <h1 className="text-center mt-2 mb-2">My
        <span className="text-primary"> Rick & Morty </span>
        Character Catalog
      </h1>

      <div className="container">
        <div className="row">
          <div className="col-3">
          <Filter />
          </div>
          <div className="col-8">
            <div className="row">
              <CharactersCards characters={characters} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
