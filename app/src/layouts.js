// Panel layouts for the cover: each layout turns a canvas of width w and height h
// into four photo panels plus a caption band along the bottom. All coordinates are
// pixels, so the same layout works for a 540 px preview and a 1920 px export.

export const LAYOUTS = ['hero', 'four', 'strip'];

/**
 * Returns the four panel rectangles and the caption band for a layout.
 * Each panel is {x, y, w, h}; the band is {x, y, w, h} at the foot of the canvas.
 */
export function layoutPanels(layout, w, h) {
  const gap = Math.max(3, Math.round(w * 0.004));
  const bandH = Math.round(h * 0.13);
  const bodyH = h - bandH;
  const band = { x: 0, y: h - bandH, w, h: bandH };

  if (layout === 'four') {
    const pw = (w - 3 * gap) / 2;
    const ph = (bodyH - 3 * gap) / 2;
    return {
      panels: [
        { x: gap, y: gap, w: pw, h: ph },
        { x: gap * 2 + pw, y: gap, w: pw, h: ph },
        { x: gap, y: gap * 2 + ph, w: pw, h: ph },
        { x: gap * 2 + pw, y: gap * 2 + ph, w: pw, h: ph },
      ],
      band,
    };
  }

  if (layout === 'strip') {
    const mainW = Math.round((w - 3 * gap) * 0.64);
    const sideX = gap * 2 + mainW;
    const sideW = w - mainW - 3 * gap;
    const sh = (bodyH - 4 * gap) / 3;
    return {
      panels: [
        { x: gap, y: gap, w: mainW, h: bodyH - 2 * gap },
        { x: sideX, y: gap, w: sideW, h: sh },
        { x: sideX, y: gap * 2 + sh, w: sideW, h: sh },
        { x: sideX, y: gap * 3 + sh * 2, w: sideW, h: sh },
      ],
      band,
    };
  }

  // hero: one big panel on top, three small panels in a row beneath it.
  const mainH = Math.round(bodyH * 0.6);
  const smallH = bodyH - mainH - gap;
  const sw = (w - 4 * gap) / 3;
  return {
    panels: [
      { x: gap, y: gap, w: w - 2 * gap, h: mainH - gap },
      { x: gap, y: mainH + gap, w: sw, h: smallH - gap },
      { x: gap * 2 + sw, y: mainH + gap, w: sw, h: smallH - gap },
      { x: gap * 3 + sw * 2, y: mainH + gap, w: sw, h: smallH - gap },
    ],
    band,
  };
}

/** Finds which panel (index 0-3), if any, holds the point (x, y). */
export function panelAt(panels, x, y) {
  for (let i = 0; i < panels.length; i++) {
    const p = panels[i];
    if (x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h) return i;
  }
  return -1;
}
