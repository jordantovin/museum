// Museum Tile System - Main JavaScript

// Configuration
const CONFIG = {
    sheetsUrl: 'YOUR_GOOGLE_SHEETS_URL_HERE', // Replace with your Google Sheets URL
    sheetNames: {
        object: 'Object',
        sticker: 'Sticker',
        name: 'Name',
        art: 'Art',
        inspiration: 'Inspiration',
        place: 'Place',
        post: 'Post'
    }
};

// State Management
const STATE = {
    tiles: [],
    currentSort: 'newest',
    currentFilter: 'all',
    editMode: false,
    selectedTileType: null,
    selectedSize: '1x1',
    draggedTile: null
};

// Form field definitions for each tile type
const FORM_FIELDS = {
    object: [
        { name: 'upload', label: 'Upload URL', type: 'url', required: true },
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'date', label: 'Date', type: 'date', required: false },
        { name: 'location', label: 'Location', type: 'text', required: false },
        { name: 'coordinates', label: 'Coordinates', type: 'text', required: false }
    ],
    sticker: [
        { name: 'upload', label: 'Upload URL', type: 'url', required: true },
        { name: 'date', label: 'Date', type: 'date', required: false },
        { name: 'media', label: 'Media', type: 'text', required: false },
        { name: 'location', label: 'Location', type: 'text', required: false },
        { name: 'coordinates', label: 'Coordinates', type: 'text', required: false },
        { name: 'artist', label: 'Artist', type: 'text', required: false }
    ],
    name: [
        { name: 'website', label: 'Website', type: 'url', required: false },
        { name: 'firstName', label: 'First Name', type: 'text', required: true },
        { name: 'lastName', label: 'Last Name', type: 'text', required: true },
        { name: 'class', label: 'Class', type: 'text', required: false },
        { name: 'location', label: 'Location', type: 'text', required: false },
        { name: 'dateAdded', label: 'Date Added', type: 'date', required: false }
    ],
    art: [
        { name: 'upload', label: 'Upload URL', type: 'url', required: true },
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'artist', label: 'Artist', type: 'text', required: false },
        { name: 'date', label: 'Date', type: 'date', required: false }
    ],
    inspiration: [
        { name: 'upload', label: 'Upload URL', type: 'url', required: false },
        { name: 'link', label: 'Link', type: 'url', required: false },
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'artist', label: 'Artist', type: 'text', required: false }
    ],
    place: [
        { name: 'upload', label: 'Upload URL', type: 'url', required: false },
        { name: 'link', label: 'Link', type: 'url', required: false },
        { name: 'title', label: 'Title', type: 'text', required: true }
    ],
    post: [
        { name: 'upload', label: 'Upload URL', type: 'url', required: false },
        { name: 'link', label: 'Link', type: 'url', required: false },
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'content', label: 'Content', type: 'textarea', required: false }
    ]
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

