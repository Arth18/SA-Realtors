/* Builds every page of the site from the extracted data and the shared parts.
   Dev tool. The OUTPUT is plain static HTML that needs no build step to serve. */
const fs = require('fs');
const path = require('path');
const P = require('./parts.js');

const OUT = path.join(__dirname, '..', 'site');
const DATA = require('./properties.json');
const HERO = fs.readFileSync(path.join(__dirname, 'hero-block.html'), 'utf8');

/* ---------- classify the real data ---------- */
const LAND = new Set([
  '461-fradd-east-road-munno-para-west-sa-5115',
  '68-78-coventry-rd-evanston-gardens-sa-5116',
  '693-coventry-road-kudla',
  '737-coventry-road-kudla-sa-5115',
  'lot-13-pannan-road-munno-para-downs-sa-5115',
  'lot-508-fradd-road-angle-vale-south-australia-5117'
]);
/* Current stock. Everything not listed here is a past result.
   Portrush Road was corrected back to For Sale on 2026-08-21: it is live on REA. */
const STATE = {
  '12-317-portrush-road-norwood-sa-5067': 'For Sale',
  '17-a-copley-street-broadview-sa-5083': 'For Sale',
  '11-carlow-street-salisbury-downs-sa-5108': 'For Rent',
  '225-hogarth-road-elizabeth-grove-sa-5112': 'Leased',
  '95-hogarth-road-elizabeth-sa-5112': 'Leased'
};

const props = DATA.map(p => ({
  ...p,
  kind: LAND.has(p.slug) ? 'land' : 'residential',
  state: STATE[p.slug] || 'Sold',
  card: p.card ? path.basename(p.card).replace(/\.jpg$/, '.webp') : basename(p, 'card'),
  hero: p.hero ? path.basename(p.hero).replace(/\.jpg$/, '.webp') : basename(p, 'hero'),
  gallery: (p.gallery || []).map(g => path.basename(g).replace(/\.jpg$/, '.webp'))
}));

function basename(p, suffix) {
  const any = p.hero || p.card || (p.gallery && p.gallery[0]) || '';
  const b = path.basename(any).replace(/-(card|hero|g\d+)\.jpg$/, '');
  return b ? b + '-' + suffix + '.webp' : '';
}

const land = props.filter(p => p.kind === 'land');
const sold = props.filter(p => p.state === 'Sold');
const rentals = props.filter(p => p.state === 'For Rent' || p.state === 'Leased');
const forSale = props.filter(p => p.state === 'For Sale');
const suburbs = [...new Set(props.map(p => p.suburb))].sort();

/* the status filter is built from what is actually in the data, in a sensible
   reading order, so it can never fall out of step with the listings again */
const STATUS_ORDER = ['For Sale', 'For Rent', 'Sold', 'Leased'];
const statuses = STATUS_ORDER.filter(s => props.some(p => p.state === s));

/* honest agency numbers, computed from the real listings */
const acres = land.reduce((t, p) => t + (parseFloat(p.land) || 0), 0);
const STATS = [
  { n: String(sold.length), short: 'properties sold', label: 'properties sold, from suburban homes to ten acre development sites' },
  { n: acres + ' acres', short: 'of development land', label: 'of development land sold across the northern corridor' },
  { n: String(suburbs.length), short: 'suburbs worked', label: 'suburbs worked across Adelaide’s north and inner east' }
];

const write = (file, html) => {
  fs.writeFileSync(path.join(OUT, file), html);
  return file;
};
const made = [];
const page = (file, html) => made.push(write(file, html));

