// Colour grades for the poster.
//
// A grade is a canvas filter applied while each photo is drawn, plus a
// soft-light gradient washed over the whole poster afterwards. `none`
// leaves the photos exactly as they are.

export const GRADES = {
  sunset: {
    label: 'Sunset',
    filter: 'saturate(1.3) contrast(1.06) sepia(0.22)',
    wash: ['rgba(255, 122, 26, 0.22)', 'rgba(255, 46, 136, 0.14)'],
    angle: 180,
  },
  neon: {
    label: 'Neon',
    filter: 'saturate(1.55) contrast(1.12) hue-rotate(-10deg)',
    wash: ['rgba(255, 0, 160, 0.18)', 'rgba(0, 214, 255, 0.16)'],
    angle: 135,
  },
  gold: {
    label: 'Gold hour',
    filter: 'saturate(1.18) contrast(1.05) sepia(0.38)',
    wash: ['rgba(255, 196, 66, 0.2)', 'rgba(255, 140, 0, 0.1)'],
    angle: 180,
  },
  none: {
    label: 'None',
    filter: 'none',
    wash: null,
    angle: 180,
  },
};

// The grade names, in the order the editor shows them.
export const GRADE_NAMES = Object.keys(GRADES);

// Return the grade for a name, falling back to sunset.
export function getGrade(name) {
  return GRADES[name] ?? GRADES.sunset;
}

// Wash the grade's gradient over the poster with a soft-light blend.
export function washGrade(ctx, grade, width, height) {
  if (!grade.wash) return;
  const radians = (grade.angle * Math.PI) / 180;
  const dx = Math.cos(radians) * width;
  const dy = Math.sin(radians) * height;
  const wash = ctx.createLinearGradient(0, 0, dx, dy);
  wash.addColorStop(0, grade.wash[0]);
  wash.addColorStop(1, grade.wash[1]);
  ctx.save();
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

// Darken the poster's corners a little, so the caption reads anywhere.
export function vignette(ctx, width, height) {
  const glow = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.42,
    width / 2, height / 2, Math.max(width, height) * 0.72,
  );
  glow.addColorStop(0, 'rgba(0, 0, 0, 0)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0.28)');
  ctx.save();
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}