function initApp() {
    console.log('Initializing Museum...');
    
    // Get DOM elements
    const addBtn = document.getElementById('addBtn');
    const editBtn = document.getElementById('editBtn');
    const filterBtn = document.getElementById('filterBtn');
    const tileTypeMenu = document.getElementById('tileTypeMenu');
    const filterMenu = document.getElementById('filterMenu');
    const addTileModal = document.getElementById('addTileModal');
    const tileForm = document.getElementById('tileForm');
    const tileGrid = document.getElementById('tileGrid');
    const toggleBorders = document.getElementById('toggleBorders');
    
    console.log('Elements found:', {
        addBtn: !!addBtn,
        editBtn: !!editBtn,
        filterBtn: !!filterBtn,
        tileTypeMenu: !!tileTypeMenu,
        filterMenu: !!filterMenu
    });
    
    // Add button - toggle tile type menu
    if (addBtn) {
        addBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('Add button clicked');
            
            // Position the menu
            const rect = addBtn.getBoundingClientRect();
            tileTypeMenu.style.top = (rect.bottom + 8) + 'px';
            tileTypeMenu.style.right = (window.innerWidth - rect.right) + 'px';
            
            tileTypeMenu.classList.toggle('hidden');
            filterMenu.classList.add('hidden');
        });
    }
    
    // Filter button - toggle filter menu
    if (filterBtn) {
        filterBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('Filter button clicked');
            
            // Position the menu
            const rect = filterBtn.getBoundingClientRect();
            filterMenu.style.top = (rect.bottom + 8) + 'px';
            filterMenu.style.right = (window.innerWidth - rect.right) + 'px';
            
            filterMenu.classList.toggle('hidden');
            tileTypeMenu.classList.add('hidden');
        });
    }
    
    // Edit button - toggle edit mode
    if (editBtn) {
        editBtn.addEventListener('click', function() {
            STATE.editMode = !STATE.editMode;
            editBtn.classList.toggle('active');
            
            const tiles = tileGrid.querySelectorAll('.tile');
            tiles.forEach(tile => {
                if (STATE.editMode) {
                    tile.classList.add('edit-mode');
                    tile.draggable = true;
                } else {
                    tile.classList.remove('edit-mode');
                    tile.draggable = false;
                }
            });
        });
    }
    
    // Tile type options
    document.querySelectorAll('.tile-type-option').forEach(btn => {
        btn.addEventListener('click', function() {
            STATE.selectedTileType = this.dataset.type;
            tileTypeMenu.classList.add('hidden');
            showAddTileModal();
        });
    });
    
    // Filter options
    document.querySelectorAll('.filter-option').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.dataset.sort) {
                STATE.currentSort = this.dataset.sort;
            } else if (this.dataset.filter) {
                STATE.currentFilter = this.dataset.filter;
            }
            renderTiles();
            filterMenu.classList.add('hidden');
        });
    });
    
    // Border toggle
    if (toggleBorders) {
        toggleBorders.addEventListener('change', function() {
            if (this.checked) {
                tileGrid.classList.remove('no-borders');
            } else {
                tileGrid.classList.add('no-borders');
            }
        });
    }
    
    // Close modal
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    document.querySelector('.cancel-btn').addEventListener('click', closeModal);
    addTileModal.addEventListener('click', function(e) {
        if (e.target === addTileModal) closeModal();
    });
    
    // Form submission
    tileForm.addEventListener('submit', handleFormSubmit);
    
    // Close menus when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.header-right') && !e.target.closest('.tile-type-menu')) {
            tileTypeMenu.classList.add('hidden');
        }
        if (!e.target.closest('#filterBtn') && !e.target.closest('.filter-menu')) {
            filterMenu.classList.add('hidden');
        }
    });
    
    // Fullscreen viewer close
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
        }
    });
    
    // Load and render initial tiles
    loadTilesFromStorage();
    renderTiles();
    
    console.log('Museum initialized successfully');
}

// Modal Functions
function showAddTileModal() {
    const modal = document.getElementById('addTileModal');
    const modalTitle = document.getElementById('modalTitle');
    
    modalTitle.textContent = `Add ${STATE.selectedTileType.charAt(0).toUpperCase() + STATE.selectedTileType.slice(1)}`;
    generateFormFields();
    modal.classList.remove('hidden');
}

function closeModal() {
    const modal = document.getElementById('addTileModal');
    const form = document.getElementById('tileForm');
    
    modal.classList.add('hidden');
    form.reset();
    STATE.selectedTileType = null;
    STATE.selectedSize = '1x1';
}

function generateFormFields() {
    const formFields = document.getElementById('formFields');
    const fields = FORM_FIELDS[STATE.selectedTileType];
    let html = '';

    fields.forEach(field => {
        html += `
            <div class="form-group">
                <label for="${field.name}">
                    ${field.label}${field.required ? ' *' : ''}
                </label>
                ${field.type === 'textarea' 
                    ? `<textarea id="${field.name}" name="${field.name}" ${field.required ? 'required' : ''}></textarea>`
                    : `<input type="${field.type}" id="${field.name}" name="${field.name}" ${field.required ? 'required' : ''}>`
                }
            </div>
        `;
    });

    formFields.innerHTML = html;

    // Add size selector event listeners
    document.querySelectorAll('.size-option').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.size-option').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            STATE.selectedSize = this.dataset.size;
        });
    });

    // Set default size
    document.querySelector('.size-option[data-size="1x1"]').classList.add('selected');
}

