// Configuration
const CONFIG = {
    nasUrl: 'https://jordantovinrhome.us2.quickconnect.to/Satchel/Museum',
    uploadEndpoint: '/upload.php',
    dataEndpoint: '/data/museum_data.json',
    uploadsPath: '/uploads/'
};

// State
let tiles = [];
let currentFilter = {
    sort: 'newest',
    types: ['object', 'sticker', 'name', 'art', 'inspiration', 'place', 'post']
};
let editMode = false;
let showBorders = true;
let selectedSize = '2x2';
let currentTileType = null;
let draggedTile = null;
let dragStartIndex = null;

// Form field configurations
const formFields = {
    object: [
        { name: 'upload', label: 'Upload', type: 'file', required: true },
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'date', label: 'Date', type: 'date', required: true },
        { name: 'location', label: 'Location', type: 'text', required: true },
        { name: 'coordinates', label: 'Coordinates', type: 'text', required: false, placeholder: 'e.g., 38.9072° N, 77.0369° W' }
    ],
    sticker: [
        { name: 'upload', label: 'Upload', type: 'file', required: true },
        { name: 'date', label: 'Date', type: 'date', required: true },
        { name: 'media', label: 'Media', type: 'text', required: true },
        { name: 'location', label: 'Location', type: 'text', required: true },
        { name: 'coordinates', label: 'Coordinates', type: 'text', required: false },
        { name: 'artist', label: 'Artist', type: 'text', required: false }
    ],
    name: [
        { name: 'website', label: 'Website', type: 'url', required: false },
        { name: 'firstName', label: 'First Name', type: 'text', required: true },
        { name: 'lastName', label: 'Last Name', type: 'text', required: true },
        { name: 'class', label: 'Class', type: 'text', required: false },
        { name: 'location', label: 'Location', type: 'text', required: false },
        { name: 'dateAdded', label: 'Date Added', type: 'date', required: true }
    ],
    art: [
        { name: 'upload', label: 'Upload', type: 'file', required: true },
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'artist', label: 'Artist', type: 'text', required: true },
        { name: 'date', label: 'Date', type: 'date', required: false }
    ],
    inspiration: [
        { name: 'upload', label: 'Upload', type: 'file', required: false },
        { name: 'link', label: 'Link', type: 'url', required: false },
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'artist', label: 'Artist', type: 'text', required: false }
    ],
    place: [
        { name: 'upload', label: 'Upload', type: 'file', required: false },
        { name: 'link', label: 'Link', type: 'url', required: false },
        { name: 'title', label: 'Title', type: 'text', required: true }
    ],
    post: [
        { name: 'upload', label: 'Upload', type: 'file', required: false },
        { name: 'link', label: 'Link', type: 'url', required: false },
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'content', label: 'Content', type: 'textarea', required: false }
    ]
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadTiles();
});

// Event Listeners
function initializeEventListeners() {
    // Control buttons
    document.getElementById('addBtn').addEventListener('click', toggleAddMenu);
    document.getElementById('filterBtn').addEventListener('click', toggleFilterPanel);
    document.getElementById('editBtn').addEventListener('click', toggleEditMode);
    document.getElementById('borderBtn').addEventListener('click', toggleBorders);
    
    // Dropdown menu items
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const type = e.target.dataset.type;
            openTileForm(type);
        });
    });
    
    // Modal
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('formModal').addEventListener('click', (e) => {
        if (e.target.id === 'formModal') closeModal();
    });
    
    // Form
    document.getElementById('tileForm').addEventListener('submit', handleFormSubmit);
    
    // Size selector
    document.querySelectorAll('.size-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            selectSize(btn.dataset.size);
        });
    });
    
    // Filter panel
    document.getElementById('sortSelect').addEventListener('change', (e) => {
        currentFilter.sort = e.target.value;
        applyFilters();
    });
    
    document.querySelectorAll('.checkbox-label input').forEach(checkbox => {
        checkbox.addEventListener('change', updateTypeFilters);
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const menu = document.getElementById('tileTypeMenu');
        const addBtn = document.getElementById('addBtn');
        if (!menu.contains(e.target) && !addBtn.contains(e.target)) {
            menu.classList.remove('active');
        }
    });
}

// Toggle Functions
function toggleAddMenu() {
    const menu = document.getElementById('tileTypeMenu');
    menu.classList.toggle('active');
}

function toggleFilterPanel() {
    const panel = document.getElementById('filterPanel');
    const btn = document.getElementById('filterBtn');
    panel.classList.toggle('active');
    btn.classList.toggle('active');
}

