// Wires Neon Coast Cover Studio: photos, panels, caption, grades, export.
// The preview canvas draws exactly what the export writes, through
// renderPoster in cover.js. The editor keeps its state in `poster` (words,
// layout, grade) and `slots` (which tray photo sits in each panel, at what
// zoom and pan); render() resolves the tray indices to images and draws.
import { renderPoster, exportPoster, photoMetrics } from './cover.js';
import { posterGeometry } from './layouts.js';
import { runShot } from './shots.js';

const SAMPLE_NAMES = ['beach-sunset', 'pier', 'boulevard', 'neon-street'];
const EXPORT_SIZES = [[1080, 1080], [1080, 1350], [1920, 1080]];

const $ = (id) => document.getElementById(id);
const canvas = $('preview');
const status = $('status');

// The photo tray: every loaded image, in load order.
const tray = []; // { name, img }
// One slot per panel: which tray photo it shows, and how it is framed.
const slots = [0, 1, 2, 3].map(() => ({ tray: -1, zoom: 1, ox: 0, oy: 0 }));
const poster = {
  layout: 'four',
  grade: 'sunset',
  tagline: 'Neon Coast',
  caption: 'Sunset Heist',
  captionColor: '#ffffff',
  captionScale: 1,
  outline: true,
};
let selectedPanel = 0;
let selectedPhoto = -1;
let previewSize = EXPORT_SIZES[0];

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** The poster with tray indices resolved to images, ready to render. */
function resolvedPoster() {
  return {
    ...poster,
    slots: slots.map((s) => ({
      img: s.tray >= 0 && tray[s.tray] ? tray[s.tray].img : null,
      zoom: s.zoom,
      ox: s.ox,
      oy: s.oy,
    })),
  };
}

function render() {
  renderPoster(canvas, resolvedPoster());
}

function setPreviewSize(w, h) {
  previewSize = [w, h];
  canvas.width = w;
  canvas.height = h;
  render();
}

function syncButtons(rowId, attr, value) {
  for (const b of document.querySelectorAll(`#${rowId} button`)) {
    b.classList.toggle('active', b.dataset[attr] === String(value));
  }
}

function syncPhotoSelect() {
  const sel = $('photoSelect');
  sel.innerHTML = '';
  const empty = document.createElement('option');
  empty.value = '-1';
  empty.textContent = 'Empty panel';
  sel.appendChild(empty);
  tray.forEach((p, i) => {
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = p.name;
    sel.appendChild(opt);
  });
  sel.value = String(slots[selectedPanel].tray);
}

function syncTray() {
  const box = $('tray');
  box.innerHTML = '';
  tray.forEach((p, i) => {
    const thumb = document.createElement('button');
    thumb.type = 'button';
    thumb.className = 'thumb' + (i === selectedPhoto ? ' selected' : '');
    thumb.title = p.name;
    const img = document.createElement('img');
    img.src = p.img.src;
    img.alt = p.name;
    thumb.appendChild(img);
    thumb.addEventListener('click', () => {
      selectedPhoto = i;
      syncTray();
      syncPhotoSelect();
    });
    box.appendChild(thumb);
  });
}

function syncControls() {
  syncButtons('layoutRow', 'layout', poster.layout);
  syncButtons('panelRow', 'panel', selectedPanel);
  syncButtons('gradeRow', 'grade', poster.grade);
  $('tagline').value = poster.tagline;
  $('caption').value = poster.caption;
  $('captionColor').value = poster.captionColor;
  $('captionSize').value = String(Math.round(poster.captionScale * 100));
  $('sizeLabel').textContent = `${Math.round(poster.captionScale * 100)}%`;
  $('outline').checked = poster.outline;
  $('zoom').value = String(Math.round(slots[selectedPanel].zoom * 100));
  $('zoomLabel').textContent = `${Math.round(slots[selectedPanel].zoom * 100)}%`;
  syncPhotoSelect();
  syncTray();
}

async function loadSamples() {
  tray.length = 0;
  for (const name of SAMPLE_NAMES) {
    const img = await loadImage(`samples/${name}.jpg`);
    tray.push({ name, img });
  }
  slots.forEach((s, i) => {
    s.tray = i;
    s.zoom = 1;
    s.ox = 0;
    s.oy = 0;
  });
  selectedPhoto = 0;
  selectedPanel = 0;
  syncControls();
  render();
}

$('fileInput').addEventListener('change', async (e) => {
  for (const file of e.target.files) {
    const img = await loadImage(URL.createObjectURL(file));
    tray.push({ name: file.name.replace(/\.[^.]+$/, ''), img });
  }
  if (tray.length > 0) selectedPhoto = tray.length - 1;
  syncControls();
  render();
  status.textContent = `${tray.length} photo(s) loaded.`;
});

$('loadSamples').addEventListener('click', async () => {
  await loadSamples();
  status.textContent = '4 sample photos loaded.';
});

$('fillAll').addEventListener('click', () => {
  slots.forEach((s, i) => {
    s.tray = tray.length > 0 ? i % tray.length : -1;
  });
  syncControls();
  render();
});

