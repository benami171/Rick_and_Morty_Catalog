import type { ApiResponse, CharacterFilters } from '../types/types';

const BASE_API_URL = 'https://rickandmortyapi.com/api/character';

// Rate limiting retry configuration
const RETRY_CONFIG = {
    MAX_ATTEMPTS: 3,
    INITIAL_DELAY: 1000, // 1 second
    BACKOFF_MULTIPLIER: 2, // exponential backoff: 1s, 2s, 4s
    MAX_DELAY: 10000, // 10 seconds max
};

// ===== CORE API UTILITIES =====

//Enhanced fetch with retry logic for rate limiting
async function fetchWithRetry(url: string, attempt = 1): Promise<Response> {
    try {
        const response = await fetch(url);

        // Handle rate limiting (429) with retry logic
        if (response.status === 429) {
            if (attempt >= RETRY_CONFIG.MAX_ATTEMPTS) {
                throw new Error(`Rate limit exceeded. Please try again later.`);
            }

            // Calculate delay with exponential backoff
            const baseDelay = RETRY_CONFIG.INITIAL_DELAY * Math.pow(RETRY_CONFIG.BACKOFF_MULTIPLIER, attempt - 1);
            const delay = Math.min(baseDelay, RETRY_CONFIG.MAX_DELAY);

            // Try to get Retry-After header if provided by API
            const retryAfter = response.headers.get('Retry-After');
            const finalDelay = retryAfter ? parseInt(retryAfter) * 1000 : delay;

            console.warn(`Rate limited (429). Retrying in ${finalDelay}ms (attempt ${attempt}/${RETRY_CONFIG.MAX_ATTEMPTS})`);
            
            await new Promise(resolve => setTimeout(resolve, finalDelay));
            return fetchWithRetry(url, attempt + 1);
        }

        return response;
    } catch (error) {
        if (attempt >= RETRY_CONFIG.MAX_ATTEMPTS) {
            throw error;
        }
        
        // Retry on network errors
        const delay = RETRY_CONFIG.INITIAL_DELAY * Math.pow(RETRY_CONFIG.BACKOFF_MULTIPLIER, attempt - 1);
        console.warn(`Network error. Retrying in ${delay}ms (attempt ${attempt}/${RETRY_CONFIG.MAX_ATTEMPTS})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(url, attempt + 1);
    }
}

// Build URL with pagination and filters
function buildCharactersUrl(page: number, filters: CharacterFilters = {}): string {
    const params = new URLSearchParams();
    const { status, species, gender, name } = filters;

    // Add page parameter
    params.append('page', page.toString());

    // Add filter parameters
    if (status) params.append('status', status);
    if (species) params.append('species', species);
    if (gender) params.append('gender', gender);
    if (name) params.append('name', name);

    return `${BASE_API_URL}?${params.toString()}`;
}

// ===== PUBLIC API FUNCTIONS =====

/**
 * Fetch characters page with optional filters
 * @param page - Page number (starts from 1)
 * @param filters - Optional filters for characters
 * @returns Promise<ApiResponse> - Characters data with pagination info
 */
export async function fetchCharactersPage(
    page: number = 1, 
    filters: CharacterFilters = {}
): Promise<ApiResponse> {
    const url = buildCharactersUrl(page, filters);
    
    try {
        const response = await fetchWithRetry(url);

        if (!response.ok) {
            // Handle 404 specifically for "no results found"
            if (response.status === 404) {
                return {
                    info: { count: 0, pages: 0, next: null, prev: null },
                    results: []
                };
            }
            
            // Handle other HTTP errors
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: ApiResponse = await response.json();
        return data;

    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch characters";
        throw new Error(`Failed to fetch characters page ${page}: ${message}`);
    }
}