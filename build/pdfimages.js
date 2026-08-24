/* Extracts embedded image XObjects from a PDF and writes them as PNGs.
   Zero dependencies. Handles the FlateDecode raw-bitmap case, which is what
   image-only export PDFs use, plus passthrough for DCT (JPEG) streams. */
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const src = process.argv[2];
const outDir = process.argv[3];
fs.mkdirSync(outDir, { recursive: true });
const buf = fs.readFileSync(src);
const latin = buf.toString('latin1');

/* ---- tiny PNG writer ---- */
const CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return b => {
    let c = -1;
    for (let i = 0; i < b.length; i++) c = t[(c ^ b[i]) & 0xff] ^ (c >>> 8);
    return (c ^ -1) >>> 0;
  };
})();

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(CRC(td));
  return Buffer.concat([len, td, crc]);
}

function writePng(file, w, h, channels, raw) {
  const stride = w * channels;
  const lines = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) {
    lines[y * (stride + 1)] = 0;
    raw.copy(lines, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;                              /* bit depth */
  ihdr[9] = channels === 1 ? 0 : channels === 3 ? 2 : 6;
  fs.writeFileSync(file, Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(lines, { level: 6 })),
    chunk('IEND', Buffer.alloc(0))
  ]));
}

/* ---- walk the objects ---- */
const num = (dict, key) => {
  const m = dict.match(new RegExp('\\/' + key + '\\s+(\\d+)'));
  return m ? parseInt(m[1], 10) : null;
};

const re = /(\d+)\s+0\s+obj([\s\S]*?)endobj/g;
let m, found = 0;
const report = [];

while ((m = re.exec(latin))) {
  const body = m[2];
  if (!/\/Subtype\s*\/Image/.test(body)) continue;
  const sIdx = body.indexOf('stream');
  if (sIdx < 0) continue;
  const dict = body.slice(0, sIdx);

  const w = num(dict, 'Width'), h = num(dict, 'Height');
  const bpc = num(dict, 'BitsPerComponent') || 8;
  const isRGB = /\/DeviceRGB/.test(dict);
  const isGray = /\/DeviceGray/.test(dict);
  const isDCT = /\/DCTDecode/.test(dict);
  if (!w || !h) continue;

  const objStart = m.index + m[0].indexOf('stream') + 6;
  let s = objStart;
  if (buf[s] === 0x0d) s++;
  if (buf[s] === 0x0a) s++;
  const eIdx = latin.indexOf('endstream', s);
  const rawStream = buf.slice(s, eIdx);

  found++;
  const base = path.join(outDir, 'img' + String(found).padStart(2, '0'));

  if (isDCT) {
    fs.writeFileSync(base + '.jpg', rawStream);
    report.push(`img${String(found).padStart(2, '0')}.jpg  ${w}x${h}  jpeg passthrough`);
    continue;
  }

  let data;
  try { data = zlib.inflateSync(rawStream); }
  catch (e) {
    try { data = zlib.inflateRawSync(rawStream); }
    catch (e2) { report.push(`img${found} SKIPPED (${w}x${h}) could not inflate`); continue; }
  }

  const channels = isRGB ? 3 : isGray ? 1 : Math.round(data.length / (w * h));
  if (bpc !== 8 || ![1, 3, 4].includes(channels) || data.length < w * h * channels) {
    report.push(`img${found} SKIPPED (${w}x${h}) bpc=${bpc} ch=${channels} bytes=${data.length}`);
    continue;
  }
  writePng(base + '.png', w, h, channels, data);
  report.push(`img${String(found).padStart(2, '0')}.png  ${w}x${h}  ${channels === 1 ? 'gray' : channels === 3 ? 'rgb' : 'rgba'}`);
}

console.log('image objects found: ' + found + '\n');
report.forEach(r => console.log('  ' + r));
