// Panel geometry for Neon Coast Cover Studio's three poster layouts.
//
// Every layout returns the four photo panels as pixel rects inside the
// poster's photo area, plus the caption band below it. A rect is
// { x, y, w, h } in poster pixels; a panel with a zero width or height is
// not drawn. The photo area is the top of the poster, the caption band the
// bottom quarter.

export const LAYOUTS = ['hero', 'four', 'strip'];

/** The panels and the caption band of a poster of `w` by `h` pixels. */
export function posterGeometry(layout, w, h) {
  const bandH = Math.round(h * 0.26);
  const photoH = h - bandH;
  const gap = Math.max(2, Math.round(Math.min(w, h) * 0.008));
  const panels = [];
  if (layout === 'hero') {
    // One photo, full-bleed across the photo area.
    panels.push({ x: 0, y: 0, w, h: photoH });
    panels.push({ x: 0, y: 0, w: 0, h: 0 });
    panels.push({ x: 0, y: 0, w: 0, h: 0 });
    panels.push({ x: 0, y: 0, w: 0, h: 0 });
  } else if (layout === 'strip') {
    // Four horizontal strips, stacked.
    const rh = Math.floor((photoH - gap * 3) / 4);
    for (let i = 0; i < 4; i++) {
      panels.push({ x: 0, y: i * (rh + gap), w, h: rh });
    }
  } else {
    // Four panels: a two-by-two grid.
    const cw = Math.floor((w - gap) / 2);
    const rh = Math.floor((photoH - gap) / 2);
    panels.push({ x: 0, y: 0, w: cw, h: rh });
    panels.push({ x: cw + gap, y: 0, w: w - cw - gap, h: rh });
    panels.push({ x: 0, y: rh + gap, w: cw, h: photoH - rh - gap });
    panels.push({ x: cw + gap, y: rh + gap, w: w - cw - gap, h: photoH - rh - gap });
  }
  return { panels, band: { x: 0, y: photoH, w, h: bandH } };
}
