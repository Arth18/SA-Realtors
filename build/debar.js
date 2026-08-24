/* Finds photos with flat borders baked into the file (the old site padded some
   listing photos onto a dark canvas) and re-crops them from the original JPGs. */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SRC = 'C:/Users/Arth/OneDrive/Desktop/SA REALTORS/site/assets/img';
const OUT = path.join(__dirname, '..', 'site', 'assets', 'img');
const SAMPLE = 200;                     /* analyse at this width, plenty for flat bars */

function raw(file, w) {
  const dim = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height', '-of', 'csv=p=0', file]).toString().trim().split(',');
  const W = +dim[0], H = +dim[1];
  const h = Math.max(1, Math.round(H * (w / W)));
  const buf = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-vf', `scale=${w}:${h}`,
    '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1 << 26 });
  return { buf, w, h, W, H };
}

const px = (r, x, y) => {
  const i = (y * r.w + x) * 3;
  return [r.buf[i], r.buf[i + 1], r.buf[i + 2]];
};
const near = (a, b, tol) =>
  Math.abs(a[0] - b[0]) <= tol && Math.abs(a[1] - b[1]) <= tol && Math.abs(a[2] - b[2]) <= tol;

/* a line counts as border if nearly every pixel matches the corner colour */
function rowIsBar(r, y, c, tol) {
  let hit = 0;
  for (let x = 0; x < r.w; x++) if (near(px(r, x, y), c, tol)) hit++;
  return hit / r.w > 0.97;
}
function colIsBar(r, x, c, tol) {
  let hit = 0;
  for (let y = 0; y < r.h; y++) if (near(px(r, x, y), c, tol)) hit++;
  return hit / r.h > 0.97;
}

const files = fs.readdirSync(SRC).filter(f => /\.jpg$/.test(f) && !/^agent-/.test(f));
const fixed = [];

for (const f of files) {
  const src = path.join(SRC, f);
  let r;
  try { r = raw(src, SAMPLE); } catch (e) { continue; }

  const corner = px(r, 0, 0);
  const TOL = 16;

  let top = 0, bottom = r.h - 1, left = 0, right = r.w - 1;
  while (top < r.h - 1 && rowIsBar(r, top, corner, TOL)) top++;
  while (bottom > top && rowIsBar(r, bottom, corner, TOL)) bottom--;
  while (left < r.w - 1 && colIsBar(r, left, corner, TOL)) left++;
  while (right > left && colIsBar(r, right, corner, TOL)) right--;

  const fracW = (right - left + 1) / r.w;
  const fracH = (bottom - top + 1) / r.h;
  if (fracW > 0.96 && fracH > 0.96) continue;          /* no meaningful bars */
  if (fracW < 0.2 || fracH < 0.2) continue;            /* nonsense, leave alone */

  /* map back to full resolution, keep even numbers for the encoder */
  const cw = Math.max(2, Math.round((right - left + 1) / r.w * r.W) & ~1);
  const ch = Math.max(2, Math.round((bottom - top + 1) / r.h * r.H) & ~1);
  const cx = Math.round(left / r.w * r.W) & ~1;
  const cy = Math.round(top / r.h * r.H) & ~1;

  const base = f.replace(/\.jpg$/, '');
  const target = /-card$/.test(base) ? 800 : /-hero$/.test(base) ? 1600 : 1200;
  const q = /-card$/.test(base) ? 78 : 76;

  execFileSync('ffmpeg', ['-v', 'error', '-i', src,
    '-vf', `crop=${cw}:${ch}:${cx}:${cy},scale=${target}:-2`,
    '-c:v', 'libwebp', '-quality', String(q), '-y', path.join(OUT, base + '.webp')]);

  fixed.push(`${base}: ${r.W}x${r.H} -> ${cw}x${ch} (bars: ${Math.round((1 - fracW) * 100)}% w, ${Math.round((1 - fracH) * 100)}% h)`);
}

console.log(fixed.length ? 'recropped ' + fixed.length + ' images:\n  ' + fixed.join('\n  ')
  : 'no letterboxed images found');
