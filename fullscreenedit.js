// Museum Fullscreen Viewer & Right-Click Editing
// This script handles fullscreen display and right-click editing functionality

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
    
    // ESC key to close fullscreen
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            fullscreenViewer.classList.add('hidden');
            hideContextMenu();
        }
    });
    
    // Close context menu when clicking anywhere
    document.addEventListener('click', function() {
        hideContextMenu();
    });
    
    console.log('Fullscreen and editing features initialized');
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
                showFullscreen(tile);
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
    if ((tile.type === 'inspiration' || tile.type === 'place' || tile.type === 'post') && tile.link) {
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
function showFullscreen(tile) {
    console.log('showFullscreen called with:', tile);
    const viewer = document.getElementById('fullscreenViewer');
    const content = document.getElementById('fullscreenContent');
    
    if (!viewer || !content) {
        console.error('Fullscreen elements not found!');
        return;
    }
    
    let html = '<div class="fullscreen-horizontal">';
    
    // Left side - Image
    if (tile.upload) {
        html += `<div class="fullscreen-image-container">
            <img src="${tile.upload}" alt="${tile.title || ''}" class="fullscreen-image-horizontal">
        </div>`;
    }
    
    // Right side - Info
    html += '<div class="fullscreen-info-container">';
    
    if (tile.type === 'object') {
        if (tile.title) html += `<h2>${tile.title}</h2>`;
        if (tile.date) html += `<p><strong>Date:</strong> ${tile.date}</p>`;
        if (tile.location) html += `<p><strong>Location:</strong> ${tile.location}</p>`;
        if (tile.coordinates) html += `<p><strong>Coordinates:</strong> ${tile.coordinates}</p>`;
    } else if (tile.type === 'sticker') {
        if (tile.date) html += `<p><strong>Date:</strong> ${tile.date}</p>`;
        if (tile.media) html += `<p><strong>Media:</strong> ${tile.media}</p>`;
        if (tile.location) html += `<p><strong>Location:</strong> ${tile.location}</p>`;
        if (tile.coordinates) html += `<p><strong>Coordinates:</strong> ${tile.coordinates}</p>`;
        if (tile.artist) html += `<p><strong>Artist:</strong> ${tile.artist}</p>`;
    } else if (tile.type === 'art') {
        if (tile.title) html += `<h2>${tile.title}</h2>`;
        if (tile.artist) html += `<p><strong>Artist:</strong> ${tile.artist}</p>`;
        if (tile.date) html += `<p><strong>Date:</strong> ${tile.date}</p>`;
    }
    
    html += '</div></div>';
    
    content.innerHTML = html;
    viewer.classList.remove('hidden');
    console.log('Fullscreen viewer should now be visible');
}

// Edit Tile Function (opens form pre-populated with tile data)
function editTile(tile) {
    console.log('Editing tile:', tile);
    const modal = document.getElementById('addTileModal');
    const modalTitle = document.getElementById('modalTitle');
    
    STATE.selectedTileType = tile.type;
    STATE.selectedSize = tile.size;
    STATE.editingTileId = tile.id;
    
    modalTitle.textContent = `Edit ${tile.type.charAt(0).toUpperCase() + tile.type.slice(1)}`;
    generateFormFields();
    
    // Populate form fields with existing data
    const fields = FORM_FIELDS[tile.type];
    fields.forEach(field => {
        const input = document.getElementById(field.name);
        if (input && tile[field.name]) {
            input.value = tile[field.name];
        }
    });
    
    // Select the correct size
    document.querySelectorAll('.size-option').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.size === tile.size) {
            btn.classList.add('selected');
        }
    });
    
    modal.classList.remove('hidden');
}

// Export functions for use in master script
window.MUSEUM_FULLSCREEN = {
    showFullscreen,
    editTile,
    addTileInteractions
};
