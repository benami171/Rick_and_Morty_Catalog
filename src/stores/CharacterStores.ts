import { makeAutoObservable, runInAction } from "mobx";
import { 
    fetchCharactersPage, 
    fetchCharacterById as apieFetchCharacterById, 
    hasMorePages,
    type CharacterFilters,
    type ApiResponse 
} from "../api/route";

// ===== TYPE DEFINITIONS =====
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

// ===== CONSTANTS =====
const INITIAL_PAGE = 1;

// ===== CHARACTERS STORE =====

class CharactersStore {
    // ===== STATE =====
    characters = new Map<number, Character>();     // Cache for individual characters
    charactersList: number[] = [];                // Ordered list for display
    currentPage = INITIAL_PAGE;
    apiInfo: ApiInfo | null = null;
    loading = false;
    loadingMore = false;
    error: string | null = null;
    filters: CharacterFilters = {};



    constructor() {
        makeAutoObservable(this);
    }

    // ===== COMPUTED PROPERTIES =====
    get hasNextPage(): boolean {
        return hasMorePages(this.apiInfo);
    }

    get displayCharacters(): Character[] {
        return this.charactersList
            .map(id => this.characters.get(id))
            .filter((char): char is Character => char !== undefined);
    }

    get totalCharacters(): number {
        return this.apiInfo?.count || 0;
    }

    get totalPages(): number {
        return this.apiInfo?.pages || 0;
    }

    get hasNoResults(): boolean {
        return !this.loading && !this.error && this.charactersList.length === 0 && this.apiInfo !== null;
    }

    get hasActiveFilters(): boolean {
        return !!(this.filters.name || this.filters.status || this.filters.species || this.filters.gender);
    }

    // ===== PRIVATE HELPERS =====
    private cacheCharacters(characters: Character[]): void {
        characters.forEach(character => {
            this.characters.set(character.id, character);
        });
    }

    private resetPagination(): void {
        this.charactersList = [];
        this.currentPage = INITIAL_PAGE;
        this.apiInfo = null;
    }

    // ===== STATE SETTERS =====
    private setLoading = (loading: boolean) => this.loading = loading;
    private setLoadingMore = (loadingMore: boolean) => this.loadingMore = loadingMore;
    private setError = (error: string | null) => this.error = error;

    // ===== FILTER ACTIONS =====
    setFilters(filters: CharacterFilters): void {
        this.filters = { ...filters };
        this.resetPagination();
    }

    clearFilters(): void {
        this.filters = {};
        this.resetPagination();
    }

    // ===== API METHODS =====
    async fetchCharacters(): Promise<void> {
        if (this.loading) return;

        this.setLoading(true);
        this.setError(null);

        try {
            const data: ApiResponse = await fetchCharactersPage(INITIAL_PAGE, this.filters);

            //runInAction to batch state updates and avoid multiple re-renders
            runInAction(() => { 
                this.cacheCharacters(data.results);
                this.charactersList = data.results.map(char => char.id);
                this.apiInfo = data.info;
                this.currentPage = INITIAL_PAGE;
            });

        } catch (error) {
            runInAction(() => {
                this.setError(error instanceof Error ? error.message : "Failed to fetch characters");
            });
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async loadMoreCharacters(): Promise<void> {
        if (this.loadingMore || !this.hasNextPage) return;

        this.setLoadingMore(true);
        this.setError(null);

        try {
            const nextPage = this.currentPage + 1;
            const data: ApiResponse = await fetchCharactersPage(nextPage, this.filters);

            runInAction(() => {
                // Cache new characters
                this.cacheCharacters(data.results); 

                // Append to the display list
                this.charactersList.push(...data.results.map(char => char.id)); 
                
                // Update pagination info
                this.apiInfo = data.info;
                this.currentPage = nextPage;
            });

        } catch (error) {
            runInAction(() => {
                this.setError(error instanceof Error ? error.message : "Failed to load more characters");
            });
        } finally {
            runInAction(() => {
                this.setLoadingMore(false);
            });
        }
    }

    // ===== CHARACTER FETCHING =====
    // Fetch individual character by ID (for detail page)
    async fetchCharacterById(id: number): Promise<Character | null> {
        // Check cache first
        const cachedCharacter = this.characters.get(id);
        if (cachedCharacter) return cachedCharacter;

        try {
            const character: Character = await apieFetchCharacterById(id);

            runInAction(() => {
                // Cache the character
                this.characters.set(character.id, character);
            });

            return character;

        } catch (error) {
            console.error(`Error fetching character ${id}:`, error);
            throw error;
        }
    }

    // ===== CACHE UTILITIES =====
    isCharacterCached(id: number): boolean {
        return this.characters.has(id);
    }

    getCachedCharacter(id: number): Character | undefined {
        return this.characters.get(id);
    }

    // ===== NAVIGATION METHODS =====
    getPreviousCharacterId(currentId: number): number | null {
        const currentIndex = this.charactersList.indexOf(currentId);
        return currentIndex > 0 ? this.charactersList[currentIndex - 1] : null;
    }

    getNextCharacterId(currentId: number): number | null {
        const currentIndex = this.charactersList.indexOf(currentId);
        const isValidIndex = currentIndex >= 0 && currentIndex < this.charactersList.length - 1;
        return isValidIndex ? this.charactersList[currentIndex + 1] : null;
    }

    getCurrentCharacterIndex(currentId: number): number {
        return this.charactersList.indexOf(currentId);
    }

    canNavigateNext(currentId: number): boolean {
        const currentIndex = this.charactersList.indexOf(currentId);
        if (currentIndex === -1) return false;
        
        return currentIndex < this.charactersList.length - 1 || this.hasNextPage;
    }

    async getNextCharacterIdWithPrefetch(currentId: number): Promise<number | null> {
        const currentIndex = this.charactersList.indexOf(currentId);
        if (currentIndex === -1) return null; // not found
        
        // Return next character if available
        if (currentIndex < this.charactersList.length - 1) {
            return this.charactersList[currentIndex + 1];
        }
        
        // Load more characters if at end and more pages exist
        if (this.hasNextPage && !this.loadingMore) {
            try {
                await this.loadMoreCharacters();
                return currentIndex < this.charactersList.length - 1 
                    ? this.charactersList[currentIndex + 1] 
                    : null;
            } catch (error) {
                console.error("Error loading more characters for navigation:", error);
            }
        }
        
        return null;
    }

    // ===== SEARCH & FILTER METHODS =====
    async searchCharacters(name: string): Promise<void> {
        this.setFilters({ ...this.filters, name });
        await this.fetchCharacters();
    }

    async applyFilters(filters: CharacterFilters): Promise<void> {
        this.setFilters(filters);
        await this.fetchCharacters();
    }

    // ===== RESET METHOD =====
    reset(): void {
        this.characters.clear();
        this.charactersList = [];
        this.currentPage = INITIAL_PAGE;
        this.apiInfo = null;
        this.loading = false;
        this.loadingMore = false;
        this.error = null;
        this.filters = {};
    }
}

// ===== SINGLETON EXPORT =====
export const charactersStore = new CharactersStore();