import styles from './CharactersCards.module.scss'
import { useNavigate } from 'react-router-dom';
    


export interface Character {
    id: number;
    name: string;
    status: string;
    species: string;
    type?: string | "<unknown>";
    gender: string;
    origin: {
        name: string;
        url: string;
    };
    location: {
        name: string;
        url: string;
    };
    image: string;
    episodes: string[];
    url: string;
    created: string;
}

const CharactersCards = ({ characters = [] }: { characters: Character[] }) => {
    const navigate = useNavigate();
    let display;
    let badgeColor;

    if (characters) {
        display = characters.map(character => {
            if(character.status === "Alive") {
                badgeColor = "bg-success";
            } else if (character.status === "Dead") {
                badgeColor = "bg-danger";
            } else {
                badgeColor = "bg-secondary";
            }
            return (
                <div className={"col-3 position-relative"} key={character.id}>
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