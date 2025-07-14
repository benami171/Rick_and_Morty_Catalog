// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap/dist/js/bootstrap.bundle.min.js";
// import '../App.module.scss'
// import { observer } from 'mobx-react-lite';
// import { useEffect } from 'react';
// import { useCharactersStore } from '../stores/StoreContext';
// import Filter from "../components/Filter/Filter";
// import CharactersCards from "../components/CharactersCards/CharactersCards";

// // i use observer to wrap the component 
// // so that it can react to changes in the MobX store and re-render.
// const CharactersPage = observer(() => {

//     // this hook gives us access to the characters store
//     // which contains all the characters data and methods to fetch and manipulate it
//     const charactersStore = useCharactersStore();

//     // Fetch initial data when component mounts (only if not already loaded)
//     useEffect(() => {
//         // Only fetch if we don't have any characters loaded
//         if (charactersStore.charactersList.length === 0) {
//             charactersStore.fetchCharacters();
//         }
//     }, [charactersStore]);

//     return (
//         <div className="CharactersPage">
//             <div className="container">
//                 <div className="row">
//                     <div className="col-3">
//                         <h1 className="text-left mt-2 mb-2 fs-4">
//                             <span className="text-primary fs-1"> Rick & Morty </span>
//                             Character Catalog
//                         </h1>
//                         <hr />
//                         <Filter />
//                     </div>
//                     <div className="col-9 mt-2">
//                         {/* Error display */}
//                         {charactersStore.error && (
//                             <div className="alert alert-danger" role="alert">
//                                 <h4 className="alert-heading">Error!</h4>
//                                 <p>{charactersStore.error}</p>
//                                 <button
//                                     className="btn btn-primary"
//                                     onClick={() => charactersStore.fetchCharacters()}
//                                 >
//                                     Try Again
//                                 </button>
//                             </div>
//                         )}

//                         <div className="row">
//                             <CharactersCards characters={charactersStore.displayCharacters} />
//                         </div>

//                         {/* Loading spinner for initial load */}
//                         {charactersStore.loading && charactersStore.charactersList.length === 0 && (
//                             <div className="row mt-3">
//                                 <div className="col-12 text-center">
//                                     <div className="spinner-border" role="status">
//                                         <span className="visually-hidden">Loading...</span>
//                                     </div>
//                                     <p className="mt-2">Loading characters...</p>
//                                 </div>
//                             </div>
//                         )}

//                         {/* Load More button section */}
//                         {charactersStore.charactersList.length > 0 && (
//                             <div className="row mt-3">
//                                 <div className="col-12 text-center">
//                                     {charactersStore.hasNextPage && (
//                                         <button
//                                             className="btn btn-info btn-lg mb-3"
//                                             onClick={() => charactersStore.loadMoreCharacters()}
//                                             disabled={charactersStore.loadingMore}
//                                         >
//                                             {charactersStore.loadingMore ? (
//                                                 <>
//                                                     <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
//                                                     Loading...
//                                                 </>
//                                             ) : (

//                                                     "Load More Characters"

//                                             )}
//                                         </button>
//                                     )}
//                                     {!charactersStore.hasNextPage && (
//                                         <p className="text-muted">
//                                             No more characters to load ({charactersStore.charactersList.length} of {charactersStore.totalCharacters} loaded)
//                                         </p>
//                                     )}
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// });

// export default CharactersPage;



import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import styles from '../App.module.scss'
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useRef } from 'react';
import { useCharactersStore } from '../stores/StoreContext';
import Filter from "../components/Filter/Filter";
import CharactersCards from "../components/CharactersCards/CharactersCards";
import { useVirtualizer } from "@tanstack/react-virtual";
import { type Character } from '../stores/CharacterStores';

