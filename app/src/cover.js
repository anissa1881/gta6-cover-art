// Renders the poster onto a canvas: photos in their panels, the grade wash,
// the caption band with tagline and caption. The same function draws the live
// preview and the exported PNGs, so what you see is what you export.
//
// A poster is { layout, grade, tagline, caption, captionColor, captionScale,
// outline, slots }, where slots is four { img, zoom, ox, oy } entries: img
// is an Image (or null for an empty panel), zoom is 1..3, and ox/oy are pan
// fractions in [-1, 1] across the photo's slack inside its panel.
import { posterGeometry } from './layouts.js';
import { paintGrade } from './grade.js';

export const TAGLINE_FONT = '"Helvetica Neue", Arial, sans-serif';
export const TAGLINE_WEIGHT = 800;
export const CAPTION_FONT = '"Arial Black", "Helvetica Neue", Arial, sans-serif';
export const CAPTION_WEIGHT = 900;

/** How a photo sits inside its panel at a zoom: its drawn size and slack. */
export function photoMetrics(img, rect, zoom) {
  const base = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight);
  const scale = base * zoom;
  const pw = img.naturalWidth * scale;
  const ph = img.naturalHeight * scale;
  return { pw, ph, slackX: Math.max(0, (pw - rect.w) / 2), slackY: Math.max(0, (ph - rect.h) / 2) };
}

/** Draws one photo into its panel, cover-fit, zoomed and panned. */
function drawPhotoInto(ctx, img, rect, zoom, ox, oy) {
  if (!img || rect.w <= 0 || rect.h <= 0) return;
  const { pw, ph, slackX, slackY } = photoMetrics(img, rect, zoom);
  const dx = rect.x + (rect.w - pw) / 2 + ox * slackX;
  const dy = rect.y + (rect.h - ph) / 2 + oy * slackY;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.drawImage(img, dx, dy, pw, ph);
  ctx.restore();
}

/** The largest font size (at most `start`) at which `text` fits `maxWidth`. */
function fitFont(ctx, text, weight, family, maxWidth, start) {
  let size = start;
  ctx.font = `${weight} ${size}px ${family}`;
  while (size > 10 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${family}`;
  }
  return size;
}

/** Draws the whole poster onto `canvas` (at its own pixel size). */
export function renderPoster(canvas, poster) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const { panels, band } = posterGeometry(poster.layout, w, h);

  ctx.fillStyle = '#0d0a14';
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 4; i++) {
    const slot = poster.slots[i];
    const rect = panels[i];
    if (!rect || rect.w <= 0 || !slot || !slot.img) continue;
    drawPhotoInto(ctx, slot.img, rect, slot.zoom ?? 1, slot.ox ?? 0, slot.oy ?? 0);
  }

  paintGrade(ctx, poster.grade, 0, 0, w, h - band.h);

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(2, Math.round(w * 0.002));
  for (const rect of panels) {
    if (rect.w > 0) ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  }

  ctx.fillStyle = '#0d0a14';
  ctx.fillRect(band.x, band.y, band.w, band.h);

  const pad = Math.round(w * 0.045);
  const tagline = (poster.tagline || '').trim().toUpperCase();
  const caption = (poster.caption || '').trim().toUpperCase();
  let textY = band.y + band.h * 0.3;

  if (tagline) {
    const tSize = Math.max(14, Math.round(h * 0.028));
    ctx.font = `${TAGLINE_WEIGHT} ${tSize}px ${TAGLINE_FONT}`;
    ctx.letterSpacing = `${Math.round(tSize * 0.32)}px`;
    ctx.fillStyle = '#f5b942';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(tagline, pad, textY);
    const tw = ctx.measureText(tagline).width;
    ctx.letterSpacing = '0px';
    ctx.fillStyle = '#f5b942';
    ctx.fillRect(pad, textY + tSize * 0.45, Math.min(tw, w * 0.18), Math.max(2, Math.round(tSize * 0.08)));
    textY = band.y + band.h * 0.78;
  }

  if (caption) {
    const maxW = w - pad * 2;
    const start = Math.round(h * 0.155 * (poster.captionScale ?? 1));
    const size = fitFont(ctx, caption, CAPTION_WEIGHT, CAPTION_FONT, maxW, start);
    ctx.font = `${CAPTION_WEIGHT} ${size}px ${CAPTION_FONT}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    if (poster.outline) {
      ctx.lineWidth = Math.max(2, size * 0.07);
      ctx.strokeStyle = '#0d0a14';
      ctx.lineJoin = 'round';
      ctx.strokeText(caption, pad, textY);
    }
    ctx.fillStyle = poster.captionColor || '#ffffff';
    ctx.fillText(caption, pad, textY);
  }
}

/** Renders the poster at an export size and resolves to a PNG blob. */
export function exportPoster(poster, ew, eh) {
  const canvas = document.createElement('canvas');
  canvas.width = ew;
  canvas.height = eh;
  renderPoster(canvas, poster);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}