/* =======================================================
   HOME
   ======================================================= */
{
  const feature = sold.filter(p => p.gallery.length).slice(0, 3);
  const body = `
<!-- ============ FIND A BLOCK ============ -->
<section class="sec sec--find">
  <div class="wrap">${P.findBar(suburbs)}</div>
</section>

<!-- ============ WHAT WE DO ============ -->
<section class="sec sec--offer" id="offer">
  <div class="wrap">
    ${P.sectionHead(
      'We help you find the land that will be yours',
      'Residential and future residential sites across Adelaide, from small blocks at 700 square metres through to ten acre development projects.',
      { kicker: 'Limited projects available' })}
    <ul class="badges reveal">
      <li class="badge">
        <span class="badge__mark" aria-hidden="true"><svg viewBox="0 0 40 40"><path d="M7 27 L20 15 L33 27" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 27 v6 h18 v-6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
        <h3>Residential and future residential land</h3>
      </li>
      <li class="badge">
        <span class="badge__mark" aria-hidden="true"><svg viewBox="0 0 40 40"><rect x="7" y="7" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.6"/><rect x="23" y="7" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.6"/><rect x="7" y="23" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.6"/><rect x="21" y="21" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.6"/></svg></span>
        <h3>Multiple project sizes available</h3>
      </li>
      <li class="badge">
        <span class="badge__mark" aria-hidden="true"><svg viewBox="0 0 40 40"><circle cx="14" cy="15" r="5" fill="none" stroke="currentColor" stroke-width="2.6"/><circle cx="27" cy="17" r="4" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M5 32 c0-6 4-9 9-9 s9 3 9 9" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M24 32 c0-5 3-8 7-8 s5 3 5 8" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg></span>
        <h3>Suitable for developers and investors</h3>
      </li>
    </ul>
    <p class="sec__more"><a class="btn" href="development-opportunities.html">See land and development sites</a></p>
  </div>
</section>

<!-- ============ HOW IT WORKS ============ -->
<section class="sec sec--steps sec--tint" id="how">
  <div class="wrap">
    ${P.sectionHead('How buying a site with us actually goes', 'Three steps, and you can stop after any of them. Nothing here costs you anything until you decide to buy.', { kicker: 'How it works' })}
    ${P.steps([
      ['Tell us what you want to build.',
       'One call. What you have in mind, roughly what you can spend, and whether you have done it before. If we have nothing that fits we will say so on that call.'],
      ['We find sites that fit, and check them properly.',
       'Titled or untitled, what it will cost to make ready, what council has earmarked around it. We send you the numbers rather than a brochure.'],
      ['You decide with the whole picture.',
       'If a site does not stack up, we tell you and you walk away. If it does, we handle the deal end to end and you know every cost before you commit.']
    ])}
  </div>
</section>

<!-- ============ RECENT RESULTS ============ -->
<section class="sec sec--listings">
  <div class="wrap">
    ${P.sectionHead('Recently sold', 'A sample of what we have moved lately. Every one of these was handled by the people whose numbers are on this page.')}
    ${P.grid(feature.map(P.propertyCard))}
    <p class="sec__more"><a class="btn btn--ghost" href="properties-sold.html">See everything we have sold</a></p>
  </div>
</section>

${surveySection()}

<!-- ============ PROOF STRIP ============ -->
<section class="sec sec--proof">
  <div class="wrap">${P.proofStrip(STATS, suburbs)}</div>
</section>

${P.enquire()}
`;

  page('index.html',
    P.head({
      file: 'index.html',
      title: 'SA Realtors | Land and development sites across Adelaide',
      desc: 'Residential and future residential land across Adelaide, from 700 square metres to ten acre development sites. SA Realtors, Payneham. RLA 344822.',
      bodyClass: 'has-hero'
    }) + '\n' + HERO + '\n' + body + P.foot());
}

