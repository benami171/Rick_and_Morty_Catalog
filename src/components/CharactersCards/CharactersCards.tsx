import styles from './CharactersCards.module.scss'
import { Link } from 'react-router-dom';
import type { Character } from '../../types/types';

const badgeColorSetter = (status: string) => {
    switch (status) {
        case "Alive":
            return "alive";
        case "Dead":
            return "dead";
        default:
            return "unknown";
    }
}

const CharactersCards = ({ characters }: { characters: Character[] }) => {
    let display;
    let badgeColor;

    if (characters) {
        display = characters.map(character => {
            badgeColor = badgeColorSetter(character.status);
            return (
                <div className="col-xl-3" key={character.id}>
                    <Link 
                        to={`/character/${character.id}`}
                        className={`${styles.card}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        <img 
                            src={character.image} 
                            className={styles.img} 
                            alt={character.name} 
                            loading="lazy"
                        />
                        <div className={styles.content}>
                            <h5 className={`${styles.characterName} fs-5 mt-2`}>
                                {character.name}
                            </h5>
                            <div className={styles.locationContainer}>
                                <div className={styles.locationText}>
                                    <span className={styles.locationLabel}>Last Known Location:</span>
                                    <br />
                                    {character.location.name}
                                </div>
                                <div className={`${styles.statusBadge} ${styles[badgeColor]} position-absolute badge`}>
                                    {character.status}
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            );
        });
    } else {
        display = <div className="col-12 text-center">No characters found</div>
    }

    return (
        <>{display}</>
    );
}

export default CharactersCards