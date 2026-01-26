/* =========================================================
   MUSEUM — script.js (GitHub Pages Safe Version)
========================================================= */

window.addEventListener("DOMContentLoaded", () => {

console.log("Museum script loaded");

/* =========================================================
   CHECK GRIDSTACK
========================================================= */

if (typeof GridStack === "undefined") {
  alert("GridStack not loaded. Check CDN.");
  return;
}

/* =========================================================
   STATE
========================================================= */

let grid;
let currentType = null;
let selectedSize = { w: 2, h: 2 };
let tiles = JSON.parse(localStorage.getItem("museumTiles") || "[]");

/* =========================================================
   DOM
========================================================= */

const addBtn = document.getElementById("addBtn");
const addMenu = document.getElementById("addMenu");
const editBtn = document.getElementById("editBtn");
const toggleBordersBtn = document.getElementById("toggleBordersBtn");
const panel = document.getElementById("panel");
const backdrop = document.getElementById("backdrop");
const closePanelBtn = document.getElementById("closePanelBtn");
const dynamicFields = document.getElementById("dynamicFields");
const panelTitle = document.getElementById("panelTitle");
const panelSubtitle = document.getElementById("panelSubtitle");
const tileForm = document.getElementById("tileForm");
const sizeLabel = document.getElementById("sizeLabel");
const sortSelect = document.getElementById("sortSelect");
const typeSelect = document.getElementById("typeSelect");

/* guard */
if (!addBtn) {
  alert("HTML IDs mismatch. addBtn missing.");
  return;
}

/* =========================================================
   GRID INIT
========================================================= */

grid = GridStack.init({
  cellHeight: 80,
  margin: 10,
  float: true,
  disableResize: true
});

grid.enableMove(false);

/* =========================================================
   HELPERS
========================================================= */

function save() {
  localStorage.setItem("museumTiles", JSON.stringify(tiles));
}

function uid() {
  return Date.now() + "_" + Math.random().toString(36).slice(2);
}

function detectMedia(url) {
  if (!url) return "none";
  const ext = url.split(".").pop().toLowerCase();

  if (["jpg","jpeg","png","webp","gif"].includes(ext)) return "image";
  if (["mp4","webm","mov"].includes(ext)) return "video";
  if (["glb","obj","fbx","stl"].includes(ext)) return "model";
  return "other";
}

/* =========================================================
   TILE RENDER
========================================================= */

function renderTile(tile) {
  let mediaHTML = "";

  const mediaType = detectMedia(tile.mediaUrl);

  if (mediaType === "image") {
    mediaHTML = `<img class="tileMedia" src="${tile.mediaUrl}">`;
  } else if (mediaType === "video") {
    mediaHTML = `
      <video class="tileMedia" muted autoplay loop playsinline>
        <source src="${tile.mediaUrl}">
      </video>`;
  } else if (mediaType === "model") {
    mediaHTML = `<div class="tilePlaceholder">3D</div>`;
  } else {
    mediaHTML = `<div class="tilePlaceholder">${tile.title || tile.firstName || "Tile"}</div>`;
  }

  return `
    <div class="gridstack-item-content">
      ${mediaHTML}
      <div class="tileOverlay">
        <div class="tileOverlay__title">${tile.title || tile.firstName || ""}</div>
        <div class="tileOverlay__meta">${tile.type}</div>
      </div>
    </div>
  `;
}

function addTile(tile) {
  grid.addWidget({
    w: tile.w,
    h: tile.h,
    content: renderTile(tile),
    id: tile.id
  });
}

/* =========================================================
   LOAD SAVED
========================================================= */

tiles.forEach(addTile);

/* =========================================================
   ADD MENU
========================================================= */

addBtn.addEventListener("click", () => {
  console.log("+ clicked");
  addMenu.classList.toggle("is-open");
});

document.addEventListener("click", e => {
  if (!addBtn.contains(e.target) && !addMenu.contains(e.target)) {
    addMenu.classList.remove("is-open");
  }
});

/* =========================================================
   PANEL
========================================================= */

function openPanel(type) {
  currentType = type;

  panel.classList.add("is-open");
  backdrop.hidden = false;

  panelTitle.textContent = "New " + type;
  panelSubtitle.textContent = "Fill out the form";

  dynamicFields.innerHTML = "";
  const tpl = document.getElementById("tpl-" + type);
  dynamicFields.append(tpl.content.cloneNode(true));
}

function closePanel() {
  panel.classList.remove("is-open");
  backdrop.hidden = true;
  tileForm.reset();
}

closePanelBtn.onclick = closePanel;
backdrop.onclick = closePanel;

/* =========================================================
   TYPE SELECT
========================================================= */

document.querySelectorAll(".menu__item").forEach(btn => {
  btn.onclick = () => {
    addMenu.classList.remove("is-open");
    openPanel(btn.dataset.type);
  };
});

/* =========================================================
   SIZE PICKER
========================================================= */

document.querySelectorAll(".size").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".size").forEach(b => b.classList.remove("is-selected"));
    btn.classList.add("is-selected");

    selectedSize = {
      w: Number(btn.dataset.w),
      h: Number(btn.dataset.h)
    };

    sizeLabel.textContent = `${selectedSize.w / 2} × ${selectedSize.h / 2}`;
  };
});

/* =========================================================
   CREATE TILE
========================================================= */

tileForm.onsubmit = e => {
  e.preventDefault();

  const fd = new FormData(tileForm);
  const data = Object.fromEntries(fd.entries());

  const tile = {
    id: uid(),
    type: currentType,
    ...data,
    w: selectedSize.w,
    h: selectedSize.h,
    created: new Date().toISOString()
  };

  tiles.push(tile);
  save();
  addTile(tile);
  closePanel();
};

/* =========================================================
   EDIT MODE
========================================================= */

let editing = false;

editBtn.onclick = () => {
  editing = !editing;
  grid.enableMove(editing);
  editBtn.classList.toggle("btn--primary", editing);
};

/* =========================================================
   BORDERS
========================================================= */

toggleBordersBtn.onclick = () => {
  document.body.classList.toggle("borders-off");
};

/* =========================================================
   SORT
========================================================= */

sortSelect.onchange = () => {
  if (sortSelect.value === "custom") return;

  grid.removeAll(false);

  const sorted = [...tiles].sort((a,b)=>{
    return sortSelect.value === "newest"
      ? new Date(b.created) - new Date(a.created)
      : new Date(a.created) - new Date(b.created);
  });

  sorted.forEach(addTile);
};

/* =========================================================
   FILTER
========================================================= */

typeSelect.onchange = () => {
  grid.removeAll(false);
  tiles
    .filter(t => typeSelect.value === "all" || t.type === typeSelect.value)
    .forEach(addTile);
};

/* =========================================================
   SAVE POSITIONS
========================================================= */

grid.on("change", (e, items) => {
  items.forEach(i => {
    const t = tiles.find(t => t.id == i.id);
    if (!t) return;
    t.x = i.x;
    t.y = i.y;
  });
  save();
});

});
