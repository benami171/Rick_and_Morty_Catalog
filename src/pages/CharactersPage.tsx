import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import '../App.module.scss'
import Filter from "../components/Filter/Filter";
import CharactersCards from "../components/CharactersCards/CharactersCards";
import { type Character } from "../components/CharactersCards/CharactersCards";
import { useEffect, useState } from "react";

// Characters list page component
function CharactersPage() {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [page, setPage] = useState(1);
    const [info, setInfo] = useState<any>(null); // to store pagination info
    const [loading, setLoading] = useState(false); // to prevent multiple requests
    const [error, setError] = useState<string | null>(null);

    // fetch the initial data from the api while handling fetching errors
    useEffect(() => {
        const api = `https://rickandmortyapi.com/api/character/?page=1`;
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(api);
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const data = await response.json();
                setCharacters(data.results);
                setInfo(data.info);
                setError(null);
            } catch (err: any) {
                console.error("There was a problem with the fetch operation:", err);
                setError(err.message || "Failed to fetch characters");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // function to load more characters from the next page
    const loadMoreCharacters = async () => {
        if (loading || !info?.next) return; // prevent multiple requests or if no next page

        setLoading(true);
        const nextPage = page + 1;
        const api = `https://rickandmortyapi.com/api/character/?page=${nextPage}`;

        try {
            const response = await fetch(api);
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            setCharacters(prevCharacters => [...prevCharacters, ...data.results]); // append new characters
            setInfo(data.info);
            setPage(nextPage);
        } catch (error) {
            console.error("There was a problem with the fetch operation:", error);
            setError("Failed to fetch characters");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="CharactersPage">
            <div className="container">
                <div className="row">
                    <div className="col-3">
                        <h1 className="text-left mt-2 mb-2 fs-2">My
                            <span className="text-primary"> Rick & Morty </span>
                            Character Catalog
                        </h1>
                        <Filter />
                    </div>
                    <div className="col-9 mt-2">
                        <div className="row">
                            <CharactersCards characters={characters} />
                        </div>
                        {/* Load More button */}
                        <div className="row mt-3">
                            <div className="col-12 text-center">
                                {info?.next && (
                                    <button
                                        className="btn btn-primary btn-lg"
                                        onClick={loadMoreCharacters}
                                        disabled={loading}
                                    >
                                        {loading ? "Loading..." : "Load More Characters"}
                                    </button>
                                )}
                                {!info?.next && characters.length > 0 && (
                                    <p className="text-muted">No more characters to load</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CharactersPage;
