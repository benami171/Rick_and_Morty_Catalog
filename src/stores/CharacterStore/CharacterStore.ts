import { makeAutoObservable, flow } from "mobx";
import type { CharacterFilters, ApiResponse, Character, ApiInfo} from "../../types/types";
import { fetchCharactersPage } from "../../api/route";

const INITIAL_PAGE = 1;
class CharactersStore {
    // ===== STATES =====
    characters = new Map<number, Character>();     // Cache for individual characters
    charactersList: number[] = [];                // Ordered list for display
    currentPage = INITIAL_PAGE;
    nextPage = INITIAL_PAGE + 1;
    apiInfo: ApiInfo | null = null;
    loading = false;
    error: string | null = null;
    filters: CharacterFilters = {};

    constructor() {
        makeAutoObservable(this);
    }

    // ===== COMPUTED PROPERTIES =====
    get hasNextPage(): boolean {
        return this.apiInfo?.next !== null;
    }

    get hasPreviousPage(): boolean {
        return this.apiInfo?.prev !== null;
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

    // ===== API METHODS =====
    fetchCharacters = flow(function* (this: CharactersStore, pageNumber = 1) {

        if (this.loading) return;

        this.loading = true;
        this.error = null;

        try {
            const data: ApiResponse = yield fetchCharactersPage(pageNumber, this.filters);
            console.log(`Fetched page ${pageNumber} with ${data.results.length} characters`);

            // Cache characters 
            this.cacheCharacters(data.results);
            
            // For direct page loading (like character detail page), replace the list
            // For sequential loading (like infinite scroll), append to the list
            if (pageNumber === 1 || this.charactersList.length === 0) {
                // Starting fresh or loading first page
                this.charactersList = data.results.map(char => char.id);
            } else if (pageNumber === this.currentPage + 1) {
                // Sequential loading - append for infinite scroll
                this.charactersList.push(...data.results.map(char => char.id));
            } else {
                // Direct page access - replace with this page's characters
                this.charactersList = data.results.map(char => char.id);
            }
            
            this.apiInfo = data.info;
            this.currentPage = pageNumber;
            this.nextPage = pageNumber + 1;

        } catch (error) {
            this.error = error instanceof Error ? error.message : "Failed to fetch characters";
        } finally {
            this.loading = false;
        }
    });

    // ===== PAGE UTILITIES =====     
    isCharacterCached(characterId: number): boolean {
        return this.characters.has(characterId);
    }
       
    isPageCached(page: number): boolean {
        const startId = (page - 1) * 20 + 1;
        const endId = page * 20;

        // Check if we have all characters for this page
        for (let id = startId; id <= endId; id++) {
            if (!this.characters.has(id)) {
                return false;
            }
        }
        return true;
    }

    // Enhanced method for loading a specific character with smart page loading
    loadPageGetCharacter = flow(function* (this: CharactersStore, characterId: number) {
        
        const cachedCharacter = this.characters.get(characterId);
        if (cachedCharacter) return cachedCharacter;

        const targetPage = Math.ceil(characterId / 20);
        try {
            // Use a dedicated method that only caches characters without updating the main list
            const data: ApiResponse = yield fetchCharactersPage(targetPage, this.filters);
            
            this.cacheCharacters(data.results);
            const requestedCharacter = this.characters.get(characterId);
            if (requestedCharacter) {
                return requestedCharacter;
            } else {
                return null;
            }

        } catch (error) { 
            console.error(`Error loading character ${characterId}:`, error);
            throw error;
        }
    });

    // ===== FILTER ACTIONS =====
    setFilters(filters: CharacterFilters): void {
        this.filters = { ...filters };
        this.resetPagination();
    }

    clearFilters(): void {
        this.filters = {};
        this.resetPagination();
    }

    applyFilters = flow(function* (this: CharactersStore, filters: CharacterFilters) {
        this.setFilters(filters);
        yield this.fetchCharacters();
    });

}

// ===== SINGLETON EXPORT =====
export const charactersStore = new CharactersStore();