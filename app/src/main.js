// Neon Coast Cover Studio: wires the page. Pick photos, place one in each panel,
// crop and position by dragging, write the caption, pick a grade, export a PNG.
// Photos are read on this machine with FileReader and never leave it.
// A `?shot=` query sets up a fixed scene for a screenshot instead (./shots.js).

import { drawCover, exportCoverPng } from './cover.js';
import { layoutPanels, panelAt } from './layouts.js';
import { GRADES, GRADE_DEFS } from './grade.js';
import { runShot, loadSamplePhoto } from './shots.js';

export const SIZES = {
  '1080x1080': [1080, 1080],
  '1080x1350': [1080, 1350],
  '1920x1080': [1920, 1080],
};

const SAMPLE_NAMES = ['beach-sunset', 'neon-street', 'pier', 'boulevard'];

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const tray = document.getElementById('tray');
const panelPhotoSelect = document.getElementById('panel-photo');
const zoomSlider = document.getElementById('zoom');
const zoomValue = document.getElementById('zoom-value');

const state = {
  layout: 'hero',
  grade: 'sunset',
  caption: 'Sunset Heist',
  tagline: 'Neon Coast',
  captionColor: '#ffffff',
  captionSize: 1,
  outline: true,
  size: '1080x1080',
  photos: [],
  panels: [0, 1, 2, 3].map(() => ({ img: null, photoId: null, zoom: 1, ox: 0, oy: 0 })),
  selectedPanel: 0,
};

let activePhotoId = null;
let photoCounter = 0;
let redrawQueued = false;

function redraw() {
  if (redrawQueued) return;
  redrawQueued = true;
  requestAnimationFrame(() => {
    redrawQueued = false;
    drawCover(canvas, state);
  });
}

function redrawNow() {
  drawCover(canvas, state);
}

function setStatus(text) {
  status.textContent = text;
}

/** Adds an image to the photo tray and returns its id. */
function addTrayPhoto(img, name) {
  const id = `photo-${++photoCounter}`;
  state.photos.push({ id, name, img });
  renderTray();
  return id;
}

function renderTray() {
  tray.innerHTML = '';
  for (const photo of state.photos) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'thumb' + (photo.id === activePhotoId ? ' active' : '');
    button.title = photo.name;
    const thumb = document.createElement('img');
    thumb.src = photo.img.src;
    thumb.alt = photo.name;
    button.append(thumb);
    button.addEventListener('click', () => {
      activePhotoId = photo.id;
      renderTray();
      setStatus(`Photo "${photo.name}" chosen — click a panel to place it.`);
    });
    tray.append(button);
  }
  renderPanelPhotoSelect();
}

function renderPanelPhotoSelect() {
  const current = state.panels[state.selectedPanel].photoId;
  panelPhotoSelect.innerHTML = '<option value="">— empty —</option>';
  for (const photo of state.photos) {
    const option = document.createElement('option');
    option.value = photo.id;
    option.textContent = photo.name;
    if (photo.id === current) option.selected = true;
    panelPhotoSelect.append(option);
  }
}

/** Places a tray photo into a panel (keeping that panel's crop). */
function assignPhotoToPanel(photoId, panelIndex) {
  const photo = state.photos.find((p) => p.id === photoId);
  const slot = state.panels[panelIndex];
  if (photo) {
    slot.img = photo.img;
    slot.photoId = photo.id;
  } else {
    slot.img = null;
    slot.photoId = null;
  }
  state.selectedPanel = panelIndex;
  syncPanelControls();
  redraw();
}

function syncPanelControls() {
  document.querySelectorAll('[data-panel]').forEach((button) => {
    button.classList.toggle('active', Number(button.dataset.panel) === state.selectedPanel);
  });
  const slot = state.panels[state.selectedPanel];
  zoomSlider.value = String(slot.zoom);
  zoomValue.textContent = `${Math.round(slot.zoom * 100)}%`;
  renderPanelPhotoSelect();
}

