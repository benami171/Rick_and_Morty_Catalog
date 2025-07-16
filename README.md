# Rick & Morty Character Catalog

A modern React TypeScript application built with Vite, featuring advanced state management, virtual scrolling, smart caching, and comprehensive filtering using the Rick & Morty API.

## Features

- **Virtual Infinite Scrolling** with `@tanstack/react-virtual` for optimal performance
- **MobX State Management** with centralized store architecture 
- **Smart Caching System** with page-based character loading
- **Advanced Character Navigation** with route-based detail views
- **Real-time Search & Filtering** with debounced API calls
- **Responsive Design** using Bootstrap 5
- **TypeScript** for complete type safety
- **Error Handling** with retry logic and user-friendly messages

## Project Structure

```
src/
├── api/
│   └── route.ts                    # API utilities with retry logic
├── stores/
│   └── CharacterStore/
│       ├── CharacterStore.ts       # Main MobX store
│       ├── StoreContext.tsx        # React Context provider
│       ├── StoreContextDefinition.ts
│       └── StoreHooks.ts           # Custom hooks
├── pages/
│   ├── CharactersPage.tsx          # Main catalog with virtual scrolling
│   ├── CharacterDetailPage.tsx     # Individual character details
│   └── NotFoundPage.tsx            # 404 error page
├── components/
│   ├── CharactersCards/            # Character card components
│   └── Filter/                     # Search & filter components
├── types/
│   └── types.ts                    # TypeScript type definitions
└── assets/                         # Static assets
```

## Architecture Overview

### MobX Store Pattern

The application uses a centralized MobX store (`CharacterStore.ts`) that manages all character-related state:

```typescript
class CharactersStore {
    // Observable state
    characters = new Map<number, Character>();     // Efficient character cache
    charactersList: number[] = [];                // Ordered list for display
    currentPage = 1;
    loading = false;
    filters: CharacterFilters = {};
    searchTerm = '';
    
    // Computed values
    get displayCharacters(): Character[] {
        return this.charactersList
            .map(id => this.characters.get(id))
            .filter((char): char is Character => char !== undefined);
    }
    
    get hasActiveFilters(): boolean {
        return !!(this.filters.name || this.filters.status || 
                 this.filters.species || this.filters.gender);
    }
    
    // Actions
    fetchCharacters = flow(function* (pageNumber = 1) {
        // API calls with MobX flow for async handling
    });
}
```

### Key Design Decisions

1. **Map-based Character Cache**: Characters stored in `Map<number, Character>` for O(1) lookup
2. **Computed Properties**: Reactive derived state using MobX computed values
3. **Flow Actions**: Async operations handled with MobX `flow` for proper state management
4. **Type Safety**: Complete TypeScript integration with strict typing
5. **Virtual Scrolling**: `@tanstack/react-virtual` for rendering large lists efficiently

### Store Context Pattern

Dependency injection through React Context provides clean store access:

```typescript
// StoreHooks.ts
export const useCharactersStore = () => useStores().charactersStore;

// Usage in components
const CharactersPage = observer(() => {
    const charactersStore = useCharactersStore();
    // Component automatically re-renders when observable state changes
});
```

## 🔍 Performance Optimizations

### Virtual Scrolling Implementation

The main characters page uses virtual scrolling to handle large datasets efficiently:

```typescript
const virtualizer = useVirtualizer({
    count: allItems.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 350, // Row height estimation
    overscan: 1, // Buffer for smooth scrolling
});

// Infinite loading when reaching the end
useEffect(() => {
    const [lastItem] = [...virtualItems].reverse();
    if (lastItem?.index >= allItems.length - 1 && charactersStore.hasNextPage) {
        charactersStore.fetchCharacters(charactersStore.nextPage);
    }
}, [virtualItems, allItems.length, charactersStore.hasNextPage]);
```

### Smart Caching Strategy

