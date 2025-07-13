import React from 'react'

interface Character {
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
    console.log("CharactersCards props:", characters);
    let display;

    if (characters) {
        display = characters.map(character => {
            return (
                <div className="col-4" key={character.id}>
                    <img src={character.image} className="" alt={character.name} />
                    <div>
                        <h5 className="">{character.name}</h5>
                        <p className="text-sm">Status: {character.status}</p>
                        <p className="text-sm">Last Known: {character.location.name}</p>
                    </div>
                </div >
            );
        });
    } else {
        display = <div className="card">No characters found</div>
    }

    return (
        <>{display}</>
    );

}

export default CharactersCards