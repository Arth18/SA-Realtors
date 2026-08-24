/* Minimal PDF text extractor. Zero dependencies.
   Inflates the content streams and pulls the text-showing operators out.
   Good enough for a text-based listing PDF; useless on a scanned one. */
const fs = require('fs');
const zlib = require('zlib');

const buf = fs.readFileSync(process.argv[2]);

/* pull every stream ... endstream pair out of the raw bytes */
const streams = [];
let i = 0;
while (true) {
  const s = buf.indexOf('stream', i);
  if (s < 0) break;
  const e = buf.indexOf('endstream', s);
  if (e < 0) break;
  let start = s + 6;
  if (buf[start] === 0x0d) start++;
  if (buf[start] === 0x0a) start++;
  streams.push(buf.slice(start, e));
  i = e + 9;
}

const octal = { '050': '(', '051': ')', '134': '\\' };
function unescapePdf(s) {
  return s
    .replace(/\\([0-7]{3})/g, (m, o) => octal[o] || String.fromCharCode(parseInt(o, 8)))
    .replace(/\\n/g, '\n').replace(/\\r/g, '').replace(/\\t/g, ' ')
    .replace(/\\\(/g, '(').replace(/\\\)/g, ')').replace(/\\\\/g, '\\');
}

let out = '';
for (const raw of streams) {
  let txt;
  try { txt = zlib.inflateSync(raw).toString('latin1'); }
  catch (e) {
    try { txt = zlib.inflateRawSync(raw).toString('latin1'); }
    catch (e2) { continue; }
  }
  if (!/(Tj|TJ)/.test(txt)) continue;

  /* TJ arrays: [(a) -12 (b)] TJ   and simple (text) Tj */
  txt.replace(/\[((?:[^\[\]\\]|\\.)*)\]\s*TJ|\(((?:[^()\\]|\\.)*)\)\s*Tj|\bT\*|\bTd\b|\bTD\b/g,
    (m, arr, simple) => {
      if (arr !== undefined) {
        let line = '';
        arr.replace(/\(((?:[^()\\]|\\.)*)\)|(-?\d+(?:\.\d+)?)/g, (mm, str, num) => {
          if (str !== undefined) line += unescapePdf(str);
          else if (Math.abs(parseFloat(num)) > 120) line += ' ';
          return '';
        });
        out += line;
      } else if (simple !== undefined) {
        out += unescapePdf(simple);
      } else {
        out += '\n';
      }
      return '';
    });
  out += '\n';
}

out = out
  .replace(/\r/g, '')
  .replace(/[ \t]+/g, ' ')
  .replace(/\n{3,}/g, '\n\n')
  .split('\n').map(l => l.trim()).filter(Boolean).join('\n');

console.log(out);
