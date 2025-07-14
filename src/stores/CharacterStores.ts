import { makeAutoObservable, runInAction } from "mobx";

//Character type 
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

// API response types
export interface ApiInfo {
  count: number;
  pages: number;
  next: string | null;
  prev: string | null;
}

interface ApiResponse {
  info: ApiInfo;
  results: Character[];
}

// Filter interface
interface CharacterFilters {
    // status can be "Alive", "Dead", or "unknown"
    // species can be Human, Alien, or other
    // gender can be Male, Female, or Genderless
    // name can be any string
  status?: string;
  species?: string;
  gender?: string;
  name?: string;
}

class CharactersStore {
  // Cache for individual characters (by ID)
  characters = new Map<number, Character>();
  
  // Ordered list of character IDs for display (maintains pagination order)
  charactersList: number[] = [];
  
  // Pagination state
  currentPage = 1;
  apiInfo: ApiInfo | null = null;
  
  // Loading states
  loading = false;
  loadingMore = false;
  
  // Error handling
  error: string | null = null;
  
  // Filters
  filters: CharacterFilters = {};
  
  constructor() {
    makeAutoObservable(this); 
  }

  // getters that will be computed automatically each time any dependency changes
  get hasNextPage(): boolean {
    return this.apiInfo?.next !== null;
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

  // Actions to modify state directly, these changes will notify observers
  // and trigger re-renders in components that use this store
  setLoading(loading: boolean) {
    this.loading = loading;
  }

  setLoadingMore(loadingMore: boolean) {
    this.loadingMore = loadingMore;
  }

  setError(error: string | null) {
    this.error = error;
  }

  setFilters(filters: CharacterFilters) {
    this.filters = { ...filters };
    // Reset pagination when filters change
    this.charactersList = [];
    this.currentPage = 1;
    this.apiInfo = null;
  }

  clearFilters() {
    this.filters = {};
    this.charactersList = [];
    this.currentPage = 1;
    this.apiInfo = null;
  }

  // Private method to build API URL with filters
  private buildApiUrl(page: number = 1): string {
    const baseUrl = `https://rickandmortyapi.com/api/character/?page=${page}`;
    const params = new URLSearchParams(); 
    
    if (this.filters.status) params.append('status', this.filters.status);
    if (this.filters.species) params.append('species', this.filters.species);
    if (this.filters.gender) params.append('gender', this.filters.gender);
    if (this.filters.name) params.append('name', this.filters.name);
    
    const paramString = params.toString();
    return paramString ? `${baseUrl}&${paramString}` : baseUrl;
  }

  // Cache characters from API response
  private cacheCharacters(characters: Character[]) {
    characters.forEach(character => {
      this.characters.set(character.id, character);
    });
  }

  // Fetch initial characters (page 1)
  async fetchCharacters() {
    if (this.loading) return; // Prevent multiple fetches

    this.setLoading(true);
    this.setError(null);

    try {
      // Fetch page 1 at first
      const response = await fetch(this.buildApiUrl(1)); 
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();


        // run in action batches the states changes so each change wont cause a re-render
        runInAction(() => {
        // Cache the characters
        this.cacheCharacters(data.results);
        // Set the display list
        this.charactersList = data.results.map(char => char.id);
        // Update pagination info
        this.apiInfo = data.info;
        this.currentPage = 1;

        // now only ONE re-render will happen here.
      });

    } catch (error) {
      console.error("Error fetching characters:", error);
      runInAction(() => {
        this.setError(error instanceof Error ? error.message : "Failed to fetch characters");
      });
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  }

  // Load more characters (next page)
  async loadMoreCharacters() {
    if (this.loadingMore || !this.hasNextPage) return;

    this.setLoadingMore(true);
    this.setError(null);

    try {
      const nextPage = this.currentPage + 1;
      const response = await fetch(this.buildApiUrl(nextPage));
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();

      runInAction(() => {
        // Cache the new characters
        this.cacheCharacters(data.results);
        
        // Append to the display list (maintaining order)
        this.charactersList.push(...data.results.map(char => char.id));
        
        // Update pagination info
        this.apiInfo = data.info;
        this.currentPage = nextPage;
      });

    } catch (error) {
      console.error("Error loading more characters:", error);
      runInAction(() => {
        this.setError(error instanceof Error ? error.message : "Failed to load more characters");
      });
    } finally {
      runInAction(() => {
        this.setLoadingMore(false);
      });
    }
  }

  // Fetch individual character by ID (for detail page)
  async fetchCharacterById(id: number): Promise<Character | null> {
    // Check cache first
    const cachedCharacter = this.characters.get(id);
    if (cachedCharacter) {
      return cachedCharacter;
    }

    try {
      const response = await fetch(`https://rickandmortyapi.com/api/character/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Character not found");
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const character: Character = await response.json();

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

  // Check if character is in cache
  isCharacterCached(id: number): boolean {
    return this.characters.has(id);
  }

  // Get character from cache (synchronous)
  getCachedCharacter(id: number): Character | undefined {
    return this.characters.get(id);
  }

  // Reset store to initial state
  reset() {
    this.characters.clear();
    this.charactersList = [];
    this.currentPage = 1;
    this.apiInfo = null;
    this.loading = false;
    this.loadingMore = false;
    this.error = null;
    this.filters = {};
  }

  // Search characters by name (triggers new API call with name filter)
  async searchCharacters(name: string) {
    this.setFilters({ ...this.filters, name });
    await this.fetchCharacters();
  }

  // Apply filters and fetch filtered results
  async applyFilters(filters: CharacterFilters) {
    this.setFilters(filters);
    await this.fetchCharacters();
  }
}

// Create and export singleton instance
export const charactersStore = new CharactersStore();