// Fixed scenes for screenshots, driven by the page's query string:
//
//   ?shot=editor&layout=four&grade=neon&caption=BOULEVARD%20QUEEN
//       shows the editor with the samples loaded and the words set.
//   ?shot=cover&layout=hero&grade=sunset&caption=SUNSET%20HEIST&w=1080&h=1080
//       shows the finished cover alone, at the export size.
//   &pan=0.05,-0.02 frames the first panel by a fraction of its size.
//   &tagline=NEON%20COAST sets the tagline.
//
// The scene is ready when window.__shotReady is true: fonts loaded, the
// samples in, the poster drawn.

export async function runShot(query, api) {
  const shot = query.get('shot') ?? 'editor';
  if (shot === 'cover') document.body.classList.add('shot-cover');

  await api.loadSamples();

  const layout = query.get('layout');
  if (layout) api.setLayout(layout);
  const grade = query.get('grade');
  if (grade) api.setGrade(grade);
  const caption = query.get('caption');
  if (caption !== null) api.setCaption(caption);
  const tagline = query.get('tagline');
  if (tagline !== null) api.setTagline(tagline);

  const pan = query.get('pan');
  if (pan) {
    const [px, py] = pan.split(',').map(Number);
    if (Number.isFinite(px) && Number.isFinite(py)) api.panFirstPanel(px, py);
  }

  if (shot === 'cover') {
    const w = Number(query.get('w') ?? 1080);
    const h = Number(query.get('h') ?? 1080);
    api.setPosterSize(Number.isFinite(w) && w > 0 ? w : 1080, Number.isFinite(h) && h > 0 ? h : 1080);
  }

  await api.draw();
  window.__shotReady = true;
}
