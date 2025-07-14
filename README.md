# Rick & Morty Character Catalog

A modern React TypeScript application showcasing state management, caching, filtering, and navigation patterns using MobX, and the Rick & Morty API.

## Architecture Overview

This project demonstrates production-ready patterns for:
- **MobX State Management** with centralized store architecture
- **Smart Caching & Performance** optimization
- **Advanced Navigation** with prefetching
- **Real-time Filtering** with API integration
- **Type-safe Development** with TypeScript

## Project Structure

```
src/
├── stores/
│   ├── CharacterStores.ts      # Main MobX store
│   └── StoreContext.tsx        # React Context for DI
├── pages/
│   ├── CharactersPage.tsx      # Character catalog with filters
│   └── CharacterDetailPage.tsx # Individual character view
├── components/
│   ├── CharactersCards/        # Character grid display
│   ├── Filter/                 # Search & filter UI
│   └── SearchBar/              # Search input component
```

## State Management Architecture

### MobX Store Pattern

The application uses a centralized MobX store (`CharacterStores.ts`) that manages all character-related state and business logic:

```typescript
class CharacterStores {
    // Observable state
    @observable charactersList: Character[] = [];
    @observable loading: boolean = false;
    @observable currentFilters: FilterParams = {};
    
    // Computed values
    @computed get displayCharacters() {
        return this.charactersList.filter(/* filtering logic */);
    }
    
    // Actions
    @action async fetchCharacters() { /* API calls */ }
    @action async searchCharacters(query: string) { /* Search logic */ }
}
```

### Key Design Decisions

1. **Single Source of Truth**: All character data flows through one centralized store
2. **Computed Properties**: Reactive derived state using `@computed` for efficient re-renders
3. **Action Batching**: Uses `runInAction` to batch state updates and prevent excessive re-renders
4. **Type Safety**: Full TypeScript integration with strict typing

### Store Context Pattern

Dependency injection through React Context provides clean store access:

```typescript
// StoreContext.tsx
export const useCharactersStore = () => useStores().charactersStore;

// Usage in components
const CharactersPage = observer(() => {
    const charactersStore = useCharactersStore();
    // Component logic...
});
```

## Filtering System

### Multi-layered Filtering Architecture

The filtering system operates on three levels:

1. **API-level Filtering**: Server-side filtering via Rick & Morty API parameters
2. **Client-side Caching**: Intelligent cache management for filtered results
3. **Real-time UI Updates**: Reactive updates without full page reloads

### Filter Implementation

```typescript
// Store method
@action async applyFilters(filters: FilterParams) {
    this.currentFilters = filters;
    
    if (this.shouldUseCache(filters)) {
        // Use cached results for better performance
        this.displayCharacters = this.getCachedResults(filters);
    } else {
        // Fetch fresh data from API
        await this.fetchCharactersWithFilters(filters);
    }
}

// Component implementation
const handleFilterChange = async (filterType: string, value: string) => {
    const newFilters = { ...localFilters, [filterType]: value };
    await charactersStore.applyFilters(newFilters);
};
```

### Performance Optimizations

- **Debounced Search**: Prevents excessive API calls during typing
- **Smart Caching**: Reuses previously fetched results when possible
- **Incremental Loading**: Maintains pagination state during filtering

## Navigation System

### Character Detail Navigation

The navigation system provides seamless browsing between characters with smart prefetching:

```typescript
// Navigation methods in store
@action getNextCharacterIdWithPrefetch(currentId: number): number | null {
    const nextId = this.getNextCharacterId(currentId);
    
    if (nextId && !this.charactersMap.has(nextId)) {
        // Prefetch character data in background
        this.fetchCharacterById(nextId);
    }
    
    return nextId;
}

// Component usage
const handleNextCharacter = () => {
    const nextId = charactersStore.getNextCharacterIdWithPrefetch(character.id);
    if (nextId) {
        navigate(`/character/${nextId}`);
    }
};
```

### Smart Loading Strategy

1. **Cache-First Approach**: Check local cache before API calls
2. **Background Prefetching**: Load adjacent characters proactively
3. **Infinite Scrolling**: Automatic pagination when reaching list boundaries
4. **Loading States**: Granular loading indicators for better UX

### Route-level Data Management

```typescript
// CharacterDetailPage.tsx
useEffect(() => {
    const loadCharacter = async () => {
        // Try cache first, then API
        let character = charactersStore.getCharacterFromCache(characterId);
        
        if (!character) {
            character = await charactersStore.fetchCharacterById(characterId);
        }
        
        setCurrentCharacter(character);
    };
    
    loadCharacter();
}, [characterId]);
```

## Key Features & Patterns

### 1. Observer Pattern Implementation

All React components use the `observer` HOC to automatically re-render when observable state changes:

```typescript
const CharactersPage = observer(() => {
    const charactersStore = useCharactersStore();
    
    // Component automatically re-renders when:
    // - charactersStore.charactersList changes
    // - charactersStore.loading changes
    // - Any other observable property changes
});
```

### 2. Error Handling Strategy

Centralized error management with user-friendly recovery options:

```typescript
@action async fetchCharacters() {
    try {
        this.loading = true;
        const response = await fetch(/* API call */);
        // Handle success...
    } catch (error) {
        this.error = 'Failed to load characters. Please try again.';
    } finally {
        this.loading = false;
    }
}
```

### 3. Performance Optimization Techniques

- **Memoized Computed Values**: Expensive calculations cached automatically
- **Selective Re-rendering**: Only components observing changed state re-render
- **Background Data Loading**: Non-blocking prefetch operations
- **Efficient List Rendering**: Optimized character card rendering

## Getting Started

### Prerequisites
```bash
Node.js 16+ 
npm or yarn
```

### Installation & Setup
```bash
# Clone and install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Key Dependencies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **MobX 6** - State management
- **React Router** - Client-side routing
- **Bootstrap 5** - UI components
- **Vite** - Build tool

## Testing the Architecture

### Testing State Management
1. Open browser dev tools → Network tab
2. Navigate between characters to see caching behavior
3. Apply filters and observe API call patterns
4. Use browser back/forward to test navigation state

### Testing Performance
1. Monitor network requests during filtering
2. Check re-render frequency with React DevTools
3. Test navigation speed between character details
4. Verify prefetching in background network activity

## Development Notes

### MobX Best Practices Used

1. **Strict Mode**: Enforces action usage for state mutations
2. **Computed Properties**: Derived state calculations
3. **Action Batching**: Multiple state changes in single re-render
4. **Observable Collections**: Efficient array/object tracking

### Architecture Benefits

- **Predictable State Flow**: Unidirectional data flow
- **Type Safety**: Compile-time error catching
- **Performance**: Optimized re-rendering and caching
- **Maintainability**: Clear separation of concerns

---

*This project demonstrates production-ready patterns for modern React applications with emphasis on performance, maintainability, and developer experience.*

---