// Form Submission
async function handleFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const tileData = {
        type: STATE.selectedTileType,
        size: STATE.selectedSize,
        createdAt: new Date().toISOString(),
        id: generateId()
    };

    // Collect form data
    formData.forEach((value, key) => {
        tileData[key] = value;
    });

    // Add to state
    STATE.tiles.push(tileData);

    // Save to localStorage
    saveTilesToStorage();

    // Save to Google Sheets
    await saveTileToSheets(tileData);

    // Render and close
    renderTiles();
    closeModal();
}

// Google Sheets Integration
async function saveTileToSheets(tileData) {
    try {
        const response = await fetch(CONFIG.sheetsUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(tileData)
        });
        
        console.log('Tile saved to Google Sheets');
    } catch (error) {
        console.error('Error saving to Google Sheets:', error);
    }
}

async function loadTilesFromSheets() {
    try {
        const response = await fetch(CONFIG.sheetsUrl);
        const data = await response.json();
        STATE.tiles = data;
        renderTiles();
    } catch (error) {
        console.error('Error loading from Google Sheets:', error);
    }
}

// Local Storage Functions
function saveTilesToStorage() {
    localStorage.setItem('museumTiles', JSON.stringify(STATE.tiles));
}

function loadTilesFromStorage() {
    const stored = localStorage.getItem('museumTiles');
    if (stored) {
        STATE.tiles = JSON.parse(stored);
    }
}

