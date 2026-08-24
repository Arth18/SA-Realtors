/* Corrects 17A Copley Street, Broadview from Sold back to For Sale and loads the
   current listing detail from the agency's REA property PDF (ID 150593544).
   Their copy ships as written, with one exception: em dashes become commas so the
   whole site keeps one punctuation style. Wording is untouched. */
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'properties.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const slug = '17-a-copley-street-broadview-sa-5083';
const p = data.find(x => x.slug === slug);
if (!p) throw new Error('Copley listing not found');

p.headline = 'Spacious Broadview family home, six bedrooms on 508sqm';
p.subhead = 'Private viewings by appointment only';
p.priceMain = '$1,490,000 to $1,590,000';
p.beds = '6';
p.baths = '3';
p.cars = '4';
p.land = '508m²';
p.internal = '330m²';
p.propertyType = 'House';

p.body = [
  'Discover the luxury of seclusion.',
  'Positioned in the highly sought-after inner-north, 17A Copley Street offers something truly rare for Broadview: a grand-scale family estate tucked away in its own private sanctuary. While other homes contend with street noise and passing traffic, this impressive 330sqm residence is situated on a secure 508sqm hammerhead allotment, providing a peaceful, safe-haven environment that feels worlds away from the hustle and bustle.',
  'From the moment you travel down the private driveway, you will realise this is more than just a house. It is a quiet retreat designed for families who prioritise privacy and security.',
  'Unrivalled scale and style. Boasting six well-proportioned bedrooms, this home is a masterclass in functional luxury. Whether you have a large family or require a high-end home office suite, the expansive double-storey layout accommodates with ease. The home features three sophisticated bathrooms, including a private master ensuite, ensuring effortless convenience for the busiest households.',
  'The heart of the home. At the centre of the residence is a chef’s dream kitchen. Anchored by premium stone benchtops that continue throughout the entire house, the space features a 900mm cooktop, high-end cabinetry, and a massive butler’s pantry, the perfect setup for hosting grand dinner parties or managing large family meals.'
];

/* room dimensions read off the floor plan in the PDF */
p.features = [
  'Six bedrooms across two levels, plus a study and a separate office',
  'Living and dining 4.4 by 7.5 metres, opening off the kitchen',
  'Kitchen 4.4 by 3.1 metres with a walk-in pantry',
  'Upstairs rumpus 4.3 by 3.6 metres',
  'Master bedroom with walk-in robe and ensuite',
  'Three bathrooms, including a private master ensuite',
  'Double garage 6.0 by 6.0 metres',
  'Solar panels across the roof',
  'Secure hammerhead allotment set back from the street',
  'Private driveway entry'
];

p.specs = [
  ['Property type', 'House'],
  ['Land size', '508m² hammerhead allotment'],
  ['Residence', '330m²'],
  ['Living area', '262.37m²'],
  ['Garage', '40.11m²'],
  ['Total under roof', '304.64m²'],
  ['Storeys', 'Two'],
  ['Inspections', 'By appointment, contact the agent']
];

p.disclaimer = 'This floor plan including furniture, fixture measurements and dimensions are approximate and for illustrative purposes only. We give no guarantee, warranty or representation as to the accuracy and layout. All enquiries must be directed to the agent, vendor of party representing this floor plan.';

p.metaDesc = 'For sale in Broadview, South Australia. Six bedroom, three bathroom family home on a 508 square metre hammerhead allotment. $1,490,000 to $1,590,000. SA Realtors.';

/* keep the seven photos already on file and add the floor plan from the PDF */
p.gallery = [1, 2, 3, 4, 5, 6, 7].map(n => 'assets/img/' + slug + '-g' + n + '.jpg');

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('updated ' + p.address);
console.log('  price : ' + p.priceMain);
console.log('  facts : ' + p.beds + ' bed, ' + p.baths + ' bath, ' + p.cars + ' car, ' +
  p.internal + ' on ' + p.land);
console.log('  copy  : ' + p.body.length + ' paragraphs, ' + p.features.length + ' features, ' +
  p.specs.length + ' specs');
console.log('  photos: 1 hero + ' + p.gallery.length + ' gallery (floor plan added)');