/* the hold-to-survey moment, kept from the previous build */
function surveySection() {
  return `<!-- ============ THE INTERACTIVE MOMENT ============ -->
<section class="sec sec--survey" id="survey">
  <div class="survey" id="surveyWrap">
    <div class="survey__frame">
      <img class="survey__img" src="assets/blocks.webp" alt="Vacant residential blocks seen from directly above, with roads and kerbs already in" width="1500" height="844" loading="lazy" decoding="async">
      <svg class="survey__svg" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <mask id="surveyMask" maskUnits="userSpaceOnUse">
            <path class="drawmask" id="surveyMaskPath" d="M 560 300 L 1310 300 L 1310 700 L 560 700 Z" fill="none" stroke="#fff" stroke-width="40" stroke-linejoin="round" stroke-linecap="round"></path>
          </mask>
        </defs>
        <path class="survey__fill" d="M 560 300 L 1310 300 L 1310 700 L 560 700 Z"></path>
        <path class="survey__line" id="surveyLine" d="M 560 300 L 1310 300 L 1310 700 L 560 700 Z" mask="url(#surveyMask)"></path>
        <g class="survey__pegs" id="surveyPegs">
          <g class="peg" style="--i:0"><rect x="-10" y="-10" width="20" height="20" transform="translate(560,300) rotate(45)"></rect><circle cx="560" cy="300" r="3.6"></circle></g>
          <g class="peg" style="--i:1"><rect x="-10" y="-10" width="20" height="20" transform="translate(1310,300) rotate(45)"></rect><circle cx="1310" cy="300" r="3.6"></circle></g>
          <g class="peg" style="--i:2"><rect x="-10" y="-10" width="20" height="20" transform="translate(1310,700) rotate(45)"></rect><circle cx="1310" cy="700" r="3.6"></circle></g>
          <g class="peg" style="--i:3"><rect x="-10" y="-10" width="20" height="20" transform="translate(560,700) rotate(45)"></rect><circle cx="560" cy="700" r="3.6"></circle></g>
        </g>
      </svg>
      <button class="survey__hit" id="surveyHit" type="button" aria-describedby="surveyHelp">
        <span class="survey__hint" id="surveyHint">Press and hold</span>
      </button>
      <div class="survey__hud chip" id="surveyHud" aria-hidden="true">
        <span class="survey__row"><b>AREA</b> <i id="hudArea">0</i></span>
        <span class="survey__row"><b>ZONING</b> <i id="hudZone">&ndash;</i></span>
        <span class="survey__row"><b>STATUS</b> <i id="hudStatus">&ndash;</i></span>
      </div>
    </div>
    <div class="survey__text">
      <p class="kicker kicker--light"><span class="pegmark" aria-hidden="true"></span>Hold to survey</p>
      <h2 class="h2 h2--light">This is what we do all day.</h2>
      <p class="lede lede--light" id="surveyHelp">Press and hold anywhere on the block. That is the whole job, finding the line worth drawing and making sure it holds.</p>
      <ul class="sizes" id="sizes">
        <li class="size" style="--i:0"><b>700m&sup2;</b><span>Small residential sites</span></li>
        <li class="size" style="--i:1"><b>1 by 2</b><span>Sites ready for development</span></li>
        <li class="size" style="--i:2"><b>10 acres</b><span>Future residential projects</span></li>
      </ul>
    </div>
  </div>
</section>`;
}

/* =======================================================
   LISTING INDEX PAGES
   ======================================================= */
function listingPage(o) {
  const cards = o.items.map(P.propertyCard);
  const empty = o.items.length === 0;
  const filters = o.filters ? `
    <form class="filters reveal" id="filters">
      <div class="filters__f">
        <label for="f-suburb">Suburb</label>
        <select id="f-suburb"><option value="">All suburbs</option>${suburbs.map(s => `<option>${P.esc(s)}</option>`).join('')}</select>
      </div>
      <div class="filters__f">
        <label for="f-type">Type</label>
        <select id="f-type"><option value="">All types</option><option value="residential">Residential</option><option value="land">Land and development</option></select>
      </div>
      <div class="filters__f">
        <label for="f-status">Status</label>
        <select id="f-status"><option value="">Any status</option>${statuses.map(s => `<option>${P.esc(s)}</option>`).join('')}</select>
      </div>
      <button class="btn" type="reset" id="filters-reset">Clear</button>
      <p class="filters__count" id="filters-count" role="status"></p>
    </form>` : '';

  return P.head({ file: o.file, title: o.title, desc: o.desc }) +
    P.pageHead({ crumbs: o.crumbs, kicker: o.kicker, title: o.h1, lede: o.lede }) +
    `<section class="sec sec--listings">
  <div class="wrap">
    ${filters}
    ${empty ? `<div class="empty reveal">
      <span class="empty__mark" aria-hidden="true"></span>
      <h2>${P.esc(o.emptyTitle)}</h2>
      <p>${P.esc(o.emptyBody)}</p>
      <a class="btn" href="#enquire">${P.esc(o.emptyCta || 'Tell us what you are after')}</a>
    </div>` : P.grid(cards, 'js-grid')}
  </div>
</section>
${o.extra || ''}
${P.enquire(o.enquire)}` + P.foot();
}

