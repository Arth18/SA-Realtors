/* Pulls the real listing data out of the previous build's HTML into one JSON file.
   Dev tool. Never shipped. */
const fs = require('fs');
const path = require('path');

const SRC = 'C:/Users/Arth/OneDrive/Desktop/SA REALTORS/site';
const OUT = path.join(__dirname, 'properties.json');

const strip = s => s.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&middot;/g, '·')
  .replace(/&nbsp;/g, ' ').replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"')
  .replace(/&sup2;/g, '²').replace(/&ndash;/g, '–').replace(/\s+/g, ' ').trim();

const grab = (html, re) => { const m = html.match(re); return m ? strip(m[1]) : ''; };

const files = fs.readdirSync(SRC).filter(f => /^property-.*\.html$/.test(f));
const out = [];

for (const f of files) {
  const html = fs.readFileSync(path.join(SRC, f), 'utf8');
  const slug = f.replace(/^property-|\.html$/g, '');

  const kicker = grab(html, /<p class="kicker">([\s\S]*?)<\/p>/);
  const parts = kicker.split('·').map(s => s.trim());
  const status = parts[0] || '';
  const suburb = parts[1] || '';

  const address = grab(html, /<h1>([\s\S]*?)<\/h1>/);

  const priceBlock = html.match(/<p class="price-big">([\s\S]*?)<\/p>/);
  let priceMain = '', priceNote = '';
  if (priceBlock) {
    priceNote = grab(priceBlock[1], /<small>([\s\S]*?)<\/small>/);
    priceMain = strip(priceBlock[1].replace(/<small>[\s\S]*?<\/small>/, ''));
  }

  const facts = {};
  const factbar = html.match(/<div class="factbar">([\s\S]*?)<\/div>\s*<\/div>\s*<\/section>/);
  if (factbar) {
    const re = /<span class="k">([\s\S]*?)<\/span><span class="v">([\s\S]*?)<\/span>/g;
    let m; while ((m = re.exec(factbar[1]))) facts[strip(m[1])] = strip(m[2]);
  }

  /* the body copy: paragraphs inside the prose block, before "More like this" */
  const cut = html.split(/More like this/)[0];
  const proseParas = [];
  const pre = /<p>([\s\S]*?)<\/p>/g;
  let pm;
  while ((pm = pre.exec(cut))) {
    const t = strip(pm[1]);
    if (t.length > 60 && !/^Home\s*\//.test(t)) proseParas.push(t);
  }

  const imgs = [...new Set((html.match(/assets\/img\/[a-z0-9-]+\.jpg/g) || []))];
  const base = imgs.length ? imgs[0].replace(/-(card|hero|g\d+)\.jpg$/, '') : '';
  const mine = imgs.filter(i => i.startsWith(base));
  const pick = suffix => mine.find(i => i.endsWith(suffix + '.jpg')) || '';
  const gallery = mine.filter(i => /-g\d+\.jpg$/.test(i)).sort();

  out.push({
    slug, address, suburb, status,
    priceMain, priceNote,
    beds: facts['Bedrooms'] || '', baths: facts['Bathrooms'] || '',
    cars: facts['Car spaces'] || '', land: facts['Land'] || '', built: facts['Built'] || '',
    metaDesc: grab(html, /<meta name="description" content="([^"]*)"/),
    body: proseParas,
    card: pick('-card'), hero: pick('-hero'), gallery
  });
}

out.sort((a, b) => a.address.localeCompare(b.address));
fs.writeFileSync(OUT, JSON.stringify(out, null, 2));

console.log('extracted ' + out.length + ' properties\n');
out.forEach(p => console.log(
  (p.status || '?').padEnd(9),
  (p.priceMain || '-').padEnd(12),
  (p.beds ? p.beds + 'b' : '  ').padEnd(4),
  (p.land || '-').padEnd(10),
  (p.gallery.length + 'img').padEnd(6),
  p.address.slice(0, 46)
));