/** Loads an image from a URL, resolving to the image once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

// --- Step 1: photos ---------------------------------------------------------

document.getElementById('photo').addEventListener('change', async (e) => {
  const files = [...e.target.files];
  for (const file of files) {
    if (state.photos.length >= 8) {
      setStatus('The tray holds 8 photos at most.');
      break;
    }
    try {
      const img = await loadImage(URL.createObjectURL(file));
      const id = addTrayPhoto(img, file.name);
      if (!activePhotoId) activePhotoId = id;
    } catch {
      setStatus(`Could not read "${file.name}".`);
    }
  }
  e.target.value = '';
  if (state.photos.length) {
    setStatus(`${state.photos.length} photo(s) in the tray — click one, then a panel.`);
  }
  redraw();
});

document.getElementById('samples').addEventListener('click', async () => {
  for (const name of SAMPLE_NAMES) {
    if (state.photos.some((p) => p.name === `${name}.jpg`)) continue;
    const img = await loadSamplePhoto(name);
    addTrayPhoto(img, `${name}.jpg`);
  }
  SAMPLE_NAMES.forEach((name, i) => {
    const photo = state.photos.find((p) => p.name === `${name}.jpg`);
    if (photo) assignPhotoToPanel(photo.id, i);
  });
  activePhotoId = state.photos[0]?.id ?? null;
  renderTray();
  setStatus('Sample photos loaded — one in each panel.');
  redraw();
});

// --- Step 2: panels ---------------------------------------------------------

document.querySelectorAll('[data-layout]').forEach((button) => {
  button.addEventListener('click', () => {
    state.layout = button.dataset.layout;
    document.querySelectorAll('[data-layout]').forEach((b) => {
      b.classList.toggle('active', b === button);
    });
    redraw();
  });
});

document.querySelectorAll('[data-panel]').forEach((button) => {
  button.addEventListener('click', () => {
    state.selectedPanel = Number(button.dataset.panel);
    syncPanelControls();
    redraw();
  });
});

panelPhotoSelect.addEventListener('change', () => {
  assignPhotoToPanel(panelPhotoSelect.value || null, state.selectedPanel);
});

zoomSlider.addEventListener('input', () => {
  const slot = state.panels[state.selectedPanel];
  slot.zoom = Number(zoomSlider.value);
  zoomValue.textContent = `${Math.round(slot.zoom * 100)}%`;
  redraw();
});

document.getElementById('fill-all').addEventListener('click', () => {
  const slot = state.panels[state.selectedPanel];
  if (!slot.img) {
    setStatus('Pick a photo for this panel first.');
    return;
  }
  for (const panel of state.panels) {
    panel.img = slot.img;
    panel.photoId = slot.photoId;
    panel.zoom = 1;
    panel.ox = 0;
    panel.oy = 0;
  }
  syncPanelControls();
  redraw();
  setStatus('One photo fills all four panels — drag each to frame it.');
});

document.getElementById('reset-crop').addEventListener('click', () => {
  const slot = state.panels[state.selectedPanel];
  slot.zoom = 1;
  slot.ox = 0;
  slot.oy = 0;
  syncPanelControls();
  redraw();
});

// Drag a photo inside its panel to position it; a plain click places the photo.
let drag = null;
function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height),
  };
}
canvas.addEventListener('pointerdown', (event) => {
  const point = canvasPoint(event);
  const { panels } = layoutPanels(state.layout, canvas.width, canvas.height);
  const index = panelAt(panels, point.x, point.y);
  if (index === -1) return;
  const slot = state.panels[index];
  canvas.setPointerCapture(event.pointerId);
  drag = { index, startX: point.x, startY: point.y, ox: slot.ox, oy: slot.oy, moved: false };
  state.selectedPanel = index;
  syncPanelControls();
});
canvas.addEventListener('pointermove', (event) => {
  if (!drag) return;
  const point = canvasPoint(event);
  const dx = point.x - drag.startX;
  const dy = point.y - drag.startY;
  if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
  if (!drag.moved) return;
  const slot = state.panels[drag.index];
  slot.ox = drag.ox + dx;
  slot.oy = drag.oy + dy;
  redraw();
});
canvas.addEventListener('pointerup', (event) => {
  if (!drag) return;
  if (!drag.moved && activePhotoId) {
    assignPhotoToPanel(activePhotoId, drag.index);
    setStatus('Photo placed in the panel — drag it to frame the shot.');
  }
  drag = null;
});

// --- Step 3: words and grade -----------------------------------------------

document.getElementById('caption').addEventListener('input', (e) => {
  state.caption = e.target.value;
  redraw();
});
document.getElementById('tagline').addEventListener('input', (e) => {
  state.tagline = e.target.value;
  redraw();
});
document.querySelectorAll('[data-color]').forEach((button) => {
  button.addEventListener('click', () => {
    state.captionColor = button.dataset.color;
    document.querySelectorAll('[data-color]').forEach((b) => {
      b.classList.toggle('active', b === button);
    });
    redraw();
  });
});
document.getElementById('caption-size').addEventListener('input', (e) => {
  state.captionSize = Number(e.target.value);
  redraw();
});
document.getElementById('outline').addEventListener('change', (e) => {
  state.outline = e.target.checked;
  redraw();
});
document.querySelectorAll('[data-grade]').forEach((button) => {
  button.addEventListener('click', () => {
    state.grade = button.dataset.grade;
    document.querySelectorAll('[data-grade]').forEach((b) => {
      b.classList.toggle('active', b === button);
    });
    redraw();
  });
});

// --- Step 4: export ---------------------------------------------------------

function setExportSize(size) {
  state.size = size;
  const [w, h] = SIZES[size];
  canvas.width = w;
  canvas.height = h;
  document.querySelectorAll('[data-size]').forEach((b) => {
    b.classList.toggle('active', b.dataset.size === size);
  });
  redraw();
}
document.querySelectorAll('[data-size]').forEach((button) => {
  button.addEventListener('click', () => setExportSize(button.dataset.size));
});

document.getElementById('export').addEventListener('click', async () => {
  const [w, h] = SIZES[state.size];
  setStatus('Exporting…');
  const blob = await exportCoverPng(state, w, h);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `neon-coast-cover-${w}x${h}.png`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 60_000);
  setStatus(`Saved neon-coast-cover-${w}x${h}.png`);
});

// --- Start ------------------------------------------------------------------

async function start() {
  try {
    await Promise.all([
      document.fonts.load('100px "Bebas Neue"'),
      document.fonts.load('100px "Archivo Black"'),
    ]);
  } catch { /* the canvas falls back to sans-serif */ }
  const query = new URLSearchParams(location.search);
  const shot = query.get('shot');
  if (shot) {
    const size = query.get('size');
    if (size && SIZES[size]) setExportSize(size);
    await runShot(shot, query, (scene) => {
      state.layout = scene.layout;
      state.grade = scene.grade;
      state.caption = scene.caption;
      state.tagline = scene.tagline;
      state.captionColor = scene.captionColor;
      document.getElementById('caption').value = scene.caption;
      document.getElementById('tagline').value = scene.tagline;
      for (const photo of scene.photos) {
        const id = addTrayPhoto(photo.img, photo.name);
        if (photo.id === scene.photos[0].id) activePhotoId = id;
      }
      scene.photos.forEach((photo, i) => {
        const placed = state.photos.find((p) => p.name === photo.name);
        if (placed) assignPhotoToPanel(placed.id, i);
      });
      // A fixed pan per panel (fractions of the panel height, positive moves the
      // photo down): the same framing a user sets by dragging a photo.
      if (scene.pan) {
        const { panels } = layoutPanels(state.layout, canvas.width, canvas.height);
        scene.pan.split(',').forEach((value, i) => {
          const fraction = Number(value);
          if (Number.isFinite(fraction) && state.panels[i]) {
            state.panels[i].oy = fraction * panels[i].h;
          }
        });
      }
      document.querySelectorAll('[data-layout]').forEach((b) => {
        b.classList.toggle('active', b.dataset.layout === state.layout);
      });
      document.querySelectorAll('[data-grade]').forEach((b) => {
        b.classList.toggle('active', b.dataset.grade === state.grade);
      });
      redrawNow();
    });
  } else {
    redrawNow();
  }
}

// For play-tests and screenshots: the live state and a forced redraw.
window.__app = { state, redrawNow, exportCoverPng, SIZES };
start();
