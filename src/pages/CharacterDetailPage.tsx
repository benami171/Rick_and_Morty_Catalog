import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { observer } from 'mobx-react-lite';
import { useCharactersStore } from '../stores/StoreContext';
import { type Character } from "../stores/CharacterStores";

const CharacterDetailPage = observer(() => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const charactersStore = useCharactersStore();
    
    const [character, setCharacter] = useState<Character | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCharacter = async () => {
            if (!id) return;

            const characterId = parseInt(id);
            
            try {
                setLoading(true);
                setError(null);

                // Try to get from cache first
                const cachedCharacter = charactersStore.getCachedCharacter(characterId);
                if (cachedCharacter) {
                    console.log("Character loaded from cache:", cachedCharacter);
                    setCharacter(cachedCharacter);
                    setLoading(false);
                    return;
                }

                // If not in cache, fetch from API
                console.log("Character not in cache, fetching from API...");
                const fetchedCharacter = await charactersStore.fetchCharacterById(characterId);
                setCharacter(fetchedCharacter);

            } catch (error) {
                console.error("Error fetching character:", error);
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError("Failed to load character");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCharacter();
    }, [id, charactersStore]);

    if (loading) {
        return (
            <div className="container mt-4">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading character details...</p>
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
});

export default CharacterDetailPage;