for (const b of document.querySelectorAll('#layoutRow .layout-btn')) {
  b.addEventListener('click', () => {
    poster.layout = b.dataset.layout;
    syncControls();
    render();
  });
}

for (const b of document.querySelectorAll('#panelRow .panel-btn')) {
  b.addEventListener('click', () => {
    selectedPanel = Number(b.dataset.panel);
    if (selectedPhoto >= 0) slots[selectedPanel].tray = selectedPhoto;
    syncControls();
    render();
  });
}

$('photoSelect').addEventListener('change', (e) => {
  slots[selectedPanel].tray = Number(e.target.value);
  render();
});

$('zoom').addEventListener('input', (e) => {
  slots[selectedPanel].zoom = Number(e.target.value) / 100;
  $('zoomLabel').textContent = `${e.target.value}%`;
  render();
});

$('tagline').addEventListener('input', (e) => {
  poster.tagline = e.target.value;
  render();
});
$('caption').addEventListener('input', (e) => {
  poster.caption = e.target.value;
  render();
});
$('captionColor').addEventListener('input', (e) => {
  poster.captionColor = e.target.value;
  render();
});
$('captionSize').addEventListener('input', (e) => {
  poster.captionScale = Number(e.target.value) / 100;
  $('sizeLabel').textContent = `${e.target.value}%`;
  render();
});
$('outline').addEventListener('change', (e) => {
  poster.outline = e.target.checked;
  render();
});

for (const b of document.querySelectorAll('#gradeRow .grade-btn')) {
  b.addEventListener('click', () => {
    poster.grade = b.dataset.grade;
    syncControls();
    render();
  });
}

for (const b of document.querySelectorAll('.export-btn')) {
  b.addEventListener('click', async () => {
    const w = Number(b.dataset.w);
    const h = Number(b.dataset.h);
    const blob = await exportPoster(resolvedPoster(), w, h);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `neon-coast-cover-${w}x${h}.png`;
    a.click();
    setPreviewSize(w, h);
    status.textContent = `Exported neon-coast-cover-${w}x${h}.png`;
  });
}

// Drag a photo inside its panel to frame it.
let drag = null;
function panelAt(cx, cy) {
  const { panels } = posterGeometry(poster.layout, canvas.width, canvas.height);
  for (let i = 0; i < 4; i++) {
    const r = panels[i];
    if (r.w > 0 && cx >= r.x && cx <= r.x + r.w && cy >= r.y && cy <= r.y + r.h) return i;
  }
  return -1;
}
canvas.addEventListener('pointerdown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const cx = (e.clientX - rect.left) * (canvas.width / rect.width);
  const cy = (e.clientY - rect.top) * (canvas.height / rect.height);
  const i = panelAt(cx, cy);
  if (i < 0) return;
  const slot = slots[i];
  const img = slot.tray >= 0 && tray[slot.tray] ? tray[slot.tray].img : null;
  if (!img) return;
  const { panels } = posterGeometry(poster.layout, canvas.width, canvas.height);
  const m = photoMetrics(img, panels[i], slot.zoom);
  if (m.slackX <= 0 && m.slackY <= 0) return;
  selectedPanel = i;
  syncControls();
  drag = { panel: i, startX: cx, startY: cy, ox: slot.ox, oy: slot.oy, slackX: m.slackX, slackY: m.slackY };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const rect = canvas.getBoundingClientRect();
  const cx = (e.clientX - rect.left) * (canvas.width / rect.width);
  const cy = (e.clientY - rect.top) * (canvas.height / rect.height);
  const slot = slots[drag.panel];
  if (drag.slackX > 0) slot.ox = Math.max(-1, Math.min(1, drag.ox + (cx - drag.startX) / drag.slackX));
  if (drag.slackY > 0) slot.oy = Math.max(-1, Math.min(1, drag.oy + (cy - drag.startY) / drag.slackY));
  render();
});
canvas.addEventListener('pointerup', () => {
  drag = null;
});

// The ?shot= scenes the screenshots use.
const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  runShot(shot, new URLSearchParams(location.search), {
    loadSample: (name) => loadImage(`samples/${name}.jpg`),
    showPoster: (p, w, h) => {
      poster.layout = p.layout;
      poster.grade = p.grade;
      poster.tagline = p.tagline;
      poster.caption = p.caption;
      poster.captionColor = p.captionColor;
      poster.captionScale = p.captionScale;
      poster.outline = p.outline;
      canvas.width = w;
      canvas.height = h;
      renderPoster(canvas, p);
    },
    showEditor: async (p) => {
      await loadSamples();
      poster.layout = p.layout;
      poster.grade = p.grade;
      poster.tagline = p.tagline;
      poster.caption = p.caption;
      poster.captionColor = p.captionColor;
      poster.captionScale = p.captionScale;
      poster.outline = p.outline;
      setPreviewSize(1080, 1080);
      syncControls();
      render();
    },
  });
} else {
  syncControls();
  render();
}

// Handles the play-tests and the screenshot scripts use.
window.__neonCoast = {
  poster,
  slots,
  tray,
  render,
  setPreviewSize,
  loadSamples,
  resolvedPoster,
  exportPoster: (w, h) => exportPoster(resolvedPoster(), w, h),
};
