// Fixed scenes for screenshots: ?shot=editor shows the page with sample photos
// loaded; ?shot=cover shows the cover alone, filling the viewport. The query
// names the sample photos, the layout, the grade and the words. window.__shotReady
// is set once the scene has been painted.

/** Loads a sample photo by name, resolving to the image once it can be drawn. */
export function loadSamplePhoto(name) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = `samples/${name}.jpg`;
  });
}

export async function runShot(shot, query, applyScene) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  const names = (query.get('photos') ?? 'beach-sunset,neon-street,pier,boulevard').split(',');
  const photos = [];
  for (const name of names) {
    photos.push({ id: name, name: `${name}.jpg`, img: await loadSamplePhoto(name) });
  }
  applyScene({
    photos,
    layout: query.get('layout') ?? 'hero',
    grade: query.get('grade') ?? 'sunset',
    caption: query.get('caption') ?? 'Sunset Heist',
    tagline: query.get('tagline') ?? 'Neon Coast',
    captionColor: query.get('color') ?? '#ffffff',
    pan: query.get('pan') ?? null,
  });
  await document.fonts.ready;
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
