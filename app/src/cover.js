// The poster renderer: draws the whole cover onto any 2d canvas.
//
// The state it reads is the editor's plain object:
//   photos: [{ id, name, img }]          loaded photos, img is an HTMLImageElement
//   frames: [{ photo, zoom, ox, oy }]    one frame per panel; photo is a photo id
//   layout, grade, tagline, caption, captionColor, captionSize, outline
//
// Frames carry the photo's pan as ox/oy in poster pixels, and zoom as a
// multiplier on the cover-fit scale (1 = just fills the panel).

import { getLayout, toPixels } from './layouts.js';
import { getGrade, washGrade, vignette } from './grade.js';

// Draw one photo into a panel, cover-fit, with the frame's zoom and pan.
function drawPhoto(ctx, img, panel, frame, filter) {
  const { x, y, w, h } = panel;
  const base = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const scale = base * (frame.zoom ?? 1);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const dx = x + (w - dw) / 2 + (frame.ox ?? 0);
  const dy = y + (h - dh) / 2 + (frame.oy ?? 0);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.filter = filter;
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

// Fill a panel that has no photo yet with a dark placeholder and its number.
function drawEmptyPanel(ctx, panel, number) {
  ctx.save();
  ctx.fillStyle = '#241a33';
  ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
  ctx.fillStyle = '#8b7fb0';
  ctx.font = `600 ${Math.round(panel.h * 0.16)}px "Archivo Black", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`PANEL ${number}`, panel.x + panel.w / 2, panel.y + panel.h / 2);
  ctx.restore();
}

// A thin white frame around each panel, the poster's own border.
function framePanel(ctx, panel, width) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = Math.max(2, width * 0.003);
  ctx.strokeRect(panel.x, panel.y, panel.w, panel.h);
  ctx.restore();
}

// Shrink a font until the text fits the width, then return the size used.
function fitFont(ctx, text, family, start, weight, maxWidth) {
  let size = start;
  ctx.font = `${weight} ${size}px ${family}`;
  while (size > 12 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${family}`;
  }
  return size;
}

// Draw the tagline and caption inside the caption rect.
//
// In a bottom band the words sit at the top of the band; in the film
// strip's tall right-hand zone they are centred top to bottom instead.
function drawWords(ctx, state, band, width, height) {
  const pad = Math.min(band.w, band.h) * 0.08 + width * 0.02;
  const left = band.x + pad;
  const right = band.x + band.w - pad;
  const vertical = state.verticalCaption;

  // A dark wash behind the words so they read over any photo.
  const wash = ctx.createLinearGradient(0, band.y, 0, band.y + band.h);
  wash.addColorStop(0, 'rgba(8, 4, 16, 0)');
  wash.addColorStop(0.3, 'rgba(8, 4, 16, 0.88)');
  wash.addColorStop(1, 'rgba(8, 4, 16, 0.96)');
  ctx.save();
  ctx.fillStyle = wash;
  ctx.fillRect(band.x, band.y, band.w, band.h);
  ctx.restore();

  // Tagline: small, gold, widely spaced.
  const tagSize = Math.round(Math.min(band.h * 0.16, width * 0.028));
  // Caption: huge Bebas Neue, fitted to the band, optionally outlined.
  const capWant = vertical
    ? Math.round(band.w * 0.5 * (state.captionSize ?? 1))
    : Math.round(band.h * 0.62 * (state.captionSize ?? 1));
  const capSize = fitFont(ctx, state.caption, '"Bebas Neue", sans-serif', capWant, 400, right - left);
  // The whole words block, so the vertical zone can centre it.
  const blockHeight = tagSize + tagSize * 0.9 + capSize;
  const top = vertical
    ? band.y + Math.max(pad, (band.h - blockHeight) / 2)
    : band.y + pad * 0.7;

  ctx.save();
  ctx.fillStyle = '#f5b942';
  ctx.textBaseline = 'alphabetic';
  try { ctx.letterSpacing = `${Math.round(tagSize * 0.32)}px`; } catch { /* older canvas */ }
  ctx.font = `${tagSize}px "Archivo Black", sans-serif`;
  ctx.fillText(state.tagline.toUpperCase(), left, top + tagSize);
  try { ctx.letterSpacing = '0px'; } catch { /* older canvas */ }
  ctx.restore();

  // A short gold rule under the tagline.
  ctx.save();
  ctx.fillStyle = '#f5b942';
  ctx.fillRect(left, top + tagSize * 1.35, Math.min(band.w * 0.22, width * 0.12), Math.max(2, tagSize * 0.12));
  ctx.restore();

  ctx.save();
  ctx.textBaseline = 'alphabetic';
  ctx.font = `${capSize}px "Bebas Neue", sans-serif`;
  const capY = top + tagSize * 0.9 + capSize;
  if (state.outline) {
    ctx.lineWidth = Math.max(2, capSize * 0.07);
    ctx.strokeStyle = '#12081f';
    ctx.lineJoin = 'round';
    ctx.strokeText(state.caption.toUpperCase(), left, capY);
  }
  ctx.fillStyle = state.captionColor || '#ffffff';
  ctx.fillText(state.caption.toUpperCase(), left, capY);
  ctx.restore();
}

// Draw the whole poster onto ctx at the given size.
export function drawPoster(ctx, state, width, height) {
  ctx.save();
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#0b0612';
  ctx.fillRect(0, 0, width, height);

  const layout = getLayout(state.layout);
  const grade = getGrade(state.grade);
  const panels = layout.panels.map((rect) => toPixels(rect, width, height));
  const band = toPixels(layout.caption, width, height);

  panels.forEach((panel, i) => {
    const frame = state.frames[i] ?? {};
    const photo = state.photos.find((p) => p.id === frame.photo);
    if (photo && photo.img) {
      drawPhoto(ctx, photo.img, panel, frame, grade.filter);
    } else {
      drawEmptyPanel(ctx, panel, i + 1);
    }
  });

  washGrade(ctx, grade, width, height);
  vignette(ctx, width, height);
  panels.forEach((panel) => framePanel(ctx, panel, width));

  drawWords(ctx, { ...state, verticalCaption: layout.vertical }, band, width, height);
  ctx.restore();
}

// Render the poster onto a fresh canvas and return it.
export function renderPoster(state, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  drawPoster(canvas.getContext('2d'), state, width, height);
  return canvas;
}

// Render the poster as a PNG blob.
export function exportPosterPNG(state, width, height) {
  return new Promise((resolve, reject) => {
    renderPoster(state, width, height).toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('the poster did not export'));
    }, 'image/png');
  });
}
