// import styles from './CharactersCards.module.scss'
// import { useNavigate } from 'react-router-dom';
// import { type Character } from '../../stores/CharacterStores';

// const badgeColorSetter = (status: string) => {
//     switch (status) {
//         case "Alive":
//             return "bg-success";
//         case "Dead":
//             return "bg-danger";
//         default:
//             return "bg-secondary";
//     }
// }

// const CharactersCards = ({ characters }: { characters: Character[] }) => {
//     const navigate = useNavigate();
//     let display;
//     let badgeColor;

//     if (characters) {
//         display = characters.map(character => {
//             badgeColor = badgeColorSetter(character.status);
//             return (
//                 <div className={"col-3 position-relative mb-3"} key={character.id}>
//                     <div
//                         className={styles.card}
//                         onClick={() => navigate(`/character/${character.id}`)}
//                         style={{ cursor: 'pointer' }}
//                     >
//                     <img src={character.image} className={`${styles.img} img-fluid`} alt={character.name} />
//                         <div className="content">
//                             <h5 className="fs-4 mb-2">{character.name}</h5>
//                             <div>
//                                 <div className="fs-6 mx-1">Last Known location: {character.location.name}</div>
//                                 <div className={`${styles.badge} position-absolute badge ${badgeColor}`}> {character.status}</div>
//                             </div>
//                         </div>
//                     </div>
//                 </div >
//             );
//         });
//     } else {
//         display = <div className="">No characters found</div>
//     }

//     return (
//         <>{display}</>
//     );

// }

// export default CharactersCards

import styles from './CharactersCards.module.scss'
import { useNavigate } from 'react-router-dom';
import { type Character } from '../../stores/CharacterStores';

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
    const navigate = useNavigate();
    let display;
    let badgeColor;

    if (characters) {
        display = characters.map(character => {
            badgeColor = badgeColorSetter(character.status);
            return (
                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-4" key={character.id}>
                    <div
                        className={styles.card}
                        onClick={() => navigate(`/character/${character.id}`)}
                        style={{ cursor: 'pointer' }}
                    >
                        <img 
                            src={character.image} 
                            className={styles.img} 
                            alt={character.name} 
                            loading="lazy"
                        />
                        <div className={styles.content}>
                            <h5 className={`${styles.characterName} fs-4`}>
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
                    </div>
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