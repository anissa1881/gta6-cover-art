// Panel geometry for the three poster layouts.
//
// Every rect is a fraction of the poster (0..1), so one layout works at
// every export size. A layout has four panel rects and one caption rect:
// the band the tagline and caption sit in. The gutter between panels is
// the poster's dark background showing through.

const GUTTER = 0.014;
const BAND = 0.22;

export const LAYOUTS = {
  hero: {
    label: 'Hero',
    hint: 'One big photo, words along the bottom',
    panels: [{ x: 0, y: 0, w: 1, h: 1 - BAND }],
    caption: { x: 0, y: 1 - BAND, w: 1, h: BAND },
    vertical: false,
  },
  four: {
    label: 'Four panels',
    hint: 'A 2 by 2 grid, words along the bottom',
    panels: [
      { x: 0, y: 0, w: 0.5 - GUTTER / 2, h: (1 - BAND) / 2 - GUTTER / 2 },
      { x: 0.5 + GUTTER / 2, y: 0, w: 0.5 - GUTTER / 2, h: (1 - BAND) / 2 - GUTTER / 2 },
      { x: 0, y: (1 - BAND) / 2 + GUTTER / 2, w: 0.5 - GUTTER / 2, h: (1 - BAND) / 2 - GUTTER / 2 },
      { x: 0.5 + GUTTER / 2, y: (1 - BAND) / 2 + GUTTER / 2, w: 0.5 - GUTTER / 2, h: (1 - BAND) / 2 - GUTTER / 2 },
    ],
    caption: { x: 0, y: 1 - BAND, w: 1, h: BAND },
    vertical: false,
  },
  strip: {
    label: 'Film strip',
    hint: 'Four stacked frames on the left, words on the right',
    panels: [
      { x: 0, y: 0, w: 0.56, h: 0.25 - GUTTER / 2 },
      { x: 0, y: 0.25 + GUTTER / 2, w: 0.56, h: 0.25 - GUTTER / 2 },
      { x: 0, y: 0.5 + GUTTER / 2, w: 0.56, h: 0.25 - GUTTER / 2 },
      { x: 0, y: 0.75 + GUTTER / 2, w: 0.56, h: 0.25 - GUTTER / 2 },
    ],
    caption: { x: 0.56 + GUTTER, y: 0, w: 1 - 0.56 - GUTTER, h: 1 },
    vertical: true,
  },
};

// The layout names, in the order the editor shows them.
export const LAYOUT_NAMES = Object.keys(LAYOUTS);

// Return the layout for a name, falling back to the hero layout.
export function getLayout(name) {
  return LAYOUTS[name] ?? LAYOUTS.hero;
}

// Turn a fractional rect into poster pixels.
export function toPixels(rect, width, height) {
  return {
    x: rect.x * width,
    y: rect.y * height,
    w: rect.w * width,
    h: rect.h * height,
  };
}
