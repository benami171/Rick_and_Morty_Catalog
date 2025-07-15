// Character type definition

export interface Character {
    id: number;
    name: string;
    status: string; // "Alive", "Dead", or "unknown"
    species: string; // "Human", "Alien", etc.
    type?: string | "<unknown>"; // Optional type, defaults to "<unknown>" if not provided
    gender: string; // "Male", "Female", or "Genderless"
    origin: {
        name: string;
        url: string;
    };
    location: {
        name: string;
        url: string;
    };
    image: string;
    episode: string[];
    url: string;
    created: string;
}

export interface ApiInfo {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
}

export interface ApiResponse {
    info: ApiInfo;
    results: Character[];
}

export interface CharacterFilters {
    status?: string;   // "Alive", "Dead", or "unknown"
    species?: string;  // "Human", "Alien", etc.
    gender?: string;   // "Male", "Female", "Genderless"
    name?: string;     // any string
}