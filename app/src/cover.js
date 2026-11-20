// Draws the cover: four photo panels in the chosen layout, each cropped and
// positioned by the user, washed with the chosen colour grade, then a tagline and
// a bold caption in the band along the foot. Draws at the canvas's own pixel size,
// so a preview and a full-size export use exactly the same code.

import { layoutPanels } from './layouts.js';
import { GRADE_DEFS, gradeOverlay } from './grade.js';

const CAPTION_FONT = '"Bebas Neue", "Archivo Black", sans-serif';
const TAGLINE_FONT = '"Archivo Black", sans-serif';

/** Draws `state` onto the canvas's 2D context. */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const { panels, band } = layoutPanels(state.layout, w, h);

  ctx.fillStyle = '#160a20';
  ctx.fillRect(0, 0, w, h);

  panels.forEach((panel, i) => {
    const slot = state.panels[i];
    drawPanelPhoto(ctx, panel, slot, state.grade);
    gradeOverlay(ctx, state.grade, panel);
    // Thin white frame around each panel, the poster look.
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.lineWidth = Math.max(2, w * 0.002);
    ctx.strokeRect(panel.x, panel.y, panel.w, panel.h);
  });

  drawCaptionBand(ctx, band, w, state);
}

/** Draws one photo into its panel, cover-fit, zoomed and panned by the user. */
function drawPanelPhoto(ctx, panel, slot, gradeName) {
  const img = slot && slot.img ? slot.img : null;
  if (!img) {
    drawEmptyPanel(ctx, panel);
    return;
  }
  const zoom = slot.zoom || 1;
  const base = Math.max(panel.w / img.naturalWidth, panel.h / img.naturalHeight);
  const dw = img.naturalWidth * base * zoom;
  const dh = img.naturalHeight * base * zoom;
  // Clamp the pan so the photo always covers the panel.
  const maxOx = Math.max(0, (dw - panel.w) / 2);
  const maxOy = Math.max(0, (dh - panel.h) / 2);
  const ox = Math.max(-maxOx, Math.min(maxOx, slot.ox || 0));
  const oy = Math.max(-maxOy, Math.min(maxOy, slot.oy || 0));
  const dx = panel.x + (panel.w - dw) / 2 + ox;
  const dy = panel.y + (panel.h - dh) / 2 + oy;

  ctx.save();
  ctx.beginPath();
  ctx.rect(panel.x, panel.y, panel.w, panel.h);
  ctx.clip();
  ctx.filter = (GRADE_DEFS[gradeName] ?? GRADE_DEFS.sunset).filter;
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

/** An empty panel: a dusk gradient and a quiet invitation, never a broken image. */
function drawEmptyPanel(ctx, panel) {
  const g = ctx.createLinearGradient(panel.x, panel.y, panel.x, panel.y + panel.h);
  g.addColorStop(0, '#3a1c5e');
  g.addColorStop(1, '#1c0f30');
  ctx.fillStyle = g;
  ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
  const label = 'YOUR PHOTO';
  let size = Math.min(panel.h * 0.16, panel.w * 0.09);
  ctx.font = `${size}px ${CAPTION_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.fillText(label, panel.x + panel.w / 2, panel.y + panel.h / 2);
}

/** The caption band: a dark wash, the tagline in gold capitals, the caption big. */
function drawCaptionBand(ctx, band, w, state) {
  const wash = ctx.createLinearGradient(0, band.y - band.h * 0.5, 0, band.y + band.h);
  wash.addColorStop(0, 'rgba(12, 5, 20, 0)');
  wash.addColorStop(1, 'rgba(12, 5, 20, 0.9)');
  ctx.fillStyle = wash;
  ctx.fillRect(0, band.y - band.h * 0.5, w, band.h * 1.5);

  const tagline = (state.tagline || '').trim().toUpperCase();
  if (tagline) {
    const size = band.h * 0.2;
    ctx.font = `${size}px ${TAGLINE_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    try { ctx.letterSpacing = `${Math.round(size * 0.45)}px`; } catch { /* older canvas */ }
    ctx.fillStyle = '#ffcf5c';
    ctx.fillText(tagline, w / 2, band.y + band.h * 0.32);
    try { ctx.letterSpacing = '0px'; } catch { /* older canvas */ }
  }

  const caption = (state.caption || '').trim().toUpperCase();
  if (!caption) return;
  let size = band.h * 0.56 * (state.captionSize || 1);
  ctx.font = `${size}px ${CAPTION_FONT}`;
  while (ctx.measureText(caption).width > w * 0.92 && size > 10) {
    size -= 2;
    ctx.font = `${size}px ${CAPTION_FONT}`;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const cy = band.y + band.h * 0.88;
  if (state.outline) {
    ctx.strokeStyle = '#1a0b26';
    ctx.lineWidth = Math.max(2, size * 0.08);
    ctx.lineJoin = 'round';
    ctx.strokeText(caption, w / 2, cy);
  }
  ctx.fillStyle = state.captionColor || '#ffffff';
  ctx.fillText(caption, w / 2, cy);
}

/** Renders the cover at full size on a fresh canvas and resolves with its PNG blob. */
export function exportCoverPng(state, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  drawCover(canvas, state);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}
