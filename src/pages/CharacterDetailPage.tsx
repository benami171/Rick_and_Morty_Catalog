import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { type Character } from "../components/CharactersCards/CharactersCards";

function CharacterDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [character, setCharacter] = useState<Character | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCharacter = async () => {
            try {
                setLoading(true);
                const response = await fetch(`https://rickandmortyapi.com/api/character/${id}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        setError("Character not found");
                    } else {
                        throw new Error("Network response was not ok");
                    }
                    return;
                }

                const data = await response.json();
                console.log("Character data:", data);
                setCharacter(data);
            } catch (error) {
                console.error("Error fetching character:", error);
                setError("Failed to load character");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCharacter();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="container mt-4">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !character) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Error!</h4>
                    <p>{error || "Character not found"}</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/')}
                    >
                        Back to Characters
                    </button>
                </div>
            </div>
        );
    }
    document.title = `${character.name} - Rick & Morty Catalog`;

    return (
        <div className="container mt-4">
            <button
                className="btn btn-secondary mb-3"
                onClick={() => navigate('/')}
            >
                ← Back to Characters
            </button>

            <div className="row">
                <div className="col-md-4">
                    <img
                        src={character.image}
                        alt={character.name}
                        className="img-fluid rounded"
                    />
                    <h1>{character.name}</h1>
                </div>
                <div className="col-md-8">
                    <div className="row">
                        <div className="col-sm-6">
                            <h5>Status:</h5>
                            <span className={`badge ${character.status === 'Alive' ? 'bg-success' :
                                character.status === 'Dead' ? 'bg-danger' : 'bg-secondary'
                                }`}>
                                {character.status}
                            </span>
                        </div>
                        <div className="col-sm-6">
                            <h5>Species:</h5>
                            <p>{character.species}</p>
                        </div>
                        <div className="col-sm-6">
                            <h5>Gender:</h5>
                            <p>{character.gender}</p>
                        </div>
                        <div className="col-sm-6">
                            <h5>Origin:</h5>
                            <p>{character.origin.name}</p>
                        </div>
                        <div className="col-sm-6">
                            <h5>Last Known Location:</h5>
                            <p>{character.location.name}</p>
                        </div>
                    </div>
                    <h5>Episodes:</h5>
                    {character.episode.length > 0 ? (
                        <ul>
                            {character.episode.map((e) => (
                                <li key={e}>
                                    {e}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No episodes found for this character.</p>
                    )}

                </div>
            </div>
        </div>
    );
}

export default CharacterDetailPage;
