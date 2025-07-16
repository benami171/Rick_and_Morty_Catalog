import { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate, Link } from "react-router-dom";
import { observer } from 'mobx-react-lite';
import { useCharactersStore } from '../stores/CharacterStore/StoreHooks';
import type { Character } from "../types/types";
import styles from './CharacterDetailsPage.module.scss';

const CharacterDetailPage = observer(() => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const charactersStore = useCharactersStore();

    // === CHARACTER STATE ===
    const [character, setCharacter] = useState<Character | null>(null);
    const [isLoadingCharacter, setIsLoadingCharacter] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // === URL VALIDATION ===
    const parseCharacterId = (idParam: string | undefined): number | null => {
        if (!idParam) return null;
        
        // Trim whitespace and check for non-numeric characters
        const trimmed = idParam.trim();
        
        // Check if it contains only digits (and optional leading/trailing whitespace)
        if (!/^\s*\d+\s*$/.test(trimmed)) {return null;}
        
        const parsed = parseInt(trimmed, 10);
        // Check if parsing resulted in valid character ID range
        if (isNaN(parsed) || parsed < 1 || parsed > 826) {return null;}
        
        return parsed;
    };

    // Early return for invalid character IDs - redirect to 404
    const currentCharacterId = parseCharacterId(id);
    if (id && currentCharacterId === null) {
        return <Navigate to="/404" />;
    }
    
    // === NAVIGATION STATE ===
    const [isNavigating, setIsNavigating] = useState(false);
    // === UI STATE ===
    const [showAllEpisodes, setShowAllEpisodes] = useState(false);
    // === NAVIGATION CAPABILITIES ===
    const canNavigatePrevious = currentCharacterId ? (currentCharacterId > 1) : false;
    const canNavigateNext = currentCharacterId ? (currentCharacterId < 826) : false;

    // === NAVIGATION FUNCTIONS ===
    const navigateToPreviousCharacter = async () => {
        if (!currentCharacterId || !canNavigatePrevious) return;

        try {
            setIsNavigating(true);
            const targetCharacterId = currentCharacterId - 1;
            
            const targetPage = Math.ceil(targetCharacterId / 20);
            if (!charactersStore.isPageCached(targetPage)) {
                await charactersStore.fetchCharacters(targetPage);
            }

            navigate(`/character/${targetCharacterId}`);
        } catch (error) {
            console.error("Error navigating to previous character:", error);
        } finally {
            setIsNavigating(false);
        }
    };

    const navigateToNextCharacter = async () => {
        if (!currentCharacterId || !canNavigateNext) return;

        try {
            setIsNavigating(true);
            const targetCharacterId = currentCharacterId + 1;
            const targetPage = Math.ceil(targetCharacterId / 20);

            if (!charactersStore.isPageCached(targetPage)) {
                await charactersStore.fetchCharacters(targetPage);
            }
            navigate(`/character/${targetCharacterId}`);
        } catch (error) {
            console.error("Error navigating to next character:", error);
        } finally {
            setIsNavigating(false);
        }
    };

    // === CHARACTER LOADING EFFECT ===
    useEffect(() => {
        const loadCharacter = async () => {
            // Early validation: Check if ID parameter exists and is valid
            if (!id) {
                setError("No character ID provided");
                setIsLoadingCharacter(false);
                return;
            }

            const characterId = parseCharacterId(id);
            
            // Handle invalid character ID
            if (characterId === null) {
                const errorMsg = isNaN(parseInt(id, 10)) 
                    ? `Invalid character ID: "${id}". Please provide a valid number.`
                    : `Character ID ${id} is out of range. Valid range is 1-826.`;
                setError(errorMsg);
                setIsLoadingCharacter(false);
                return;
            }

            try {
                setIsLoadingCharacter(true);
                setError(null);

                // this will get the character if it's cached or load it's page if not.
                const loadedCharacter = await charactersStore.loadPageGetCharacter(characterId);
                
                if (loadedCharacter) {
                    setCharacter(loadedCharacter);
                } else {
                    setError(`Character ${characterId} not found`);
                }

            } catch (error) {
                console.error("Error loading character:", error);
                const errorMessage = error instanceof Error ? error.message : "Failed to load character";
                setError(errorMessage);
            } finally {
                setIsLoadingCharacter(false);
            }
        };

        loadCharacter();
    }, [id, charactersStore]);

    if (isLoadingCharacter) {
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
                    <h4 className="alert-heading">
                        {error?.includes("Invalid character ID") || error?.includes("out of range") 
                            ? "Invalid Character ID" 
                            : "Character Not Found"}
                    </h4>
                    <p className="mb-3">{error || "Character not found"}</p>
                    

                    
                    <div className="d-flex gap-2">
                        <Link
                            to="/"
                            className="btn btn-primary"
                            style={{ textDecoration: 'none' }}
                        >
                            ← Back to Characters
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            {/* Navigation Controls */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <Link
                    to="/"
                    className="btn btn-outline-primary"
                    style={{ textDecoration: 'none' }}
                >
                    ← Back to Characters
                </Link>

                {/* Character Navigation */}
                <div className="d-flex align-items-center">
                    <span className="me-3 text">
                        {`Character ${currentCharacterId} of 826`}
                    </span>
                    <div className="btn-group" role="group" aria-label="Character navigation">
                        <button
                            type="button"
                            className="btn btn-outline-success"
                            onClick={navigateToPreviousCharacter}
                            disabled={!canNavigatePrevious || isNavigating}
                            title="Previous Character"
                        >
                            ← Previous
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-success"
                            onClick={navigateToNextCharacter}
                            disabled={!canNavigateNext || isNavigating}
                            title="Next Character"
                        >
                            Next →
                        </button>
                    </div>
                </div>
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