// Tile Rendering
function renderTiles() {
    const tileGrid = document.getElementById('tileGrid');
    let tilesToRender = [...STATE.tiles];

    // Apply filter
    if (STATE.currentFilter !== 'all') {
        tilesToRender = tilesToRender.filter(tile => tile.type === STATE.currentFilter);
    }

    // Apply sort
    if (STATE.currentSort === 'newest') {
        tilesToRender.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (STATE.currentSort === 'oldest') {
        tilesToRender.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    // Render
    tileGrid.innerHTML = '';
    tilesToRender.forEach(tile => {
        const tileElement = createTileElement(tile);
        tileGrid.appendChild(tileElement);
    });

    // Re-apply edit mode if active
    if (STATE.editMode) {
        tileGrid.querySelectorAll('.tile').forEach(tile => {
            tile.classList.add('edit-mode');
            tile.draggable = true;
        });
    }
}

function createTileElement(tile) {
    const div = document.createElement('div');
    div.className = 'tile';
    div.dataset.id = tile.id;
    div.dataset.size = tile.size;
    div.dataset.type = tile.type;

    // Determine what to display
    const hasImage = tile.upload && tile.upload.trim() !== '';
    
    // Build display title based on tile type
    let displayTitle = '';
    if (tile.type === 'name') {
        displayTitle = `${tile.firstName || ''} ${tile.lastName || ''}`.trim();
    } else {
        displayTitle = tile.title || '';
    }

    // Build hover overlay content based on tile type
    let overlayContent = '';
    
    if (tile.type === 'object') {
        overlayContent = `
            <div class="tile-overlay-title">${tile.title || ''}</div>
            <div class="tile-overlay-meta">${tile.date || ''}</div>
        `;
    } else if (tile.type === 'sticker') {
        overlayContent = `
            <div class="tile-overlay-title">${tile.location || ''}</div>
            <div class="tile-overlay-meta">${tile.date || ''}</div>
        `;
    } else if (tile.type === 'name') {
        overlayContent = ''; // Just opacity, no text
    } else if (tile.type === 'art') {
        overlayContent = `
            <div class="tile-overlay-title">${tile.title || ''}</div>
            <div class="tile-overlay-meta">${tile.artist || ''}</div>
        `;
    } else if (tile.type === 'inspiration') {
        if (hasImage) {
            overlayContent = `<div class="tile-overlay-title">${tile.title || ''}</div>`;
        }
    } else if (tile.type === 'place') {
        overlayContent = `<div class="tile-overlay-title">${tile.title || ''}</div>`;
    } else if (tile.type === 'post') {
        overlayContent = `<div class="tile-overlay-title">${tile.title || ''}</div>`;
    }

    if (hasImage) {
        div.innerHTML = `
            <img src="${tile.upload}" alt="${displayTitle}" class="tile-image">
            <div class="tile-overlay">${overlayContent}</div>
        `;
    } else {
        div.innerHTML = `
            <div class="tile-content">
                <h3>${displayTitle}</h3>
            </div>
        `;
    }

    // Add click handler for fullscreen (object, art, sticker types only)
    if ((tile.type === 'object' || tile.type === 'art' || tile.type === 'sticker') && hasImage) {
        div.style.cursor = 'pointer';
        div.addEventListener('click', function(e) {
            if (!STATE.editMode) {
                showFullscreen(tile);
            }
        });
    }

    // Add click handler for Name tiles with website links
    if (tile.type === 'name' && tile.website) {
        div.style.cursor = 'pointer';
        div.addEventListener('click', function() {
            if (!STATE.editMode) {
                window.open(tile.website, '_blank');
            }
        });
    }

    // Add click handler for tiles with link field
    if ((tile.type === 'inspiration' || tile.type === 'place' || tile.type === 'post') && tile.link) {
        div.style.cursor = 'pointer';
        div.addEventListener('click', function() {
            if (!STATE.editMode) {
                window.open(tile.link, '_blank');
            }
        });
    }

    // Add drag event listeners
    div.addEventListener('dragstart', handleDragStart);
    div.addEventListener('dragend', handleDragEnd);
    div.addEventListener('dragover', handleDragOver);
    div.addEventListener('drop', handleDrop);

    return div;
}

// Fullscreen Viewer Function
function showFullscreen(tile) {
    const viewer = document.getElementById('fullscreenViewer');
    const content = document.getElementById('fullscreenContent');
    
    let html = '';
    
    if (tile.upload) {
        html += `<img src="${tile.upload}" alt="${tile.title || ''}" class="fullscreen-image">`;
    }
    
    html += '<div class="fullscreen-info">';
    
    if (tile.type === 'object') {
        if (tile.title) html += `<h2>${tile.title}</h2>`;
        if (tile.date) html += `<p>${tile.date}</p>`;
        if (tile.location) html += `<p>${tile.location}</p>`;
        if (tile.coordinates) html += `<p>${tile.coordinates}</p>`;
    } else if (tile.type === 'sticker') {
        if (tile.date) html += `<p>${tile.date}</p>`;
        if (tile.media) html += `<p>${tile.media}</p>`;
        if (tile.location) html += `<p>${tile.location}</p>`;
        if (tile.coordinates) html += `<p>${tile.coordinates}</p>`;
        if (tile.artist) html += `<p>${tile.artist}</p>`;
    } else if (tile.type === 'art') {
        if (tile.title) html += `<h2>${tile.title}</h2>`;
        if (tile.artist) html += `<p>${tile.artist}</p>`;
        if (tile.date) html += `<p>${tile.date}</p>`;
    }
    
    html += '</div>';
    
    content.innerHTML = html;
    viewer.classList.remove('hidden');
}

// Drag and Drop Functions
function handleDragStart(e) {
    if (!STATE.editMode) return;
    
    STATE.draggedTile = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
}

function handleDragOver(e) {
    if (!STATE.editMode) return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const tileGrid = document.getElementById('tileGrid');
    const afterElement = getDragAfterElement(tileGrid, e.clientY);
    const draggable = document.querySelector('.dragging');
    
    if (afterElement == null) {
        tileGrid.appendChild(draggable);
    } else {
        tileGrid.insertBefore(draggable, afterElement);
    }
}

function handleDrop(e) {
    if (!STATE.editMode) return;
    
    e.preventDefault();
    
    const tileGrid = document.getElementById('tileGrid');
    
    // Update tiles order in state
    const newOrder = Array.from(tileGrid.querySelectorAll('.tile')).map(tile => 
        STATE.tiles.find(t => t.id === tile.dataset.id)
    );
    
    STATE.tiles = newOrder;
    saveTilesToStorage();
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.tile:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Utility Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Export for debugging
window.MUSEUM = {
    STATE,
    renderTiles,
    loadTilesFromSheets,
    saveTilesToStorage,
    loadTilesFromStorage,
    showFullscreen
};
