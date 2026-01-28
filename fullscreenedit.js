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
        
        // Check if user is editing text
        const isEditing = document.activeElement.tagName === 'INPUT' || 
                         document.activeElement.tagName === 'TEXTAREA' ||
                         document.activeElement.isContentEditable;
        
        // Text formatting shortcuts (Cmd/Ctrl + B/I/U) when editing
        if (isEditing && (e.metaKey || e.ctrlKey)) {
            if (e.key === 'b') {
                e.preventDefault();
                document.execCommand('bold');
                return;
            } else if (e.key === 'i') {
                e.preventDefault();
                document.execCommand('italic');
                return;
            } else if (e.key === 'u') {
                e.preventDefault();
                document.execCommand('underline');
                return;
            }
        }
        
        // Don't navigate with arrow keys when editing text
        if (isEditing && (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
            // Allow normal text navigation
            return;
        }
        
        // Fullscreen navigation (only when not editing)
        if (e.key === 'Escape') {
            viewer.classList.add('hidden');
            if (window.MUSEUM_RIGHTCLICK) {
                window.MUSEUM_RIGHTCLICK.hideContextMenu();
            }
        } else if (e.key === 'ArrowRight' && !isEditing) {
            navigateFullscreen(1);
        } else if (e.key === 'ArrowLeft' && !isEditing) {
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
    
    // Title and date at the very top
    html += `<h2>${tile.title || 'Untitled'}</h2>`;
    if (tile.date) {
        // Format date to remove timestamp if present
        let displayDate = tile.date;
        if (displayDate.includes('T')) {
            displayDate = displayDate.split('T')[0];
        }
        html += `<p class="fullscreen-date">${displayDate}</p>`;
    }
    
    // Metadata section
    html += '<div class="fullscreen-metadata">';
    
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
    
    html += '</div>'; // Close metadata
    
    // Content section (no grey box, just regular text)
    if (tile.type === 'object' || tile.type === 'art' || tile.type === 'sticker') {
        const content = tile.content || '';
        if (content) {
            html += '<div class="fullscreen-content">';
            html += `<h3>About</h3>`;
            html += `<p>${content}</p>`;
            html += '</div>';
        }
    }
    
    // Edit button for admin
    if (window.isLoggedIn && window.isLoggedIn()) {
        html += `<button onclick="window.MUSEUM_FULLSCREEN.editInFullscreen('${tile.id}')" style="margin-top: 20px; padding: 10px 20px; background: black; color: white; border: none; border-radius: 4px; cursor: pointer;">Edit</button>`;
    }
    
    html += '</div>'; // Close info container
    html += '</div>';
    
    content.innerHTML = html;
    viewer.classList.remove('hidden');
}

// Edit tile inline in fullscreen view
function editInFullscreen(tileId) {
    const tile = STATE.tiles.find(t => t.id === tileId);
    if (!tile) return;
    
    // Make title editable
    const titleElement = document.querySelector('.fullscreen-info-container h2');
    const dateElement = document.querySelector('.fullscreen-date');
    const contentElement = document.querySelector('.fullscreen-content p');
    
    if (titleElement) {
        titleElement.contentEditable = true;
        titleElement.style.border = '1px solid #ccc';
        titleElement.style.padding = '5px';
        titleElement.focus();
    }
    
    if (dateElement) {
        dateElement.contentEditable = true;
        dateElement.style.border = '1px solid #ccc';
        dateElement.style.padding = '5px';
    }
    
    if (contentElement) {
        contentElement.contentEditable = true;
        contentElement.style.border = '1px solid #ccc';
        contentElement.style.padding = '10px';
    }
    
    // Change button to Save
    const editBtn = document.querySelector('.fullscreen-info-container button');
    if (editBtn) {
        editBtn.textContent = 'Save';
        editBtn.onclick = async function() {
            // Show saving state
            editBtn.disabled = true;
            editBtn.textContent = 'Saving...';
            editBtn.style.opacity = '0.6';
            
            // Save the changes
            if (titleElement) tile.title = titleElement.textContent.trim();
            if (dateElement) tile.date = dateElement.textContent.trim();
            if (contentElement) tile.content = contentElement.textContent.trim();
            
            tile.updatedAt = new Date().toISOString();
            
            // Update in STATE
            const index = STATE.tiles.findIndex(t => t.id === tileId);
            if (index !== -1) {
                STATE.tiles[index] = tile;
            }
            
            // Save to Google Sheets
            if (typeof saveTileToSheets === 'function') {
                await saveTileToSheets(tile);
                console.log('Tile saved to Google Sheets:', tile);
            } else {
                console.error('saveTileToSheets function not found!');
            }
            
            // Re-render and close
            if (typeof renderTiles === 'function') {
                renderTiles();
            }
            
            // Reset button
            editBtn.disabled = false;
            editBtn.textContent = 'Save';
            editBtn.style.opacity = '1';
            
            // Close fullscreen
            document.getElementById('fullscreenViewer').classList.add('hidden');
        };
    }
}

// Old function - keep for compatibility
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
    editFromFullscreen,
    editInFullscreen
};