page('properties.html', listingPage({
  file: 'properties.html',
  title: 'Properties | SA Realtors',
  desc: 'Every property SA Realtors has handled across Adelaide, from residential homes to ten acre development sites.',
  crumbs: [{ label: 'Home', href: 'index.html' }, { label: 'Properties' }],
  kicker: 'Our listings',
  h1: 'Every property we have handled',
  lede: 'Filter by suburb, type or status. If nothing here fits, tell us what you are after and we will call you when it lands.',
  items: props,
  filters: true
}));

page('properties-for-sale.html', listingPage({
  file: 'properties-for-sale.html',
  title: 'For sale | SA Realtors',
  desc: 'Properties currently for sale with SA Realtors in Adelaide.',
  crumbs: [{ label: 'Home', href: 'index.html' }, { label: 'Properties', href: 'properties.html' }, { label: 'For sale' }],
  kicker: 'On the market',
  h1: 'For sale',
  lede: 'What is available right now.',
  items: forSale,
  emptyTitle: 'Nothing on the market this minute.',
  emptyBody: 'Our last few listings have all sold. Rather than leave stale ads up, we would rather you told us what you are looking for, so we can call you the day something fits.',
  emptyCta: 'Tell us what you are after',
  extra: `<section class="sec sec--listings sec--tint">
  <div class="wrap">
    ${forSale.length
      ? P.sectionHead('Recently sold', 'What has moved lately, so you can see the kind of thing we handle.')
      : P.sectionHead('Recently sold instead', 'What has moved lately, so you can see the kind of thing we handle.')}
    ${P.grid(sold.slice(0, 6).map(P.propertyCard))}
    <p class="sec__more"><a class="btn btn--ghost" href="properties-sold.html">See everything sold</a></p>
  </div>
</section>`
}));

page('properties-sold.html', listingPage({
  file: 'properties-sold.html',
  title: 'Sold | SA Realtors',
  desc: 'Properties and development sites sold by SA Realtors across Adelaide.',
  crumbs: [{ label: 'Home', href: 'index.html' }, { label: 'Properties', href: 'properties.html' }, { label: 'Sold' }],
  kicker: 'Past results',
  h1: 'What we have sold',
  lede: `${sold.length} properties, including ${acres} acres of development land through Adelaide's northern corridor.`,
  items: sold
}));

/* =======================================================
   PROPERTY DETAIL PAGES
   ======================================================= */
