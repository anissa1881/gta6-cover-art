// Neon Coast Cover Studio: the editor wiring.
//
// State lives in one plain object; every control edits it and calls draw().
// Photos stay on the machine: file uploads are read with FileReader and
// the samples are plain files under samples/.

import { drawPoster, exportPosterPNG } from './cover.js';
import { getLayout, toPixels, LAYOUT_NAMES } from './layouts.js';
import { GRADE_NAMES } from './grade.js';
import { runShot } from './shots.js';

const SAMPLES = ['beach-sunset', 'pier', 'neon-street', 'boulevard'];
const POSTER_SIZES = [
  { label: 'Square 1080 × 1080', w: 1080, h: 1080 },
  { label: 'Portrait 1080 × 1350', w: 1080, h: 1350 },
  { label: 'Wide 1920 × 1080', w: 1920, h: 1080 },
];

const state = {
  photos: [],
  frames: [
    { photo: '', zoom: 1, ox: 0, oy: 0 },
    { photo: '', zoom: 1, ox: 0, oy: 0 },
    { photo: '', zoom: 1, ox: 0, oy: 0 },
    { photo: '', zoom: 1, ox: 0, oy: 0 },
  ],
  activePanel: 0,
  selectedPhoto: '',
  layout: 'hero',
  grade: 'sunset',
  tagline: 'NEON COAST',
  caption: 'SUNSET HEIST',
  captionColor: '#ffffff',
  captionSize: 1,
  outline: true,
  posterSize: POSTER_SIZES[0],
};

let photoCounter = 0;
let samplesLoaded = false;

const $ = (id) => document.getElementById(id);
const canvas = $('poster');
const ctx = canvas.getContext('2d');

