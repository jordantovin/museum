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

// DOM Elements
const elements = {
    addBtn: document.getElementById('addBtn'),
    editBtn: document.getElementById('editBtn'),
    filterBtn: document.getElementById('filterBtn'),
    tileTypeMenu: document.getElementById('tileTypeMenu'),
    filterMenu: document.getElementById('filterMenu'),
    addTileModal: document.getElementById('addTileModal'),
    tileForm: document.getElementById('tileForm'),
    formFields: document.getElementById('formFields'),
    modalTitle: document.getElementById('modalTitle'),
    tileGrid: document.getElementById('tileGrid'),
    toggleBorders: document.getElementById('toggleBorders')
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
    console.log('Elements:', elements);
    initializeEventListeners();
    loadTilesFromStorage();
    renderTiles();
});

// Event Listeners
function initializeEventListeners() {
    // Header buttons
    elements.addBtn.addEventListener('click', toggleTileTypeMenu);
    elements.editBtn.addEventListener('click', toggleEditMode);
    elements.filterBtn.addEventListener('click', toggleFilterMenu);

    // Tile type selection
    document.querySelectorAll('.tile-type-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
            STATE.selectedTileType = e.target.dataset.type;
            showAddTileModal();
        });
    });

    // Filter options
    document.querySelectorAll('.filter-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e.target.dataset.sort) {
                STATE.currentSort = e.target.dataset.sort;
            } else if (e.target.dataset.filter) {
                STATE.currentFilter = e.target.dataset.filter;
            }
            renderTiles();
            toggleFilterMenu();
        });
    });

    // Border toggle
    elements.toggleBorders.addEventListener('change', (e) => {
        if (e.target.checked) {
            elements.tileGrid.classList.remove('no-borders');
        } else {
            elements.tileGrid.classList.add('no-borders');
        }
    });

    // Modal close
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    document.querySelector('.cancel-btn').addEventListener('click', closeModal);
    elements.addTileModal.addEventListener('click', (e) => {
        if (e.target === elements.addTileModal) closeModal();
    });

    // Form submission
    elements.tileForm.addEventListener('submit', handleFormSubmit);

    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.header-btn') && !e.target.closest('.tile-type-menu')) {
            elements.tileTypeMenu.classList.add('hidden');
        }
        if (!e.target.closest('#filterBtn') && !e.target.closest('.filter-menu')) {
            elements.filterMenu.classList.add('hidden');
        }
    });
}

// Toggle Functions
function toggleTileTypeMenu(e) {
    e.stopPropagation();
    console.log('Toggle tile type menu', elements.tileTypeMenu);
    elements.tileTypeMenu.classList.toggle('hidden');
    elements.filterMenu.classList.add('hidden');
    console.log('Menu hidden class:', elements.tileTypeMenu.classList.contains('hidden'));
}

function toggleFilterMenu(e) {
    e.stopPropagation();
    console.log('Toggle filter menu', elements.filterMenu);
    elements.filterMenu.classList.toggle('hidden');
    elements.tileTypeMenu.classList.add('hidden');
    console.log('Menu hidden class:', elements.filterMenu.classList.contains('hidden'));
}

function toggleEditMode() {
    STATE.editMode = !STATE.editMode;
    elements.editBtn.classList.toggle('active');
    
    if (STATE.editMode) {
        elements.tileGrid.querySelectorAll('.tile').forEach(tile => {
            tile.classList.add('edit-mode');
            tile.draggable = true;
        });
    } else {
        elements.tileGrid.querySelectorAll('.tile').forEach(tile => {
            tile.classList.remove('edit-mode');
            tile.draggable = false;
        });
    }
}

// Modal Functions
function showAddTileModal() {
    elements.tileTypeMenu.classList.add('hidden');
    elements.modalTitle.textContent = `Add ${STATE.selectedTileType.charAt(0).toUpperCase() + STATE.selectedTileType.slice(1)}`;
    generateFormFields();
    elements.addTileModal.classList.remove('hidden');
}

function closeModal() {
    elements.addTileModal.classList.add('hidden');
    elements.tileForm.reset();
    STATE.selectedTileType = null;
    STATE.selectedSize = '1x1';
}

function generateFormFields() {
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

    elements.formFields.innerHTML = html;

    // Add size selector event listeners
    document.querySelectorAll('.size-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.size-option').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            STATE.selectedSize = btn.dataset.size;
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

    // Save to localStorage (temporary until Google Sheets integration)
    saveTilesToStorage();

    // Save to Google Sheets
    await saveTileToSheets(tileData);

    // Render and close
    renderTiles();
    closeModal();
}

// Google Sheets Integration
async function saveTileToSheets(tileData) {
    // This function will send data to Google Sheets
    // You'll need to set up a Google Apps Script Web App to receive this data
    
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
    // This function will load data from Google Sheets
    // You'll need to set up a Google Apps Script Web App to serve this data
    
    try {
        const response = await fetch(CONFIG.sheetsUrl);
        const data = await response.json();
        STATE.tiles = data;
        renderTiles();
    } catch (error) {
        console.error('Error loading from Google Sheets:', error);
    }
}

// Local Storage Functions (fallback/cache)
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
    // 'custom' uses the current order

    // Render
    elements.tileGrid.innerHTML = '';
    tilesToRender.forEach(tile => {
        const tileElement = createTileElement(tile);
        elements.tileGrid.appendChild(tileElement);
    });

    // Re-apply edit mode if active
    if (STATE.editMode) {
        elements.tileGrid.querySelectorAll('.tile').forEach(tile => {
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
    const displayTitle = tile.title || tile.firstName ? `${tile.firstName || ''} ${tile.lastName || ''}`.trim() : '';

    if (hasImage) {
        div.innerHTML = `
            <img src="${tile.upload}" alt="${displayTitle}" class="tile-image">
            <div class="tile-overlay">
                <div class="tile-overlay-title">${displayTitle}</div>
                <div class="tile-overlay-meta">${getTileMetadata(tile)}</div>
            </div>
        `;
    } else {
        div.innerHTML = `
            <div class="tile-content">
                <h3>${displayTitle}</h3>
            </div>
        `;
    }

    // Add drag event listeners
    div.addEventListener('dragstart', handleDragStart);
    div.addEventListener('dragend', handleDragEnd);
    div.addEventListener('dragover', handleDragOver);
    div.addEventListener('drop', handleDrop);

    return div;
}

function getTileMetadata(tile) {
    const parts = [];
    
    if (tile.artist) parts.push(tile.artist);
    if (tile.location) parts.push(tile.location);
    if (tile.date) parts.push(tile.date);
    if (tile.type) parts.push(tile.type);

    return parts.join(' • ');
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

    const afterElement = getDragAfterElement(elements.tileGrid, e.clientY);
    const draggable = document.querySelector('.dragging');
    
    if (afterElement == null) {
        elements.tileGrid.appendChild(draggable);
    } else {
        elements.tileGrid.insertBefore(draggable, afterElement);
    }
}

function handleDrop(e) {
    if (!STATE.editMode) return;
    
    e.preventDefault();
    
    // Update tiles order in state
    const newOrder = Array.from(elements.tileGrid.querySelectorAll('.tile')).map(tile => 
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
    loadTilesFromStorage
};
