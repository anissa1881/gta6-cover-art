// Scripted scenes for screenshots. A ?shot= URL picks a fixed scene so a
// screenshot is reproducible: ?shot=cover draws one finished poster on its
// own, ?shot=editor opens the editor with the samples loaded. Parameters:
// layout, grade, caption, tagline, photo (one sample name, used in every
// panel, or four names separated by commas), w, h (poster pixels),
// zoom (percent), pan (horizontal pan -100..100 for the first panel),
// color (caption colour), scale (caption size percent), outline (0 to hide
// the caption outline). window.__shotReady is set once the scene has
// painted, so a screenshot tool knows when to shoot.

export async function runShot(shot, query, api) {
  const layout = query.get('layout') || 'hero';
  const grade = query.get('grade') || 'sunset';
  const caption = query.get('caption') || 'Sunset Heist';
  const tagline = query.get('tagline') || 'Neon Coast';
  const names = (query.get('photo') || 'beach-sunset').split(',');
  const zoom = Number(query.get('zoom') || 100) / 100;
  const pan = Number(query.get('pan') || 0) / 100;
  const w = Number(query.get('w') || 1080);
  const h = Number(query.get('h') || 1080);

  const imgs = [];
  for (let i = 0; i < 4; i++) {
    imgs.push(await api.loadSample(names[i % names.length]));
  }
  const poster = {
    layout,
    grade,
    tagline,
    caption,
    captionColor: query.get('color') || '#ffffff',
    captionScale: Number(query.get('scale') || 100) / 100,
    outline: query.get('outline') !== '0',
    slots: imgs.map((img, i) => ({
      img,
      zoom: i === 0 ? zoom : 1,
      ox: i === 0 ? pan : 0,
      oy: 0,
    })),
  };

  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    await api.showPoster(poster, w, h);
  } else {
    await api.showEditor(poster);
  }
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}