1. **Character-level Caching**: Individual characters cached by ID for instant access
2. **Page-aware Loading**: Characters organized by 20-character pages
3. **Intelligent Cache Checking**: `isPageCached()` and `isCharacterCached()` methods
4. **Background Loading**: Load character pages without disrupting UI state

## 🔎 Filtering System

### Multi-layered Filtering Architecture

The filtering system operates on multiple levels:

1. **API-level Filtering**: Server-side filtering via Rick & Morty API parameters
2. **Client-side Caching**: Smart cache management for filtered and unfiltered results  
3. **Debounced Search**: Real-time search with 300ms debounce to prevent excessive API calls
4. **Filter State Management**: Reactive filter updates with MobX

### Filter Implementation

```typescript
// Debounced search in Filter component
const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    charactersStore.setSearchTerm(value);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    
    charactersStore.setSearchPending(value.trim().length > 0);
    
    debounceTimer.current = setTimeout(async () => {
        charactersStore.setSearchPending(false);
        await charactersStore.applyFilters(charactersStore.currentFilters);
    }, 300);
};

// Store filter application
applyFilters = flow(function* (filters: CharacterFilters) {
    this.setFilters(filters);
    yield this.fetchCharacters(); // Reset to page 1 with new filters
});
```

### Available Filters

- **Name Search**: Real-time text search with debouncing
- **Status Filter**: Alive, Dead, Unknown
- **Species Filter**: Human, Alien, etc.
- **Gender Filter**: Male, Female, Genderless, Unknown

## 🧭 Navigation System

### Character Detail Navigation

The character detail page provides seamless navigation between characters:

```typescript
// Navigation with smart cache utilization
const navigateToNextCharacter = async () => {
    if (!currentCharacterId || !canNavigateNext) return;

    try {
        setIsNavigating(true);
        const targetCharacterId = currentCharacterId + 1;
        const targetPage = Math.ceil(targetCharacterId / 20);

        // Preload page if not cached
        if (!charactersStore.isPageCached(targetPage)) {
            await charactersStore.fetchCharacters(targetPage);
        }
        navigate(`/character/${targetCharacterId}`);
    } catch (error) {
        console.error("Navigation error:", error);
    } finally {
        setIsNavigating(false);
    }
};
```

### Smart Loading Strategy

1. **Cache-First Loading**: Check local cache before making API calls
2. **Page-aware Navigation**: Load entire character pages (20 characters) for efficiency
3. **Route Validation**: Invalid character IDs redirect to 404 page
4. **Loading States**: Visual feedback during navigation and data loading

### Route Structure

- `/` - Main characters catalog with filtering and virtual scrolling
- `/character/:id` - Individual character detail page (IDs 1-826)
- `/404` - Not found page for invalid routes or character IDs
- `*` - Catch-all redirect to 404

### Character Loading Method

```typescript
// Enhanced character loading with smart page management
loadPageGetCharacter = flow(function* (characterId: number) {
    const cachedCharacter = this.characters.get(characterId);
    if (cachedCharacter) return cachedCharacter;

    const targetPage = Math.ceil(characterId / 20);
    try {
        const data: ApiResponse = yield fetchCharactersPage(targetPage, this.filters);
        this.cacheCharacters(data.results);
        return this.characters.get(characterId);
    } catch (error) {
        console.error(`Error loading character ${characterId}:`, error);
        throw error;
    }
});
```

## 🛠️ API Integration

### Rick & Morty API

