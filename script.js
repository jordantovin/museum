// Museum Tile System - Master Script
// Core functionality for tile management, forms, and rendering

// Configuration
const CONFIG = {
    csvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTKj5a8JIDfxvaw-5pPEb5nHfu_a-jZS9lFgrHqvv6JjzCTbpmMTyxVxqF5yrZPjkH961zi-u_HvQwz/pub?output=csv',
    webAppUrl: 'YOUR_WEB_APP_URL_HERE', // Replace with your deployed Web App URL from Google Apps Script
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
    draggedTile: null,
    editingTileId: null
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
    
    // Add button - toggle tile type menu
    if (addBtn) {
        addBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const rect = addBtn.getBoundingClientRect();
            tileTypeMenu.style.top = (rect.bottom + 8) + 'px';
            tileTypeMenu.style.right = '24px';
            tileTypeMenu.classList.toggle('hidden');
            filterMenu.classList.add('hidden');
        });
    }
    
    // Filter button - toggle filter menu
    if (filterBtn) {
        filterBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const rect = filterBtn.getBoundingClientRect();
            filterMenu.style.top = (rect.bottom + 8) + 'px';
            filterMenu.style.right = '24px';
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
    tileForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Check if form is valid
        if (!tileForm.checkValidity()) {
            tileForm.reportValidity();
            return;
        }
        
        await handleFormSubmit(e);
    });
    
    // Close menus when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.header-right') && !e.target.closest('.tile-type-menu')) {
            tileTypeMenu.classList.add('hidden');
        }
        if (!e.target.closest('#filterBtn') && !e.target.closest('.filter-menu')) {
            filterMenu.classList.add('hidden');
        }
    });
    
    // Load and render initial tiles
    loadTilesFromStorage();
    
    // Also try to load from Google Sheets
    loadTilesFromSheets();
    
    // If localStorage is empty, wait for Sheets to load
    if (STATE.tiles.length === 0) {
        console.log('Waiting for Google Sheets data...');
    } else {
        renderTiles();
    }
    
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
    STATE.editingTileId = null;
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
        size: STATE.selectedSize
    };

    // Collect form data
    formData.forEach((value, key) => {
        tileData[key] = value;
    });

    if (STATE.editingTileId) {
        // Update existing tile
        const tileIndex = STATE.tiles.findIndex(t => t.id === STATE.editingTileId);
        if (tileIndex !== -1) {
            tileData.id = STATE.editingTileId;
            tileData.createdAt = STATE.tiles[tileIndex].createdAt;
            tileData.updatedAt = new Date().toISOString();
            STATE.tiles[tileIndex] = tileData;
        }
    } else {
        // Create new tile
        tileData.createdAt = new Date().toISOString();
        tileData.id = generateId();
        STATE.tiles.push(tileData);
    }

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
    if (!CONFIG.webAppUrl || CONFIG.webAppUrl === 'YOUR_WEB_APP_URL_HERE') {
        console.warn('Web App URL not configured. Data saved to localStorage only.');
        console.log('To save to Google Sheets, deploy the Google Apps Script and update CONFIG.webAppUrl');
        return;
    }
    
    try {
        const response = await fetch(CONFIG.webAppUrl, {
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
        const response = await fetch(CONFIG.csvUrl);
        const csvText = await response.text();
        const tiles = parseCSV(csvText);
        STATE.tiles = tiles;
        saveTilesToStorage();
        renderTiles();
        console.log('Loaded', tiles.length, 'tiles from Google Sheets');
    } catch (error) {
        console.error('Error loading from Google Sheets:', error);
    }
}

// Parse CSV data into tile objects
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    if (lines.length < 2) return [];
    
    // Get headers from first row
    const headers = lines[0].split(',').map(h => h.trim());
    const tiles = [];
    
    // Process each data row
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = parseCSVLine(line);
        if (values.length === 0) continue;
        
        const tile = {};
        headers.forEach((header, index) => {
            if (values[index] && values[index].trim() !== '') {
                tile[header] = values[index].trim();
            }
        });
        
        // Only add if tile has required fields
        if (tile.id && tile.type) {
            tiles.push(tile);
        }
    }
    
    return tiles;
}

// Parse a CSV line handling quoted values
function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    values.push(current);
    return values;
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

    // Add click and right-click interactions (from fullscreen-editing.js)
    if (window.MUSEUM_FULLSCREEN && window.MUSEUM_FULLSCREEN.addTileInteractions) {
        window.MUSEUM_FULLSCREEN.addTileInteractions(div, tile, hasImage);
    }

    // Add drag event listeners
    div.addEventListener('dragstart', handleDragStart);
    div.addEventListener('dragend', handleDragEnd);
    div.addEventListener('dragover', handleDragOver);
    div.addEventListener('drop', handleDrop);

    return div;
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
    loadTilesFromStorage
};
