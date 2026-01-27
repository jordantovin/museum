// Museum Fullscreen Viewer & Right-Click Editing
// This script handles fullscreen display and right-click editing functionality

let currentFullscreenIndex = -1;
let fullscreenTiles = [];

// Initialize fullscreen and right-click features when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFullscreenAndEditing);
} else {
    initFullscreenAndEditing();
}

function initFullscreenAndEditing() {
    console.log('Initializing fullscreen and editing features...');
    
    // Fullscreen viewer close handlers
    const fullscreenViewer = document.getElementById('fullscreenViewer');
    const fullscreenClose = document.querySelector('.fullscreen-close');
    
    if (fullscreenClose) {
        fullscreenClose.addEventListener('click', function() {
            fullscreenViewer.classList.add('hidden');
        });
    }
    
    if (fullscreenViewer) {
        fullscreenViewer.addEventListener('click', function(e) {
            if (e.target === fullscreenViewer) {
                fullscreenViewer.classList.add('hidden');
            }
        });
    }
    
    // Keyboard handlers
    document.addEventListener('keydown', function(e) {
        const viewer = document.getElementById('fullscreenViewer');
        if (!viewer || viewer.classList.contains('hidden')) return;
        
        if (e.key === 'Escape') {
            viewer.classList.add('hidden');
            if (window.MUSEUM_RIGHTCLICK) {
                window.MUSEUM_RIGHTCLICK.hideContextMenu();
            }
        } else if (e.key === 'ArrowRight') {
            navigateFullscreen(1);
        } else if (e.key === 'ArrowLeft') {
            navigateFullscreen(-1);
        }
    });
    
    // Close context menu when clicking anywhere
    document.addEventListener('click', function() {
        if (window.MUSEUM_RIGHTCLICK) {
            window.MUSEUM_RIGHTCLICK.hideContextMenu();
        }
    });
    
    console.log('Fullscreen and editing features initialized');
}

// Navigate to next/previous tile in fullscreen
function navigateFullscreen(direction) {
    if (fullscreenTiles.length === 0 || currentFullscreenIndex === -1) return;
    
    currentFullscreenIndex += direction;
    
    // Wrap around
    if (currentFullscreenIndex < 0) {
        currentFullscreenIndex = fullscreenTiles.length - 1;
    } else if (currentFullscreenIndex >= fullscreenTiles.length) {
        currentFullscreenIndex = 0;
    }
    
    showFullscreen(fullscreenTiles[currentFullscreenIndex], currentFullscreenIndex);
}

// Add click and right-click handlers to tiles (called from master script's createTileElement)
function addTileInteractions(div, tile, hasImage) {
    // Left-click handlers for fullscreen (object, art, sticker types only)
    if ((tile.type === 'object' || tile.type === 'art' || tile.type === 'sticker') && hasImage) {
        div.style.cursor = 'pointer';
        div.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Tile clicked, showing fullscreen');
            if (!STATE.editMode) {
                // Build list of tiles for navigation
                fullscreenTiles = STATE.tiles.filter(t => 
                    (t.type === 'object' || t.type === 'art' || t.type === 'sticker') && 
                    t.upload && t.upload.trim() !== ''
                );
                currentFullscreenIndex = fullscreenTiles.findIndex(t => t.id === tile.id);
                showFullscreen(tile, currentFullscreenIndex);
            }
        });
    }

    // Left-click handlers for Name tiles with website links
    if (tile.type === 'name' && tile.website) {
        div.style.cursor = 'pointer';
        div.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (!STATE.editMode) {
                window.open(tile.website, '_blank');
            }
        });
    }

    // Left-click handlers for tiles with link field
    if ((tile.type === 'inspiration' || tile.type === 'place' || tile.type === 'post' || tile.type === 'article') && tile.link) {
        div.style.cursor = 'pointer';
        div.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (!STATE.editMode) {
                window.open(tile.link, '_blank');
            }
        });
    }
}

// Fullscreen Viewer Function - Horizontal Layout
function showFullscreen(tile, index) {
    console.log('showFullscreen called with:', tile);
    currentFullscreenIndex = index !== undefined ? index : currentFullscreenIndex;
    
    const viewer = document.getElementById('fullscreenViewer');
    const content = document.getElementById('fullscreenContent');
    
    if (!viewer || !content) {
        console.error('Fullscreen elements not found!');
        return;
    }
    
    let html = '<div class="fullscreen-horizontal">';
    
    // Image on left
    html += '<div class="fullscreen-image-container">';
    html += `<img src="${tile.upload}" alt="${tile.title || 'Image'}" class="fullscreen-image-horizontal">`;
    html += '</div>';
    
    // Info on right
    html += '<div class="fullscreen-info-container">';
    html += `<h2>${tile.title || 'Untitled'}</h2>`;
    
    // Use the 'date' column instead of 'createdAt'
    if (tile.date) {
        html += `<p><strong>Date:</strong> ${tile.date}</p>`;
    }
    
    if (tile.artist && tile.artist !== 'Unknown') {
        html += `<p><strong>Artist:</strong> ${tile.artist}</p>`;
    }
    
    if (tile.location) {
        html += `<p><strong>Location:</strong> ${tile.location}</p>`;
    }
    
    if (tile.media) {
        html += `<p><strong>Media:</strong> ${tile.media}</p>`;
    }
    
    if (tile.coordinates) {
        html += `<p><strong>Coordinates:</strong> ${tile.coordinates}</p>`;
    }
    
    // Content box for objects, art, and stickers
    if (tile.type === 'object' || tile.type === 'art' || tile.type === 'sticker') {
        const content = tile.content || '';
        html += '<div class="fullscreen-content-box' + (content ? '' : ' empty') + '">';
        if (content) {
            html += `<h3>About</h3>`;
            html += `<p id="fullscreen-content-text">${content}</p>`;
        }
        html += '</div>';
    }
    
    // Edit button for admin
    if (window.isLoggedIn && window.isLoggedIn()) {
        html += `<button onclick="window.MUSEUM_FULLSCREEN.editFromFullscreen('${tile.id}')" style="margin-top: 20px; padding: 10px 20px; background: black; color: white; border: none; border-radius: 4px; cursor: pointer;">Edit</button>`;
    }
    
    html += '</div>';
    html += '</div>';
    
    content.innerHTML = html;
    viewer.classList.remove('hidden');
}

// Edit tile from fullscreen view
function editFromFullscreen(tileId) {
    const tile = STATE.tiles.find(t => t.id === tileId);
    if (!tile) return;
    
    // Close fullscreen
    document.getElementById('fullscreenViewer').classList.add('hidden');
    
    // Open edit form
    if (window.MUSEUM_RIGHTCLICK && window.MUSEUM_RIGHTCLICK.editTileFromRightClick) {
        window.MUSEUM_RIGHTCLICK.editTileFromRightClick(tile);
    }
}

// Export functions for use in other scripts
window.MUSEUM_FULLSCREEN = {
    addTileInteractions,
    showFullscreen,
    editFromFullscreen
};