for (const p of props) {
  const pr = P.priceOf(p);
  const facts = [
    ['Bedrooms', p.beds], ['Bathrooms', p.baths], ['Car spaces', p.cars],
    ['Internal', p.internal], ['Land', p.land], ['Built', p.built]
  ].filter(f => f[1]);

  const gallery = p.gallery.length ? `<section class="sec sec--gallery">
  <div class="wrap">
    <div class="gal">${p.gallery.map((g, i) => `<figure class="gal__i${i === 0 ? ' gal__i--wide' : ''}"><img src="assets/img/${g}" alt="${P.esc(p.address)}, photo ${i + 2}" width="1200" height="800" loading="lazy" decoding="async"></figure>`).join('')}</div>
  </div>
</section>` : '';

  const similar = props.filter(x => x.slug !== p.slug && x.kind === p.kind).slice(0, 3);

  page('property-' + p.slug + '.html',
    P.head({
      file: 'property-' + p.slug + '.html',
      title: p.address + ' | SA Realtors',
      desc: p.metaDesc || `${p.state} in ${p.suburb}, South Australia. Enquire with SA Realtors.`
    }) +
    P.pageHead({
      crumbs: [
        { label: 'Home', href: 'index.html' },
        { label: 'Properties', href: 'properties.html' },
        { label: p.suburb }
      ],
      kicker: p.state + ' · ' + p.suburb,
      title: p.address
    }) +
    `<section class="sec sec--detail">
  <div class="wrap detail">
    <div class="detail__fig">
      <img src="assets/img/${p.hero}" alt="${P.esc(p.address)}" width="1600" height="1067" decoding="async">
      <span class="ptag ${P.tagClass(p.state)}">${P.esc(p.state)}</span>
    </div>
    <aside class="detail__side">
      <p class="detail__price">${P.esc(pr.main)}${pr.note ? ` <small>${P.esc(pr.note)}</small>` : ''}</p>
      <dl class="detail__facts">${facts.map(f => `<div><dt>${P.esc(f[0])}</dt><dd>${P.esc(f[1])}</dd></div>`).join('')}</dl>
      <a class="btn btn--wide" href="#enquire">Enquire about this property</a>
      <p class="detail__call">Or call <a href="tel:${P.AGENCY.phoneHref}">${P.AGENCY.phone}</a></p>
    </aside>
  </div>
</section>

${p.body.length ? `<section class="sec sec--prose">
  <div class="wrap listing">
    <div class="listing__copy reveal">
      ${p.headline ? `<h2>${P.esc(p.headline)}</h2>` : '<h2>About this property</h2>'}
      ${p.subhead ? `<p class="listing__sub">${P.esc(p.subhead)}</p>` : ''}
      ${p.body.map(t => `<p>${P.esc(t)}</p>`).join('\n')}
      ${p.features && p.features.length ? `
      <h3>What you get</h3>
      <ul class="listing__features">${p.features.map(f => `<li>${P.esc(f)}</li>`).join('')}</ul>` : ''}
    </div>
    ${p.specs && p.specs.length ? `<aside class="listing__specs reveal">
      <h3>The details</h3>
      <dl>${p.specs.map(s => `<div><dt>${P.esc(s[0])}</dt><dd>${P.esc(s[1])}</dd></div>`).join('')}</dl>
    </aside>` : ''}
  </div>
  ${p.disclaimer ? `<div class="wrap"><p class="listing__disclaimer">${P.esc(p.disclaimer)}</p></div>` : ''}
</section>` : ''}

${gallery}

${similar.length ? `<section class="sec sec--listings sec--tint">
  <div class="wrap">
    ${P.sectionHead('More like this', '')}
    ${P.grid(similar.map(P.propertyCard))}
  </div>
</section>` : ''}

${P.enquire({
      title: 'Enquire about ' + p.address.split(',')[0],
      lede: 'Send us your details and one of us will call you about this property.',
      options: ['This property', 'Something similar', 'Land or a development site']
    })}` + P.foot());
}

/* =======================================================
   DEVELOPMENT OPPORTUNITIES
   ======================================================= */
page('development-opportunities.html',
  P.head({
    file: 'development-opportunities.html',
    title: 'Land and development sites | SA Realtors',
    desc: 'Residential and future residential development sites across Adelaide, from 700 square metres to ten acres. SA Realtors, RLA 344822.'
  }) +
  P.pageHead({
    crumbs: [{ label: 'Home', href: 'index.html' }, { label: 'Land and development' }],
    kicker: 'Limited projects available',
    title: 'Are you a property developer looking for your next residential project?',
    lede: 'We have opportunities from small residential sites at 700 square metres through to ten acre future residential projects.'
  }) +
  `<section class="sec sec--offers">
  <div class="wrap">
    ${P.sectionHead('Sites we have handled', `${acres} acres across the northern corridor, through Munno Para, Angle Vale, Kudla and Evanston Gardens.`)}
    <div class="orows">${land.map(P.offerRow).join('\n')}</div>
  </div>
</section>

<section class="sec sec--questions">
  <div class="wrap questions">
    ${P.sectionHead('What usually stops people', 'These are the four we hear most. Here is what we actually say.', { kicker: 'Straight answers' })}
    <div class="qlist">
      ${[
    ['The advertised price is never the final price.',
      'True, and it is usually site costs that do it. Earthworks, service connections, fencing, driveways and landscaping sit outside most advertised prices. We tell you what a site is likely to cost to make ready before you commit, not after.'],
    ['Is it titled or untitled?',
      'We tell you on every site, in writing. It matters, because you cannot settle your loan or start building on untitled land, and titles slip on weather and council timing. If a site is untitled we tell you the expected date and what happens if it moves.'],
    ['Is Adelaide still a buy after the boom?',
      'Honestly, the easy money has been made. What is left in the north is growth backed by infrastructure that is already built and rental demand that has stayed tight. That is a different case from a boom, and it is the one we will make to you with real numbers on a real site.'],
    ['How do I know the site actually stacks up?',
      'Ask us for the numbers on any site and we will send them. If a site does not work for what you want to build, we will tell you that too. We would rather lose one sale than sell you the wrong block.']
  ].map(q => `<details class="q reveal" name="q">
        <summary><span class="q__mark" aria-hidden="true"></span>${P.esc(q[0])}</summary>
        <div class="q__a"><p>${P.esc(q[1])}</p></div>
      </details>`).join('\n')}
    </div>
  </div>
</section>

${P.enquire({
    title: 'Tell us what you are looking to build.',
    lede: 'Fill in the form and our team will contact you shortly to discuss available opportunities.'
  })}` + P.foot());