// The poster fonts, loaded once before the first draw so canvas text
// uses Bebas Neue and Archivo Black instead of a fallback.
const fontsReady = (async () => {
  try {
    await Promise.all([
      document.fonts.load('100px "Bebas Neue"'),
      document.fonts.load('40px "Archivo Black"'),
    ]);
    await document.fonts.ready;
  } catch {
    // A fallback font still draws; the words just look plainer.
  }
})();

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${src}`));
    img.src = src;
  });
}

function addPhoto(name, src, img) {
  const id = `photo-${++photoCounter}`;
  state.photos.push({ id, name, src, img });
  return id;
}

async function loadSamples() {
  if (samplesLoaded) return;
  const loaded = await Promise.all(
    SAMPLES.map(async (name) => {
      const img = await loadImage(`samples/${name}.jpg`);
      return { name, img };
    }),
  );
  loaded.forEach(({ name, img }, i) => {
    const id = addPhoto(name, `samples/${name}.jpg`, img);
    state.frames[i].photo = id;
  });
  state.selectedPhoto = state.frames[0].photo;
  samplesLoaded = true;
  renderTray();
  renderPanelPhotoOptions();
}

// The tray of photo thumbnails. Clicking one selects it and puts it in
// the active panel.
function renderTray() {
  const tray = $('tray');
  tray.textContent = '';
  state.photos.forEach((photo) => {
    const thumb = document.createElement('img');
    thumb.src = photo.src;
    thumb.alt = photo.name;
    thumb.className = 'thumb' + (photo.id === state.selectedPhoto ? ' selected' : '');
    thumb.addEventListener('click', () => {
      state.selectedPhoto = photo.id;
      state.frames[state.activePanel].photo = photo.id;
      renderTray();
      renderPanelPhotoOptions();
      draw();
    });
    tray.appendChild(thumb);
  });
}

// The "Photo in this panel" dropdown, rebuilt whenever photos change.
function renderPanelPhotoOptions() {
  const select = $('panelPhoto');
  select.textContent = '';
  const empty = document.createElement('option');
  empty.value = '';
  empty.textContent = '— empty —';
  select.appendChild(empty);
  state.photos.forEach((photo) => {
    const option = document.createElement('option');
    option.value = photo.id;
    option.textContent = photo.name;
    select.appendChild(option);
  });
  select.value = state.frames[state.activePanel].photo;
}

function syncControls() {
  document.querySelectorAll('#layoutRow button').forEach((button) => {
    button.classList.toggle('active', button.dataset.layout === state.layout);
  });
  document.querySelectorAll('#gradeRow button').forEach((button) => {
    button.classList.toggle('active', button.dataset.grade === state.grade);
  });
  document.querySelectorAll('#panelRow button').forEach((button) => {
    button.classList.toggle('active', Number(button.dataset.panel) === state.activePanel);
  });
  document.querySelectorAll('#sizeRow button').forEach((button) => {
    button.classList.toggle(
      'active',
      Number(button.dataset.w) === state.posterSize.w && Number(button.dataset.h) === state.posterSize.h,
    );
  });
  $('tagline').value = state.tagline;
  $('caption').value = state.caption;
  $('captionColor').value = state.captionColor;
  $('captionSize').value = String(Math.round(state.captionSize * 100));
  $('captionOutline').checked = state.outline;
  const frame = state.frames[state.activePanel];
  $('zoom').value = String(Math.round(frame.zoom * 100));
  $('zoomValue').textContent = `${Math.round(frame.zoom * 100)}%`;
  renderPanelPhotoOptions();
}

async function draw() {
  await fontsReady;
  drawPoster(ctx, state, canvas.width, canvas.height);
}

function setLayout(name) {
  state.layout = name;
  syncControls();
  draw();
}

function setGrade(name) {
  state.grade = name;
  syncControls();
  draw();
}

function setCaption(text) {
  state.caption = text;
  syncControls();
  draw();
}

function setTagline(text) {
  state.tagline = text;
  syncControls();
  draw();
}

function setPosterSize(w, h) {
  state.posterSize = POSTER_SIZES.find((s) => s.w === w && s.h === h) ?? { label: `${w} × ${h}`, w, h };
  canvas.width = w;
  canvas.height = h;
  syncControls();
  draw();
}

// Frame the first panel by a fraction of its size (used by ?shot=pan).
function panFirstPanel(fx, fy) {
  const layout = getLayout(state.layout);
  const panel = toPixels(layout.panels[0], canvas.width, canvas.height);
  state.frames[0].ox = fx * panel.w;
  state.frames[0].oy = fy * panel.h;
}

async function downloadPoster(w, h) {
  const blob = await exportPosterPNG(state, w, h);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `neon-coast-cover-${w}x${h}.png`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  $('status').textContent = `Exported neon-coast-cover-${w}x${h}.png`;
}

// Drag a photo inside its panel to frame it: find the panel under the
// pointer, then move that frame's pan, clamped so the photo still covers.
function panelAt(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * canvas.width;
  const y = ((clientY - rect.top) / rect.height) * canvas.height;
  const layout = getLayout(state.layout);
  const index = layout.panels.findIndex((r) => {
    const p = toPixels(r, canvas.width, canvas.height);
    return x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h;
  });
  return { index, x, y, rect };
}

function clampPan(frame, photo, panel) {
  if (!photo || !photo.img) return;
  const base = Math.max(panel.w / photo.img.naturalWidth, panel.h / photo.img.naturalHeight);
  const dw = photo.img.naturalWidth * base * frame.zoom;
  const dh = photo.img.naturalHeight * base * frame.zoom;
  const maxOx = Math.max(0, (dw - panel.w) / 2);
  const maxOy = Math.max(0, (dh - panel.h) / 2);
  frame.ox = Math.max(-maxOx, Math.min(maxOx, frame.ox));
  frame.oy = Math.max(-maxOy, Math.min(maxOy, frame.oy));
}

function wireDrag() {
  let drag = null;
  canvas.addEventListener('pointerdown', (event) => {
    const hit = panelAt(event.clientX, event.clientY);
    if (hit.index < 0) return;
    state.activePanel = hit.index;
    syncControls();
    drag = { x: hit.x, y: hit.y, rect: hit.rect };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!drag) return;
    const frame = state.frames[state.activePanel];
    const photo = state.photos.find((p) => p.id === frame.photo);
    const layout = getLayout(state.layout);
    const panel = toPixels(layout.panels[state.activePanel], canvas.width, canvas.height);
    const now = panelAt(event.clientX, event.clientY);
    frame.ox += (now.x - drag.x);
    frame.oy += (now.y - drag.y);
    drag.x = now.x;
    drag.y = now.y;
    clampPan(frame, photo, panel);
    draw();
  });
  const endDrag = () => { drag = null; };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
}

function wireControls() {
  $('photoFiles').addEventListener('change', async (event) => {
    for (const file of event.target.files) {
      const src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
      try {
        const img = await loadImage(src);
        const id = addPhoto(file.name, src, img);
        state.selectedPhoto = id;
        state.frames[state.activePanel].photo = id;
      } catch {
        $('status').textContent = `Could not read ${file.name}`;
      }
    }
    renderTray();
    renderPanelPhotoOptions();
    draw();
  });

  $('loadSamples').addEventListener('click', async () => {
    await loadSamples();
    draw();
  });

  document.querySelectorAll('#layoutRow button').forEach((button) => {
    button.addEventListener('click', () => setLayout(button.dataset.layout));
  });
  document.querySelectorAll('#gradeRow button').forEach((button) => {
    button.addEventListener('click', () => setGrade(button.dataset.grade));
  });
  document.querySelectorAll('#panelRow button').forEach((button) => {
    button.addEventListener('click', () => {
      state.activePanel = Number(button.dataset.panel);
      syncControls();
      draw();
    });
  });
  document.querySelectorAll('#sizeRow button').forEach((button) => {
    button.addEventListener('click', () => setPosterSize(Number(button.dataset.w), Number(button.dataset.h)));
  });

  $('panelPhoto').addEventListener('change', (event) => {
    state.frames[state.activePanel].photo = event.target.value;
    state.selectedPhoto = event.target.value || state.selectedPhoto;
    renderTray();
    draw();
  });
  $('zoom').addEventListener('input', (event) => {
    const frame = state.frames[state.activePanel];
    frame.zoom = Number(event.target.value) / 100;
    const photo = state.photos.find((p) => p.id === frame.photo);
    const layout = getLayout(state.layout);
    clampPan(frame, photo, toPixels(layout.panels[state.activePanel], canvas.width, canvas.height));
    $('zoomValue').textContent = `${event.target.value}%`;
    draw();
  });
  $('tagline').addEventListener('input', (event) => {
    state.tagline = event.target.value;
    draw();
  });
  $('caption').addEventListener('input', (event) => {
    state.caption = event.target.value;
    draw();
  });
  $('captionColor').addEventListener('input', (event) => {
    state.captionColor = event.target.value;
    draw();
  });
  $('captionSize').addEventListener('input', (event) => {
    state.captionSize = Number(event.target.value) / 100;
    draw();
  });
  $('captionOutline').addEventListener('change', (event) => {
    state.outline = event.target.checked;
    draw();
  });

  $('exportSquare').addEventListener('click', () => downloadPoster(1080, 1080));
  $('exportPortrait').addEventListener('click', () => downloadPoster(1080, 1350));
  $('exportWide').addEventListener('click', () => downloadPoster(1920, 1080));
}

// The handle the play test and the screenshot scenes use.
window.__neonCoast = {
  state,
  draw,
  loadSamples,
  setLayout,
  setGrade,
  setCaption,
  setTagline,
  setPosterSize,
  panFirstPanel,
  exportPosterPNG: (w, h) => exportPosterPNG(state, w, h),
  downloadPoster,
};

async function init() {
  wireControls();
  wireDrag();
  syncControls();
  const query = new URLSearchParams(window.location.search);
  if (query.has('shot')) {
    await runShot(query, {
      loadSamples,
      setLayout,
      setGrade,
      setCaption,
      setTagline,
      setPosterSize,
      panFirstPanel,
      draw,
    });
  } else {
    await loadSamples();
    await draw();
  }
}

init();