const CharactersPage = observer(() => {

    const charactersStore = useCharactersStore();
    const scrollRef = useRef<HTMLDivElement>(null);
    const characterRows = useMemo(() => {
        const characters = charactersStore.displayCharacters;
        const rows = [];
        const charactersPerRow = 4;


        for (let i = 0; i < characters.length; i += charactersPerRow) {
            rows.push(characters.slice(i, i + charactersPerRow));
        }
        return rows;
    }, [charactersStore.displayCharacters]);

    const allItems = useMemo(() => {
        const items: Array<{
            type: 'row' | 'loading';
            data: Character[] | null;
            index: number
        }> = characterRows.map((row, index) => ({
            type: 'row' as const,
            data: row,
            index
        }));

        if (charactersStore.loadingMore || charactersStore.hasNextPage) {
            items.push({
                type: 'loading',
                data: null,
                index: items.length
            });
        }

        return items;
    }, [characterRows, charactersStore.loadingMore, charactersStore.hasNextPage]);


    const virtualizer = useVirtualizer({
        count: allItems.length,
        getScrollElement: () => scrollRef.current, // The scrollable element
        estimateSize: () => 400, // Estimated height per row in pixels
        overscan: 2, // Render 2 extra items outside visible area for smooth scrolling
    });


    useEffect(() => {
        if (charactersStore.charactersList.length === 0) {
            charactersStore.fetchCharacters();
        }
    }, [charactersStore]);

    useEffect(() => {
        const [lastItem] = [...virtualizer.getVirtualItems()].reverse();

        if (!lastItem) return;

        // When we reach the last item and there are more pages, load more
        if (
            lastItem.index >= allItems.length - 1 &&
            charactersStore.hasNextPage &&
            !charactersStore.loadingMore
        ) {
            charactersStore.loadMoreCharacters();
        }
    }, [
        virtualizer.getVirtualItems(), // Re-run when visible items change
        allItems.length,
        charactersStore.hasNextPage,
        charactersStore.loadingMore,
        charactersStore
    ]);

    return (
        <div className={`${styles.CharactersPage}`}>
            <div className="container">
                <div className="row">
                    <div className="col-lg-3 col-md-4 col-sm-12">
                        <div className={styles.filterPanel}>
                            <h1 className={`${styles.title} text-center mt-2 mb-2 fs-2`}>
                                <span className={`${styles.brandName} fs-1`}>Rick&Morty</span>
                                <br />
                                Character Catalog
                            </h1>
                            <hr style={{ borderColor: 'rgba(249, 15, 242, 0.5)' }} />
                            <Filter />
                        </div>
                    </div>
                    <div className="col-lg-9 col-md-8 col-sm-12 mt-2">
                        {/* Error display */}
                        {charactersStore.error && (
                            <div className={`${styles.errorAlert} alert alert-danger`} role="alert">
                                <h4 className="alert-heading">Error!</h4>
                                <p>{charactersStore.error}</p>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => charactersStore.fetchCharacters()}
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {/* <div className="row">
                            <CharactersCards characters={charactersStore.displayCharacters} />
                        </div> */}

                        {charactersStore.charactersList.length > 0 && (
                            <div
                                ref={scrollRef} // the scroll container reference
                                style={{
                                    height: '95vh', // Fixed height for scrollable area
                                    overflow: 'auto', // Enable scrolling
                                    width: '100%',
                                }}
                                className={styles.virtualScrollContainer} // Optional: add custom styling
                            >
                                <div
                                    style={{
                                        height: `${virtualizer.getTotalSize()}px`, // Total height of all virtual items
                                        width: '100%',
                                        position: 'relative',
                                    }}
                                >
                                    {virtualizer.getVirtualItems().map((virtualItem) => {
                                        const item = allItems[virtualItem.index];

                                        return (
                                            <div
                                                key={virtualItem.index}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: `${virtualItem.size}px`,
                                                    transform: `translateY(${virtualItem.start}px)`, // Position each item
                                                }}
                                            >
                                                {item.type === 'row' ? (
                                                    <div className="row">
                                                        <CharactersCards characters={item.data || []} />
                                                    </div>
                                                ) : (
                                                    // Loading state
                                                    <div className="row mt-3">
                                                        <div className="col-12 text-center">
                                                            {charactersStore.loadingMore ? (
                                                                <>
                                                                    <div className="spinner-border" role="status">
                                                                        <span className="visually-hidden">Loading...</span>
                                                                    </div>
                                                                    <p className="mt-2">Loading more characters...</p>
                                                                </>
                                                            ) : charactersStore.hasNextPage ? (
                                                                <p className="text-muted">Scroll to load more...</p>
                                                            ) : (
                                                                <p className="text-muted">No more characters to load</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* No results found message */}
                        {charactersStore.hasNoResults && (
                            <div className={`${styles.noResults} text-center mt-5`}>
                                <div className="mb-4">
                                    <span style={{ fontSize: '4rem' }}>🔍</span>
                                </div>
                                <h3 className="mb-3">No Characters Found</h3>
                                <p className="mb-4">
                                    No characters match your current search and filter criteria.
                                </p>
                            </div>
                        )}

                        {/* Loading spinner for initial load */}
                        {charactersStore.loading && charactersStore.charactersList.length === 0 && (
                            <div className={`${styles.loadingSpinner} col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-4"`}>
                                <div className="col-12 text-center">
                                    <div className="spinner-border" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="mt-2">Loading characters...</p>
                                </div>
                            </div>
                        )}

                        {/* Load More button section */}
                        {charactersStore.charactersList.length > 0 && (
                            <div className={`${styles.loadMoreSection} row mt-3`}>
                                <div className="col-12 text-center">
                                    {/* {charactersStore.hasNextPage && (
                                        <button
                                            className="btn btn-info btn-lg mb-3"
                                            onClick={() => charactersStore.loadMoreCharacters()}
                                            disabled={charactersStore.loadingMore}
                                        >
                                            {charactersStore.loadingMore ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Loading...
                                                </>
                                            ) : (
                                                "Load More Characters"
                                            )}
                                        </button>
                                    )} */}
                                    {!charactersStore.hasNextPage && (
                                        <p className="text-muted">
                                            No more characters to load
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default CharactersPage;