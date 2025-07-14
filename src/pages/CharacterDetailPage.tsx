import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { observer } from 'mobx-react-lite';
import { useCharactersStore } from '../stores/StoreContext';
import { type Character } from "../stores/CharacterStores";
import styles from './CharacterDetailsPage.module.scss';

const CharacterDetailPage = observer(() => {
    const { id } = useParams<{ id: string }>();         // Get character ID from URL params
    const navigate = useNavigate();                     // i will use it to navigate back to the catalog.
    const charactersStore = useCharactersStore();       // use the store to access global states and methods and to subscribe to changes.

    const [character, setCharacter] = useState<Character | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [navigatingNext, setNavigatingNext] = useState(false);
    const [showAllEpisodes, setShowAllEpisodes] = useState(false);

    // Get current character ID as number
    const currentCharacterId = id ? parseInt(id) : null;
    // Get previous character ID - for prev navigation.
    const previousCharacterId = currentCharacterId ? charactersStore.getPreviousCharacterId(currentCharacterId) : null;

    // Check if we can navigate (including potential future loads)
    const canNavigatePrevious = previousCharacterId !== null;
    const canNavigateNext = currentCharacterId ? charactersStore.canNavigateNext(currentCharacterId) : false;

    // Get current position for display
    const currentIndex = currentCharacterId ? charactersStore.getCurrentCharacterIndex(currentCharacterId) : -1;
    const totalCharacters = charactersStore.charactersList.length;

    // Navigation functions
    const goToPreviousCharacter = () => {
        if (previousCharacterId) {
            navigate(`/character/${previousCharacterId}`);
        }
    };

    const goToNextCharacter = async () => {
        if (!currentCharacterId) return;

        try {
            setNavigatingNext(true);
            // in case we are on the last character of the current list,
            // we will prefetch the next page and navigate to following character..
            const nextId = await charactersStore.getNextCharacterIdWithPrefetch(currentCharacterId);
            if (nextId) {
                navigate(`/character/${nextId}`);
            }
        } catch (error) {
            console.error("Error navigating to next character:", error);
        } finally {
            setNavigatingNext(false);
        }
    };

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
            {/* Navigation Controls */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <button
                    className="btn btn-outline-primary"
                    onClick={() => navigate('/')}
                >
                    ← Back to Characters
                </button>

                {/* Character Navigation */}
                {charactersStore.charactersList.length > 1 && (
                    <div className="d-flex align-items-center">
                        <span className="me-3 text-muted">
                            {currentIndex >= 0 ? (
                                `Character ${currentIndex + 1} of ${charactersStore.totalCharacters > 0 ? charactersStore.totalCharacters : totalCharacters}`
                            ) : (
                                `Character ${currentCharacterId} of ${charactersStore.totalCharacters > 0 ? charactersStore.totalCharacters : '826'}`
                            )}
                        </span>
                        <div className="btn-group" role="group" aria-label="Character navigation">
                            <button
                                type="button"
                                className="btn btn-outline-success"
                                onClick={goToPreviousCharacter}
                                disabled={!canNavigatePrevious}
                                title="Previous Character"
                            >
                                ← Previous
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-success"
                                onClick={goToNextCharacter}
                                disabled={!canNavigateNext || navigatingNext}
                                title="Next Character"
                            >
                                {navigatingNext ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Loading...
                                    </>
                                ) : (
                                    "Next →"
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="row">
                <div className="col-md-5">
                    <img
                        src={character.image}
                        alt={character.name}
                        className={`${styles.img} img-fluid rounded`}
                    />
                    <h1 className={`${styles.characterName}`}>{character.name}</h1>
                    <div className="col-sm-5">

                    </div>

                </div>
                <div className="col-md-6">
                    <div className="row">
                        <h5 className="fs-6 my-2">Status: <span className={`${styles.statusBadge} ${styles[character.status.toLowerCase()]} badge`}>{character.status}</span></h5>
                        <h5 className="fs-6 my-2">Species: <span>{character.species}</span></h5>
                        <h5 className="fs-6 my-2">Gender: <span>{character.gender}</span></h5>
                        <h5 className="fs-6 my-2">Origin: <span>{character.origin.name}</span></h5>
                        <h5 className="fs-6 my-2">Last Known Location: <span>{character.location.name}</span></h5>
                    </div>
                    <h5 className="fs-6 my-2">Episodes: </h5>
                    {character.episode.length > 0 ? (
                        <div className={styles.episodeSection}>

                            <ul className={styles.episodeList}>
                                {(showAllEpisodes ? character.episode : character.episode.slice(0, 5)).map((e) => (
                                    <li key={e}>
                                        {e}
                                    </li>
                                ))}
                            </ul>
                            {character.episode.length > 5 && (
                                <button
                                    className="btn btn-outline-primary btn-sm mt-2"
                                    onClick={() => setShowAllEpisodes(!showAllEpisodes)}
                                >
                                    {showAllEpisodes
                                        ? `Show Less`
                                        : `Show ${character.episode.length - 5} More Episodes`
                                    }
                                </button>
                            )}
                        </div>
                    ) : (
                        <p>No episodes found for this character.</p>
                    )}
                </div>
            </div>
        </div>
    );
});

export default CharacterDetailPage;