The application integrates with the [Rick & Morty API](https://rickandmortyapi.com) for character data:

```typescript
// API utilities with retry logic (api/route.ts)
async function fetchWithRetry(url: string, attempt = 1): Promise<Response> {
    try {
        const response = await fetch(url);

        // Handle rate limiting (429) with exponential backoff
        if (response.status === 429) {
            if (attempt >= MAX_ATTEMPTS) {
                throw new Error('Rate limit exceeded. Please try again later.');
            }

            const delay = INITIAL_DELAY * Math.pow(BACKOFF_MULTIPLIER, attempt - 1);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry(url, attempt + 1);
        }

        return response;
    } catch (error) {
        // Retry on network errors with exponential backoff
        if (attempt < MAX_ATTEMPTS) {
            const delay = INITIAL_DELAY * Math.pow(BACKOFF_MULTIPLIER, attempt - 1);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry(url, attempt + 1);
        }
        throw error;
    }
}
```

### Error Handling

- **Rate Limiting**: Automatic retry with exponential backoff
- **Network Errors**: Retry mechanism for failed requests
- **User-Friendly Messages**: Clear error communication in UI
- **Graceful Degradation**: App remains functional during API issues

## ⚡ Getting Started

### Prerequisites
```bash
Node.js 18+
npm, yarn, or pnpm
```

### Installation & Development
```bash
# Clone the repository
git clone <repository-url>
cd homeassignment

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Key Dependencies

- **React 19** - Latest React with modern features
- **TypeScript 5.8** - Static type checking
- **Vite 7** - Fast build tool and dev server
- **MobX 6** - Reactive state management
- **@tanstack/react-virtual** - Virtual scrolling for performance
- **React Router 7** - Client-side routing
- **Bootstrap 5** - UI framework and responsive design
- **Sass** - CSS preprocessing

## 🧪 Key Features & Patterns

### 1. Observer Pattern with MobX

All React components use the `observer` HOC for automatic re-rendering:

```typescript
const CharactersPage = observer(() => {
    const charactersStore = useCharactersStore();
    
    // Component automatically re-renders when:
    // - charactersStore.charactersList changes
    // - charactersStore.loading changes
    // - Any other observable property changes
});
```

### 2. Virtual Scrolling Performance

Handles large datasets efficiently using `@tanstack/react-virtual`:

```typescript
const virtualizer = useVirtualizer({
    count: allItems.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 350, // Estimated row height
    overscan: 1, // Buffer for smooth scrolling
});
```

### 3. Type-Safe Development

Complete TypeScript integration with custom interfaces:

```typescript
interface Character {
    id: number;
    name: string;
    status: string;
    species: string;
    gender: string;
    origin: { name: string; url: string };
    location: { name: string; url: string };
    image: string;
    episode: string[];
    // ... additional properties
}
```

## 🔍 Testing the Application

### Testing State Management
1. Open browser dev tools → Network tab
2. Navigate between characters to observe caching behavior
3. Apply filters and observe API call patterns with debouncing
4. Test virtual scrolling performance with large datasets
5. Use browser back/forward to test navigation state persistence

### Testing Performance Features
1. **Virtual Scrolling**: Scroll through character list and monitor DOM elements
2. **Caching**: Navigate to character details and back to see instant loading
3. **Debounced Search**: Type quickly in search box and observe API call timing
4. **Filter Performance**: Apply multiple filters and check response times

### Testing Error Handling
1. **Network Issues**: Disable network in dev tools to test retry logic
2. **Invalid Routes**: Navigate to `/character/999` to test 404 handling
3. **Rate Limiting**: Rapidly refresh page to test API retry mechanisms

## 🏗️ Development Notes

### MobX Best Practices Implemented

1. **makeAutoObservable**: Simplified store setup without decorators
2. **Flow Actions**: Proper async operation handling with `flow`
3. **Computed Properties**: Efficient derived state calculations
4. **Observer Components**: Automatic re-rendering when observables change

### Architecture Benefits

- **Predictable State Flow**: Centralized state management with MobX
- **Type Safety**: Compile-time error prevention with TypeScript
- **Performance**: Virtual scrolling, smart caching, and debounced search
- **Maintainability**: Clear separation of concerns and modular structure
- **User Experience**: Responsive design, loading states, and error handling

### File Organization

```
src/
├── api/                    # API integration layer
├── assets/                 # Static assets
├── components/             # Reusable UI components
├── pages/                  # Route-level components
├── stores/                 # MobX state management
└── types/                  # TypeScript type definitions
```

---

*This Rick & Morty Character Catalog demonstrates modern React development patterns with emphasis on performance, type safety, and user experience.*