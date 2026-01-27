// Museum Search Functionality

function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const clearBtn = document.getElementById('clearSearch');
    
    if (!searchInput) return;
    
    // Search on button click
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    // Search on Enter key
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Clear search
    if (clearBtn) {
        clearBtn.addEventListener('click', clearSearch);
    }
    
    // Show/hide clear button
    searchInput.addEventListener('input', function() {
        if (clearBtn) {
            clearBtn.style.display = this.value ? 'block' : 'none';
        }
    });
}

function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.toLowerCase().trim();
    
    if (!query) {
        renderTiles();
        return;
    }
    
    console.log('Searching for:', query);
    
    // Filter tiles based on search query
    const filteredTiles = STATE.tiles.filter(tile => {
        // Search in title
        if (tile.title && tile.title.toLowerCase().includes(query)) return true;
        
        // Search in artist
        if (tile.artist && tile.artist.toLowerCase().includes(query)) return true;
        
        // Search in location
        if (tile.location && tile.location.toLowerCase().includes(query)) return true;
        
        // Search in content
        if (tile.content && tile.content.toLowerCase().includes(query)) return true;
        
        // Search in media
        if (tile.media && tile.media.toLowerCase().includes(query)) return true;
        
        // Search in type
        if (tile.type && tile.type.toLowerCase().includes(query)) return true;
        
        // Search in link
        if (tile.link && tile.link.toLowerCase().includes(query)) return true;
        
        // Search in first name
        if (tile.firstName && tile.firstName.toLowerCase().includes(query)) return true;
        
        // Search in last name
        if (tile.lastName && tile.lastName.toLowerCase().includes(query)) return true;
        
        return false;
    });
    
    console.log(`Found ${filteredTiles.length} matching tiles`);
    
    // Render filtered tiles
    renderFilteredTiles(filteredTiles);
}

function renderFilteredTiles(tiles) {
    const tileGrid = document.getElementById('tileGrid');
    if (!tileGrid) return;
    
    tileGrid.innerHTML = '';
    
    if (tiles.length === 0) {
        tileGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; font-size: 18px; color: #666;">No results found</div>';
        return;
    }
    
    tiles.forEach(tile => {
        const tileElement = createTileElement(tile);
        tileGrid.appendChild(tileElement);
    });
    
    console.log('Rendered', tiles.length, 'search results');
}

function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearch');
    
    if (searchInput) {
        searchInput.value = '';
    }
    
    if (clearBtn) {
        clearBtn.style.display = 'none';
    }
    
    // Re-render all tiles with current filter/sort
    renderTiles();
}

// Initialize search when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
} else {
    initSearch();
}

// Export for global access
window.MUSEUM_SEARCH = {
    performSearch,
    clearSearch
};
