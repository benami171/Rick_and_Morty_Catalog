import styles from './CharactersCards.module.scss'
import { useNavigate } from 'react-router-dom';
import { type Character } from '../../stores/CharacterStores';

const badgeColorSetter = (status: string) => {
    switch (status) {
        case "Alive":
            return "bg-success";
        case "Dead":
            return "bg-danger";
        default:
            return "bg-secondary";
    }
}

const CharactersCards = ({ characters }: { characters: Character[] }) => {
    const navigate = useNavigate();
    let display;
    let badgeColor;

    if (characters) {
        display = characters.map(character => {
            badgeColor = badgeColorSetter(character.status);
            return (
                <div className={"col-3 position-relative mb-3"} key={character.id}>
                    <div
                        className={`${styles.card}`}
                        onClick={() => navigate(`/character/${character.id}`)}
                        style={{ cursor: 'pointer' }}
                    >
                        <img src={character.image} className="img-fluid" alt={character.name} />
                        <div className="">
                            <h5 className="fs-4 mb-4">{character.name}</h5>
                            <div>
                                <p className="fs-6">Last Known: {character.location.name}</p>
                                <p className={`${styles.badge} position-absolute badge ${badgeColor}`}> {character.status}</p>
                            </div>
                        </div>
                    </div>
                </div >
            );
        });
    } else {
        display = <div className="">No characters found</div>
    }

    return (
        <>{display}</>
    );

}

export default CharactersCards