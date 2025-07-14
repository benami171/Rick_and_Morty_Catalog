
import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useCharactersStore } from '../../stores/StoreContext';

const Filter = observer(() => {
    const charactersStore = useCharactersStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [localFilters, setLocalFilters] = useState({
        status: '',
        species: '',
        gender: ''
    });

    // Handle search input change with debouncing
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
    };

    // Handle search submission
    const handleSearchSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await charactersStore.searchCharacters(searchTerm.trim());
    };

    // Handle filter changes
    const handleFilterChange = async (filterType: string, value: string) => {
        const newFilters = { ...localFilters, [filterType]: value };
        setLocalFilters(newFilters);
        
        // Apply filters including search term
        await charactersStore.applyFilters({
            ...newFilters,
            name: searchTerm.trim() || undefined
        });
    };

    // Clear all filters and search
    const handleClearAll = async () => {
        setSearchTerm('');
        setLocalFilters({ status: '', species: '', gender: '' });
        charactersStore.clearFilters();
        await charactersStore.fetchCharacters();
    };

    return (
        <div className={"p-3 border rounded bg-light"}>
            <h5 className="mb-3">Search & Filters</h5>
            
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="mb-3">
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search characters..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <button 
                        className="btn btn-outline-primary" 
                        type="submit"
                        disabled={charactersStore.loading}
                    >
                        {charactersStore.loading ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : (
                            'Search'
                        )}
                    </button>
                </div>
            </form>

            {/* Status Filter */}
            <div className="mb-3">
                <label htmlFor="status-filter" className="form-label">Status</label>
                <select
                    id="status-filter"
                    className="form-select"
                    value={localFilters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                    <option value="">All Statuses</option>
                    <option value="Alive">Alive</option>
                    <option value="Dead">Dead</option>
                    <option value="unknown">Unknown</option>
                </select>
            </div>

            {/* Species Filter */}
            <div className="mb-3">
                <label htmlFor="species-filter" className="form-label">Species</label>
                <select
                    id="species-filter"
                    className="form-select"
                    value={localFilters.species}
                    onChange={(e) => handleFilterChange('species', e.target.value)}
                >
                    <option value="">All Species</option>
                    <option value="Human">Human</option>
                    <option value="Alien">Alien</option>
                    <option value="Humanoid">Humanoid</option>
                    <option value="Robot">Robot</option>
                    <option value="Animal">Animal</option>
                    <option value="Cronenberg">Cronenberg</option>
                    <option value="Disease">Disease</option>
                </select>
            </div>

            {/* Gender Filter */}
            <div className="mb-3">
                <label htmlFor="gender-filter" className="form-label">Gender</label>
                <select
                    id="gender-filter"
                    className="form-select"
                    value={localFilters.gender}
                    onChange={(e) => handleFilterChange('gender', e.target.value)}
                >
                    <option value="">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Genderless">Genderless</option>
                    <option value="unknown">Unknown</option>
                </select>
            </div>

            {/* Clear Filters Button */}
            <button 
                className="btn btn-secondary w-100"
                onClick={handleClearAll}
                disabled={charactersStore.loading}
            >
                Clear All Filters
            </button>

            {/* Active Filters Display */}
            {(searchTerm || localFilters.status || localFilters.species || localFilters.gender) && (
                <div className="mt-3">
                    <h6>Active Filters:</h6>
                    <div className="d-flex flex-wrap gap-1">
                        {searchTerm && (
                            <span className="badge bg-primary">Search: {searchTerm}</span>
                        )}
                        {localFilters.status && (
                            <span className="badge bg-success">Status: {localFilters.status}</span>
                        )}
                        {localFilters.species && (
                            <span className="badge bg-info">Species: {localFilters.species}</span>
                        )}
                        {localFilters.gender && (
                            <span className="badge bg-warning">Gender: {localFilters.gender}</span>
                        )}
                    </div>
                </div>
            )}

            {/* Results Count */}
            {charactersStore.charactersList.length > 0 && (
                <div className="mt-3 text-muted small">
                    Showing {charactersStore.charactersList.length} of {charactersStore.totalCharacters} characters
                </div>
            )}
        </div>
    );
});

export default Filter;