/* =======================================================
   AGENTS
   ======================================================= */
page('agents.html',
  P.head({
    file: 'agents.html',
    title: 'The team | SA Realtors',
    desc: 'Meet the SA Realtors team. Nayan Darji, Dishant Suresh and Dinesh Sharma, Payneham, Adelaide. RLA 344822.'
  }) +
  P.pageHead({
    crumbs: [{ label: 'Home', href: 'index.html' }, { label: 'The team' }],
    kicker: 'A name you can trust',
    title: 'The people you will actually deal with',
    lede: 'We are a small Adelaide agency, so you get one of us on the phone rather than a queue.'
  }) +
  `<section class="sec sec--team">
  <div class="wrap"><div class="agrid">${P.AGENTS.map(P.agentCard).join('\n')}</div></div>
</section>
${P.enquire({ title: 'Not sure who to call?', lede: 'Send it here and whichever of us it suits will get back to you.' })}` + P.foot());

for (const a of P.AGENTS) {
  page('agent-' + a.slug + '.html',
    P.head({
      file: 'agent-' + a.slug + '.html',
      title: a.name + ' | SA Realtors',
      desc: `${a.name}, ${a.role} at SA Realtors, Adelaide. ${a.focus}`
    }) +
    P.pageHead({
      crumbs: [{ label: 'Home', href: 'index.html' }, { label: 'The team', href: 'agents.html' }, { label: a.name }],
      kicker: a.role,
      title: a.name
    }) +
    `<section class="sec sec--person">
  <div class="wrap person">
    <div class="person__fig"><img src="assets/${a.img}" alt="${P.esc(a.name)}" width="760" height="1000" decoding="async"></div>
    <div class="person__body">
      <p class="person__focus">${P.esc(a.focus)}</p>
      ${a.bio.map(t => `<p>${P.esc(t)}</p>`).join('\n')}
      <dl class="person__contact">
        <div><dt>Phone</dt><dd><a href="tel:${a.href}">${P.esc(a.phone)}</a></dd></div>
        <div><dt>Email</dt><dd><a href="mailto:${P.AGENCY.email}">${P.AGENCY.email}</a></dd></div>
        <div><dt>Office</dt><dd>${P.AGENCY.street}, ${P.AGENCY.city}</dd></div>
      </dl>
    </div>
  </div>
</section>
${P.enquire({ title: 'Get in touch with ' + a.name.split(' ')[0], lede: 'Send your details and ' + a.name.split(' ')[0] + ' will call you back.' })}` + P.foot());
}

/* =======================================================
   ABOUT
   ======================================================= */