function toggleEditMode() {
    editMode = !editMode;
    const btn = document.getElementById('editBtn');
    const grid = document.getElementById('tileGrid');
    
    btn.classList.toggle('active');
    
    if (editMode) {
        grid.querySelectorAll('.tile').forEach(tile => {
            tile.classList.add('edit-mode');
            tile.draggable = true;
        });
    } else {
        grid.querySelectorAll('.tile').forEach(tile => {
            tile.classList.remove('edit-mode');
            tile.draggable = false;
        });
        saveTileOrder();
    }
}

function toggleBorders() {
    showBorders = !showBorders;
    const grid = document.getElementById('tileGrid');
    const btn = document.getElementById('borderBtn');
    
    grid.classList.toggle('no-borders');
    btn.classList.toggle('active');
}

// Form Management
function openTileForm(type) {
    currentTileType = type;
    const modal = document.getElementById('formModal');
    const title = document.getElementById('formTitle');
    const fieldsContainer = document.getElementById('formFields');
    
    title.textContent = `Add ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    fieldsContainer.innerHTML = '';
    
    const fields = formFields[type];
    fields.forEach(field => {
        const fieldHtml = createFormField(field);
        fieldsContainer.insertAdjacentHTML('beforeend', fieldHtml);
    });
    
    // Add file input listeners
    fieldsContainer.querySelectorAll('.file-input').forEach(input => {
        input.addEventListener('change', handleFileSelect);
    });
    
    modal.classList.add('active');
    document.getElementById('tileTypeMenu').classList.remove('active');
}

function createFormField(field) {
    const required = field.required ? 'required' : '';
    const placeholder = field.placeholder || '';
    
    if (field.type === 'file') {
        return `
            <div class="form-section">
                <label class="form-label">${field.label}${field.required ? ' *' : ''}</label>
                <div class="file-input-wrapper">
                    <label class="file-input-label" for="${field.name}">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span>Choose file</span>
                    </label>
                    <input type="file" id="${field.name}" name="${field.name}" class="file-input" accept="image/*,video/*" ${required}>
                    <div class="file-name" style="display:none;"></div>
                </div>
            </div>
        `;
    } else if (field.type === 'textarea') {
        return `
            <div class="form-section">
                <label class="form-label" for="${field.name}">${field.label}${field.required ? ' *' : ''}</label>
                <textarea id="${field.name}" name="${field.name}" class="form-input" placeholder="${placeholder}" ${required}></textarea>
            </div>
        `;
    } else {
        return `
            <div class="form-section">
                <label class="form-label" for="${field.name}">${field.label}${field.required ? ' *' : ''}</label>
                <input type="${field.type}" id="${field.name}" name="${field.name}" class="form-input" placeholder="${placeholder}" ${required}>
            </div>
        `;
    }
}

function handleFileSelect(e) {
    const input = e.target;
    const label = input.parentElement.querySelector('.file-input-label');
    const fileName = input.parentElement.querySelector('.file-name');
    
    if (input.files && input.files[0]) {
        label.classList.add('has-file');
        fileName.style.display = 'block';
        fileName.textContent = input.files[0].name;
    }
}

function selectSize(size) {
    selectedSize = size;
    document.querySelectorAll('.size-option').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.querySelector(`[data-size="${size}"]`).classList.add('selected');
}

function closeModal() {
    const modal = document.getElementById('formModal');
    modal.classList.remove('active');
    document.getElementById('tileForm').reset();
    document.querySelectorAll('.file-input-label').forEach(label => {
        label.classList.remove('has-file');
    });
    document.querySelectorAll('.file-name').forEach(name => {
        name.style.display = 'none';
    });
}

// Form Submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    formData.append('type', currentTileType);
    formData.append('size', selectedSize);
    formData.append('createdAt', new Date().toISOString());
    
    try {
        const response = await fetch(CONFIG.nasUrl + CONFIG.uploadEndpoint, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Upload failed');
        }
        
        const result = await response.json();
        
        if (result.success) {
            tiles.push(result.tile);
            renderTiles();
            closeModal();
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to create tile. Please try again.');
    }
}

// Tile Loading and Rendering
async function loadTiles() {
    try {
        const response = await fetch(CONFIG.nasUrl + CONFIG.dataEndpoint);
        
        if (response.ok) {
            const data = await response.json();
            tiles = data.tiles || [];
            renderTiles();
        } else {
            // File doesn't exist yet, start with empty array
            tiles = [];
            renderTiles();
        }
    } catch (error) {
        console.error('Error loading tiles:', error);
        renderTiles();
    }
}

function renderTiles() {
    const grid = document.getElementById('tileGrid');
    
    // Apply filters
    let filteredTiles = [...tiles];
    
    // Filter by type
    filteredTiles = filteredTiles.filter(tile => 
        currentFilter.types.includes(tile.type)
    );
    
    // Sort
    if (currentFilter.sort === 'newest') {
        filteredTiles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (currentFilter.sort === 'oldest') {
        filteredTiles.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    // custom sort uses the current order
    
    if (filteredTiles.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <h2>No tiles yet</h2>
                <p>Click the + button to create your first tile</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = '';
    
    filteredTiles.forEach((tile, index) => {
        const tileElement = createTileElement(tile, index);
        grid.appendChild(tileElement);
    });
    
    // Add drag listeners if in edit mode
    if (editMode) {
        grid.querySelectorAll('.tile').forEach(tile => {
            tile.classList.add('edit-mode');
            tile.draggable = true;
            addDragListeners(tile);
        });
    }
}

function createTileElement(tile, index) {
    const div = document.createElement('div');
    div.className = 'tile';
    div.dataset.size = tile.size;
    div.dataset.index = index;
    div.dataset.type = tile.type;
    
    const content = getTileContent(tile);
    div.innerHTML = content;
    
    return div;
}

function getTileContent(tile) {
    const hoverInfo = getHoverInfo(tile);
    
    if (tile.imageUrl) {
        return `
            <img src="${CONFIG.nasUrl}${CONFIG.uploadsPath}${tile.imageUrl}" alt="${tile.title || ''}" class="tile-image">
            ${hoverInfo ? `
                <div class="tile-content">
                    ${hoverInfo}
                </div>
            ` : ''}
            ${tile.type === 'name' ? '<div class="tile-overlay"></div>' : ''}
        `;
    } else {
        // No image - display title prominently
        const displayTitle = tile.title || `${tile.firstName} ${tile.lastName}` || 'Untitled';
        return `
            <div class="tile-text">
                <h3>${displayTitle}</h3>
            </div>
        `;
    }
}

function getHoverInfo(tile) {
    switch(tile.type) {
        case 'object':
            return `
                <h3>${tile.title}</h3>
                <p>${tile.date}</p>
            `;
        case 'sticker':
            return `
                <h3>${tile.location}</h3>
                <p>${tile.date}</p>
            `;
        case 'name':
            return ''; // No text on hover, just overlay
        case 'art':
            return `
                <h3>${tile.title}</h3>
                <p>${tile.artist}</p>
            `;
        case 'inspiration':
            return tile.imageUrl ? `<h3>${tile.title}</h3>` : '';
        case 'place':
            return `<h3>${tile.title}</h3>`;
        case 'post':
            return `<h3>${tile.title}</h3>`;
        default:
            return '';
    }
}

// Drag and Drop
function addDragListeners(tile) {
    tile.addEventListener('dragstart', handleDragStart);
    tile.addEventListener('dragend', handleDragEnd);
    tile.addEventListener('dragover', handleDragOver);
    tile.addEventListener('drop', handleDrop);
    tile.addEventListener('dragenter', handleDragEnter);
    tile.addEventListener('dragleave', handleDragLeave);
}

function handleDragStart(e) {
    draggedTile = e.target;
    dragStartIndex = parseInt(e.target.dataset.index);
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    document.querySelectorAll('.tile').forEach(tile => {
        tile.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    if (e.target.classList.contains('tile') && e.target !== draggedTile) {
        e.target.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    e.target.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    e.target.classList.remove('drag-over');
    
    if (draggedTile !== e.target && e.target.classList.contains('tile')) {
        const dropIndex = parseInt(e.target.dataset.index);
        
        // Reorder tiles array
        const movedTile = tiles[dragStartIndex];
        tiles.splice(dragStartIndex, 1);
        tiles.splice(dropIndex, 0, movedTile);
        
        renderTiles();
    }
    
    return false;
}

function saveTileOrder() {
    // This would save the custom order back to the server
    // For now, the order is saved in the tiles array
    console.log('Tile order saved');
}

// Filtering
function updateTypeFilters() {
    const checkedBoxes = document.querySelectorAll('.checkbox-label input:checked');
    currentFilter.types = Array.from(checkedBoxes).map(cb => cb.value);
    applyFilters();
}

function applyFilters() {
    renderTiles();
}
