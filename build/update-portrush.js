/* Corrects 12/317 Portrush Road, Norwood from Sold back to For Sale and loads
   the current listing details supplied by the agency. */
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'properties.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const slug = '12-317-portrush-road-norwood-sa-5067';
const p = data.find(x => x.slug === slug);
if (!p) throw new Error('Portrush listing not found');

p.headline = 'Stylish Low-Maintenance Living in the Heart of Norwood';
p.subhead = 'Private open, welcome by appointment only';
p.priceMain = '$545,000 - $565,000';
p.beds = '2';
p.baths = '1';
p.cars = '1';
p.built = '1975';
p.internal = '65m²';
p.propertyType = 'Unit';

p.body = [
  'Whether you’re looking to move straight in or secure a quality investment in a premium location, this is an outstanding opportunity to enjoy the vibrant Norwood lifestyle.',
  'Positioned in one of Adelaide’s most sought-after suburbs, this beautifully presented two-bedroom unit offers the perfect blend of comfort, convenience, and easy-care living. Ideal for first home buyers, professionals, downsizers, or investors, this home delivers a relaxed lifestyle just moments from The Parade and the CBD.',
  'Filled with natural light, the home features a spacious open-plan living and dining area complemented by tiled flooring and split system air conditioning for year-round comfort. The updated kitchen is thoughtfully designed with quality appliances, generous bench space, and ample storage, making everyday living and entertaining effortless.',
  'Both bedrooms are well-sized and fitted with soft carpet for added comfort, creating warm and relaxing retreats. The modern bathroom adds a fresh contemporary touch, while large windows and stylish finishes throughout enhance the welcoming atmosphere of the home.',
  'Outside, enjoy the convenience of dedicated off-street parking and low-maintenance surroundings within a quiet, well-maintained group.'
];

p.features = [
  'First-floor position in a quiet group',
  'Two spacious bedrooms with carpet flooring',
  'Light-filled open-plan living and dining area',
  'Tiled flooring throughout main living spaces',
  'Updated kitchen with quality appliances and ample storage',
  'Modern bathroom with stylish finishes',
  'Split system air conditioning for year-round comfort',
  'Dedicated off-street parking',
  'Low-maintenance lifestyle opportunity',
  'Positioned in a highly desirable Norwood location',
  'Walking distance to The Parade, cafés, restaurants, shopping, and public transport',
  'Easy access to Adelaide CBD'
];

p.specs = [
  ['Property type', 'Unit'],
  ['Building size', '65m²'],
  ['Year built', '1975'],
  ['School zone', 'Marryatville School'],
  ['Council', 'City of Norwood Payneham & St Peters'],
  ['Council rates', '$352 per quarter, approx'],
  ['Strata rates', '$550 per quarter, approx']
];

p.disclaimer = 'We have obtained all information in this document from sources we believe to be reliable; however, we cannot guarantee its accuracy. No warranty or representation is given or made as to the correctness of the information supplied, and neither the Vendors nor their Agent can accept responsibility for errors or omissions. Prospective purchasers are advised to carry out their own investigations. All inclusions and exclusions must be confirmed in the Contract of Sale.';

p.metaDesc = 'For sale in Norwood, South Australia. Two bedroom unit, 65 square metres, walking distance to The Parade. $545,000 to $565,000. SA Realtors.';

/* the photos supplied by the agency, walked through the way a buyer would see it */
p.card = 'assets/img/' + slug + '-card.jpg';
p.hero = 'assets/img/' + slug + '-hero.jpg';
p.gallery = [1, 2, 3, 4, 5, 6].map(n => 'assets/img/' + slug + '-g' + n + '.jpg');

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('updated ' + p.address);
console.log('  price   : ' + p.priceMain);
console.log('  facts   : ' + p.beds + ' bed, ' + p.baths + ' bath, ' + p.cars + ' car, ' + p.internal);
console.log('  copy    : ' + p.body.length + ' paragraphs, ' + p.features.length + ' features, ' + p.specs.length + ' specs');
console.log('  photos  : 1 hero + ' + p.gallery.length + ' gallery');