page('about.html',
  P.head({
    file: 'about.html',
    title: 'About | SA Realtors',
    desc: 'SA Realtors is a small Adelaide agency working land, development sites and residential property across the northern corridor. RLA 344822.'
  }) +
  P.pageHead({
    crumbs: [{ label: 'Home', href: 'index.html' }, { label: 'About' }],
    kicker: 'A name you can trust',
    title: 'A small Adelaide agency that knows one patch properly',
    lede: 'We work land and development sites through Adelaide’s northern corridor, and residential property across the suburbs around it.'
  }) +
  `<section class="sec sec--prose">
  <div class="wrap prose reveal">
    <p>SA Realtors is run out of an office on Payneham Road, and there are three of us. That is the whole thing. When you call, you get Nayan, Dishant or Dinesh, not a call centre and not a junior reading from a script.</p>
    <h2>What we actually do</h2>
    <p>Most of our work is land. Development sites, future residential blocks, acreage with subdivision potential, and the questions that come with them: is it titled, what will it cost to make ready, what can you actually build on it. We have sold ${acres} acres across ${suburbs.length} suburbs, mostly through Munno Para, Angle Vale, Kudla and Evanston Gardens.</p>
    <p>Alongside that we sell and lease houses through Salisbury, Elizabeth and the northern suburbs, and we act as buyers agents for people who would rather have somebody on their side of the table.</p>
    <h2>How we work</h2>
    <p>We tell you the things that cost you money before you commit, not after. Site costs, service connections, whether a block is titled and what happens if the title date slips. None of that is exciting, and all of it decides whether a project works.</p>
    <p>If a site does not stack up for what you want to build, we say so. We would rather lose a sale than put somebody into the wrong block, because in a city this size that gets around.</p>
    <h2>The details</h2>
    <p>SA Realtors, ${P.AGENCY.street}, ${P.AGENCY.city}. Licensed in South Australia, ${P.AGENCY.rla}. Reach us on <a href="tel:${P.AGENCY.phoneHref}">${P.AGENCY.phone}</a> or <a href="mailto:${P.AGENCY.email}">${P.AGENCY.email}</a>.</p>
  </div>
</section>

<section class="sec sec--north">
  <div class="wrap">
    ${P.sectionHead('What we have done so far', 'Numbers from our own listings, not the market.')}
    ${P.statBlock(STATS)}
  </div>
</section>

<section class="sec sec--team">
  <div class="wrap">
    ${P.sectionHead('The three of us', '')}
    <div class="agrid">${P.AGENTS.map(P.agentCard).join('\n')}</div>
  </div>
</section>

${P.enquire({ title: 'Come and talk to us.', lede: 'Send your details and one of us will call you back.' })}` + P.foot());

/* =======================================================
   CONTACT
   ======================================================= */
page('contact.html',
  P.head({
    file: 'contact.html',
    title: 'Contact | SA Realtors',
    desc: 'Contact SA Realtors. 380 Payneham Road, Payneham SA 5070. 0489 280 000. RLA 344822.'
  }) +
  P.pageHead({
    crumbs: [{ label: 'Home', href: 'index.html' }, { label: 'Contact' }],
    kicker: 'Get in touch',
    title: 'Talk to us',
    lede: 'Call whichever of us suits, or send the form and we will come back to you.'
  }) +
  `<section class="sec sec--contact">
  <div class="wrap contact">
    <div class="contact__card reveal">
      <h2>The office</h2>
      <p>${P.AGENCY.street}<br>${P.AGENCY.city}</p>
      <p><a class="contact__big" href="tel:${P.AGENCY.phoneHref}">${P.AGENCY.phone}</a></p>
      <p><a href="mailto:${P.AGENCY.email}">${P.AGENCY.email}</a></p>
      <p class="contact__rla">${P.AGENCY.rla}</p>
    </div>
    ${P.AGENTS.map(a => `<div class="contact__card reveal">
      <h2>${P.esc(a.name)}</h2>
      <p class="contact__role">${P.esc(a.role)}</p>
      <p>${P.esc(a.focus)}</p>
      <p><a class="contact__big" href="tel:${a.href}">${P.esc(a.phone)}</a></p>
      <p><a href="agent-${a.slug}.html">Read more</a></p>
    </div>`).join('\n')}
  </div>
</section>

${P.enquire({ title: 'Send us a message.', lede: 'Tell us what you need and we will get back to you.' })}` + P.foot());

/* ---------- report ---------- */
console.log('generated ' + made.length + ' pages into site/\n');
made.forEach(f => console.log('  ' + f));
console.log('\nlistings: ' + props.length + ' total | ' + sold.length + ' sold | ' + rentals.length +
  ' rental | ' + forSale.length + ' for sale | ' + land.length + ' land');
console.log('stats: ' + STATS.map(s => s.n).join(' / '));
