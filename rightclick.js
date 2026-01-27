// Museum Right-Click Context Menu
// Handles right-click menu for editing and deleting tiles

// Initialize right-click features when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRightClick);
} else {
    initRightClick();
}

function initRightClick() {
    console.log('Initializing right-click menu...');
    
    // Close context menu when clicking anywhere
    document.addEventListener('click', function() {
        hideContextMenu();
    });
    
    // Close context menu on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideContextMenu();
        }
    });
    
    console.log('Right-click menu initialized');
}

// Add right-click handler to a tile
function addRightClickHandler(tileElement, tileData) {
    tileElement.addEventListener('contextmenu', function(e) {
        console.log('Right click detected on tile:', tileData.id);
        
        // Check if admin is logged in
        if (window.MUSEUM_ADMIN && window.MUSEUM_ADMIN.isLoggedIn && window.MUSEUM_ADMIN.isLoggedIn()) {
            console.log('Admin logged in, showing context menu');
            e.preventDefault();
            e.stopPropagation();
            showContextMenu(e, tileData);
        } else {
            console.log('Admin not logged in, context menu disabled');
        }
    });
}

// Show context menu at cursor position
function showContextMenu(e, tile) {
    hideContextMenu(); // Hide any existing menu
    
    const menu = document.createElement('div');
    menu.id = 'tileContextMenu';
    menu.className = 'context-menu';
    menu.style.left = e.pageX + 'px';
    menu.style.top = e.pageY + 'px';
    
    menu.innerHTML = `
        <div class="context-menu-item" data-action="edit">Edit</div>
        <div class="context-menu-item context-menu-item-danger" data-action="delete">Delete</div>
    `;
    
    document.body.appendChild(menu);
    
    // Add click handlers
    menu.querySelector('[data-action="edit"]').addEventListener('click', function(e) {
        e.stopPropagation();
        hideContextMenu();
        editTileFromRightClick(tile);
    });
    
    menu.querySelector('[data-action="delete"]').addEventListener('click', function(e) {
        e.stopPropagation();
        hideContextMenu();
        deleteTileFromRightClick(tile);
    });
}

// Hide context menu
function hideContextMenu() {
    const existing = document.getElementById('tileContextMenu');
    if (existing) {
        existing.remove();
    }
}

// Edit tile - opens the form modal with tile data pre-filled
function editTileFromRightClick(tile) {
    console.log('Editing tile:', tile);
    const modal = document.getElementById('addTileModal');
    const modalTitle = document.getElementById('modalTitle');
    
    if (!modal || !modalTitle) {
        console.error('Modal elements not found');
        return;
    }
    
    // Set state for editing
    STATE.selectedTileType = tile.type;
    STATE.selectedSize = tile.size;
    STATE.editingTileId = tile.id;
    
    modalTitle.textContent = `Edit ${tile.type.charAt(0).toUpperCase() + tile.type.slice(1)}`;
    
    // Generate form fields
    if (typeof generateFormFields === 'function') {
        generateFormFields();
    } else {
        console.error('generateFormFields function not found');
        return;
    }
    
    // Populate form fields with existing data
    const fields = FORM_FIELDS[tile.type];
    if (fields) {
        fields.forEach(field => {
            const input = document.getElementById(field.name);
            if (input && tile[field.name]) {
                input.value = tile[field.name];
            }
        });
    }
    
    // Select the correct size
    document.querySelectorAll('.size-option').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.size === tile.size) {
            btn.classList.add('selected');
        }
    });
    
    modal.classList.remove('hidden');
}

// Delete tile
function deleteTileFromRightClick(tile) {
    const confirmMessage = `Are you sure you want to delete this ${tile.type}?\n\nTitle: ${tile.title || tile.firstName + ' ' + tile.lastName || 'Untitled'}`;
    
    if (confirm(confirmMessage)) {
        console.log('Deleting tile:', tile.id);
        
        // Find and remove tile from STATE
        const index = STATE.tiles.findIndex(t => t.id === tile.id);
        if (index > -1) {
            STATE.tiles.splice(index, 1);
            
            // Re-render tiles
            if (typeof renderTiles === 'function') {
                renderTiles();
            }
            
            console.log('Tile deleted successfully from local state');
            
            // Delete from Google Sheets
            deleteTileFromSheets(tile.id);
        } else {
            console.error('Tile not found in STATE');
        }
    }
}

// Delete from Google Sheets
async function deleteTileFromSheets(tileId) {
    if (!CONFIG.webAppUrl || CONFIG.webAppUrl === 'YOUR_WEB_APP_URL_HERE') {
        console.warn('Web App URL not configured. Tile only deleted from localStorage.');
        return;
    }
    
    try {
        const deleteUrl = CONFIG.webAppUrl + '?action=delete&id=' + encodeURIComponent(tileId);
        console.log('Deleting from Google Sheets:', deleteUrl);
        
        const response = await fetch(deleteUrl, {
            method: 'GET',
            mode: 'cors'
        });
        
        const result = await response.json();
        console.log('Delete response from Google Sheets:', result);
        
        if (result.success) {
            console.log('Tile successfully deleted from Google Sheets');
        } else {
            console.warn('Tile deletion failed:', result.message);
        }
    } catch (error) {
        console.error('Error deleting from Google Sheets:', error);
    }
}

// Export functions for use in other scripts
window.MUSEUM_RIGHTCLICK = {
    addRightClickHandler,
    showContextMenu,
    hideContextMenu,
    editTileFromRightClick,
    deleteTileFromRightClick
};
