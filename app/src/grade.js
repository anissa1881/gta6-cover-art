// Colour grades for the poster: a translucent wash over the photo area and a
// vignette that pulls the eye to the middle. Drawn after the photos, before
// the caption band, so the grade tints the pictures but never the words.

export const GRADES = ['sunset', 'neon', 'gold', 'none'];

/** A soft darkening towards the edges of a rect. */
function vignette(ctx, x, y, w, h) {
  const g = ctx.createRadialGradient(
    x + w / 2, y + h / 2, Math.min(w, h) * 0.35,
    x + w / 2, y + h / 2, Math.max(w, h) * 0.75,
  );
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.38)');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

/** Paints `grade` over the rect (x, y, w, h). 'none' leaves only the vignette. */
export function paintGrade(ctx, grade, x, y, w, h) {
  if (grade === 'sunset') {
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, 'rgba(255,140,60,0.05)');
    g.addColorStop(0.55, 'rgba(255,90,40,0.16)');
    g.addColorStop(1, 'rgba(200,40,120,0.30)');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
  } else if (grade === 'neon') {
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, 'rgba(0,220,255,0.14)');
    g.addColorStop(0.5, 'rgba(120,80,255,0.10)');
    g.addColorStop(1, 'rgba(255,0,180,0.22)');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
  } else if (grade === 'gold') {
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, 'rgba(255,210,90,0.06)');
    g.addColorStop(1, 'rgba(255,170,40,0.24)');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
  }
  vignette(ctx, x, y, w, h);
}
