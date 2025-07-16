
import { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useCharactersStore } from '../../stores/CharacterStore/StoreHooks';
import styles from './Filter.module.scss';

const Filter = observer(() => {
    const charactersStore = useCharactersStore();

    // Debounce timer ref
    const debounceTimer = useRef<number | null>(null);

    // Handle search input change with live search
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        charactersStore.setSearchTerm(value);

        // Clear existing timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Only set pending state if we have text and aren't already pending
        const hasText = value.trim().length > 0;
        if (hasText && !charactersStore.isSearchPending) {
            charactersStore.setSearchPending(true);
        } else if (!hasText && charactersStore.isSearchPending) {
            charactersStore.setSearchPending(false);
        }

        // Set new timer
        debounceTimer.current = setTimeout(async () => {
            charactersStore.setSearchPending(false);
            // Apply filters with the current search term
            await charactersStore.applyFilters(charactersStore.currentFilters);
        }, 300); // 300ms delay
    };

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, []);

    // Handle filter changes
    const handleFilterChange = async (filterType: string, value: string) => {
        const newFilters = { ...charactersStore.filters, [filterType]: value };
        
        // Apply filters including current search term
        await charactersStore.applyFilters({
            ...newFilters,
            name: charactersStore.searchTerm.trim() || undefined
        });
    };

    // Clear all filters and search
    const handleClearAll = async () => {
        // Clear any pending debounced search
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        
        charactersStore.clearFilters();
        await charactersStore.fetchCharacters();
    };

    return (
        <div className={`${styles.filterContainer} ${charactersStore.loading ? styles.loading : ''}`}>
            <h3 className={styles.filterTitle}>Search & Filter</h3>

            {/* Search Bar */}
            <div className={styles.searchSection}>
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        className={`${styles.searchInput} ${charactersStore.searchTerm ? styles.hasValue : ''}`}
                        placeholder="Search by name..."
                        value={charactersStore.searchTerm}
                        onChange={handleSearchChange}
                    />
                    {charactersStore.isSearchPending && (
                        <div className={styles.searchIndicator}>⏳ Searching...</div>
                    )}
                </div>
            </div>

            <div className={styles.filtersSection}>
                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Status</label>
                    <select
                        className={`${styles.filterSelect} ${charactersStore.filters.status ? styles.hasValue : ''}`}
                        value={charactersStore.filters.status || ''}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="Alive">🟢 Alive</option>
                        <option value="Dead">🔴 Dead</option>
                        <option value="unknown">❓ Unknown</option>
                    </select>
                </div>

                {/* Species Filter */}
                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Species</label>
                    <select
                        className={`${styles.filterSelect} ${charactersStore.filters.species ? styles.hasValue : ''}`}
                        value={charactersStore.filters.species || ''}
                        onChange={(e) => handleFilterChange('species', e.target.value)}
                    >
                        <option value="">All Species</option>
                        <option value="Human">👤 Human</option>
                        <option value="Alien">👽 Alien</option>
                        <option value="Humanoid">🤖 Humanoid</option>
                        <option value="Poopybutthole">💩 Poopybutthole</option>
                        <option value="Mythological Creature">🦄 Mythological Creature</option>
                        <option value="Robot">⚙️ Robot</option>
                        <option value="Animal">🐾 Animal</option>
                        <option value="Cronenberg">🧬 Cronenberg</option>
                        <option value="Disease">🦠 Disease</option>
                    </select>
                </div>

                {/* Gender Filter */}
                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Gender</label>
                    <select
                        className={`${styles.filterSelect} ${charactersStore.filters.gender ? styles.hasValue : ''}`}
                        value={charactersStore.filters.gender || ''}
                        onChange={(e) => handleFilterChange('gender', e.target.value)}
                    >
                        <option value="">All Genders</option>
                        <option value="Male">♂️ Male</option>
                        <option value="Female">♀️ Female</option>
                        <option value="Genderless">⚫ Genderless</option>
                        <option value="unknown">❓ Unknown</option>
                    </select>
                </div>
            </div>

            {/* Clear Filters Button */}
            <button 
                className={styles.clearButton}
                onClick={handleClearAll}
                disabled={charactersStore.loading}
            >
                Clear All Filters
            </button>

            {/* Results Count */}
            <div className={styles.resultCount}>
                {charactersStore.hasNoResults ? (
                    <span style={{ color: '#f59e0b' }}>No characters found</span>
                ) : (
                    <>
                        Showing <strong>{charactersStore.charactersList.length}</strong> of{' '}
                        <strong>{charactersStore.totalCharacters}</strong> characters
                    </>
                )}
            </div>
        </div>
    );
});

export default Filter;