/* One-off: turn the build-time properties.json into the runtime store the admin
   owns. Photos collapse into a single ordered list, first one is the main image. */
const fs = require('fs');
const path = require('path');

const SITE = path.join(__dirname, '..', 'site');
const src = JSON.parse(fs.readFileSync(path.join(__dirname, 'properties.json'), 'utf8'));

const LAND = new Set([
  '461-fradd-east-road-munno-para-west-sa-5115',
  '68-78-coventry-rd-evanston-gardens-sa-5116',
  '693-coventry-road-kudla',
  '737-coventry-road-kudla-sa-5115',
  'lot-13-pannan-road-munno-para-downs-sa-5115',
  'lot-508-fradd-road-angle-vale-south-australia-5117'
]);
const STATE = {
  '12-317-portrush-road-norwood-sa-5067': 'For Sale',
  '17-a-copley-street-broadview-sa-5083': 'For Sale',
  '11-carlow-street-salisbury-downs-sa-5108': 'For Rent',
  '225-hogarth-road-elizabeth-grove-sa-5112': 'Leased',
  '95-hogarth-road-elizabeth-sa-5112': 'Leased'
};

const imgDir = path.join(SITE, 'assets', 'img');
const onDisk = fs.readdirSync(imgDir);

const out = src.map(p => {
  /* main image first, then the gallery in order, only files that really exist */
  const wanted = [p.slug + '-hero.webp', p.slug + '-card.webp']
    .concat([1, 2, 3, 4, 5, 6, 7, 8].map(n => p.slug + '-g' + n + '.webp'));
  const photos = [];
  for (const f of wanted) {
    if (onDisk.includes(f) && !photos.includes(f)) photos.push(f);
  }
  /* the card is just a smaller cut of the hero, so it never needs its own slot */
  const hero = photos.find(f => f.endsWith('-hero.webp'));
  const rest = photos.filter(f => !f.endsWith('-hero.webp') && !f.endsWith('-card.webp'));
  const ordered = hero ? [hero].concat(rest) : rest;

  return {
    slug: p.slug,
    address: p.address,
    suburb: p.suburb,
    state: STATE[p.slug] || 'Sold',
    kind: LAND.has(p.slug) ? 'land' : 'residential',
    propertyType: p.propertyType || (LAND.has(p.slug) ? 'Land' : 'House'),
    price: p.priceMain || '',
    beds: p.beds || '', baths: p.baths || '', cars: p.cars || '',
    land: p.land || '', internal: p.internal || '', built: p.built || '',
    headline: p.headline || '',
    subhead: p.subhead || '',
    body: p.body || [],
    features: p.features || [],
    specs: p.specs || [],
    disclaimer: p.disclaimer || '',
    metaDesc: p.metaDesc || '',
    photos: ordered,
    updated: '2026-08-22'
  };
});

fs.mkdirSync(path.join(SITE, 'data'), { recursive: true });
fs.writeFileSync(path.join(SITE, 'data', 'properties.json'), JSON.stringify(out, null, 2));

console.log('migrated ' + out.length + ' properties into site/data/properties.json\n');
out.forEach(p => console.log(
  '  ' + p.state.padEnd(9) + p.kind.padEnd(12) +
  String(p.photos.length + ' photos').padEnd(10) +
  (p.price || '-').padEnd(24) + p.address.slice(0, 42)
));
const missing = out.filter(p => !p.photos.length);
console.log(missing.length ? '\nWARNING no photos: ' + missing.map(p => p.slug).join(', ')
  : '\nevery property has at least one photo');
