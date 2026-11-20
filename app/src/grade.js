// Colour grades: a Vice City sunset or neon wash laid over each photo. A grade is a
// top and bottom colour blended over the photo in soft light, plus a photo filter
// (saturation and contrast) applied while the photo is drawn.

export const GRADES = ['sunset', 'neon', 'gold', 'none'];

export const GRADE_DEFS = {
  sunset: {
    label: 'Sunset',
    top: '#ff9a3d',
    bottom: '#ff2d78',
    alpha: 0.3,
    filter: 'saturate(1.3) contrast(1.07) brightness(1.02)',
  },
  neon: {
    label: 'Neon',
    top: '#ff2fb3',
    bottom: '#22d3ee',
    alpha: 0.34,
    filter: 'saturate(1.35) contrast(1.08)',
  },
  gold: {
    label: 'Gold hour',
    top: '#ffd166',
    bottom: '#ff7b00',
    alpha: 0.3,
    filter: 'saturate(1.25) contrast(1.05) brightness(1.03)',
  },
  none: {
    label: 'No grade',
    top: '#ffffff',
    bottom: '#ffffff',
    alpha: 0,
    filter: 'none',
  },
};

/** Paints a grade's wash over a panel rectangle. */
export function gradeOverlay(ctx, gradeName, rect) {
  const grade = GRADE_DEFS[gradeName] ?? GRADE_DEFS.sunset;
  if (grade.alpha <= 0) return;
  const wash = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  wash.addColorStop(0, grade.top);
  wash.addColorStop(1, grade.bottom);
  ctx.save();
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = grade.alpha;
  ctx.fillStyle = wash;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}
