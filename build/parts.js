/* Shared page furniture and components. Dev tool, never shipped.
   Visual language taken from the client's reference: calm near-white canvas,
   generous space, headline left with a short paragraph right, three-across cards. */

const AGENCY = {
  name: 'SA Realtors',
  tagline: 'A name you can trust',
  phone: '0489 280 000',
  phoneHref: '+61489280000',
  email: 'contact@sarealtors.com.au',
  street: '380 Payneham Road',
  city: 'Payneham SA 5070',
  rla: 'RLA 344822',
  web3formsKey: 'YOUR_ACCESS_KEY_HERE'
};

const AGENTS = [
  {
    slug: 'nayan-darji', name: 'Nayan Darji',
    role: 'Director and Property Advisor',
    phone: '0410 708 765', href: '+61410708765',
    img: 'agent-nayan.webp',
    focus: 'Land and development sites, right across Adelaide.',
    bio: [
      'Nayan handles the land side of the business. Development sites, future residential blocks, acreage, and the subdivision questions that come with them.',
      'Most of what he works on sits in Adelaide’s northern corridor, through Munno Para, Angle Vale, Kudla and Evanston Gardens. He will tell you what a site is likely to cost to make ready before you commit, and whether it is titled, because both change the numbers.'
    ]
  },
  {
    slug: 'dishant-suresh', name: 'Dishant Suresh',
    role: 'Principal and Buyers Agent',
    phone: '0434 750 000', href: '+61434750000',
    img: 'agent-dishant.webp',
    focus: 'Buying side, and the principal of the agency.',
    bio: [
      'Dishant is the principal of SA Realtors and works on the buying side.',
      'That means sitting on your side of the table rather than the seller’s: finding what fits, checking it stacks up, and saying so plainly when it does not. He would rather lose a sale than put someone in the wrong property.'
    ]
  },
  {
    slug: 'dinesh-sharma', name: 'Dinesh Sharma',
    role: 'Sales Agent',
    phone: '0411 563 330', href: '+61411563330',
    img: 'agent-dinesh-sharma.webp',
    focus: 'Residential sales across the northern suburbs.',
    bio: [
      'Dinesh looks after residential sales, mostly through Salisbury, Elizabeth and the suburbs around them.',
      'He handles the part most people find stressful: pricing a home honestly, getting it in front of the right buyers, and keeping you told what is happening rather than leaving you guessing.'
    ]
  },
  {
    slug: 'ankur-raithatha', name: 'Ankur Raithatha',
    role: 'Buyers Agent',
    phone: '0430 437 766', href: '+61430437766',
    img: 'agent-ankur.webp',
    focus: 'Buying side, securing residential and development sites.',
    bio: [
      'Ankur works on the buying side of the agency, helping clients find, analyze, and secure properties that fit their needs.',
      'He specializes in residential and future residential sites across Adelaide, ensuring that buyers have dedicated representation and clear numbers before committing to a purchase.'
    ]
  }
];

const NAV = [
  { href: 'properties.html', label: 'Properties' },
  { href: 'development-opportunities.html', label: 'Developers' },
  { href: 'agents.html', label: 'Team' },
  { href: 'about.html', label: 'About' },
  { href: 'contact.html', label: 'Contact' }
];

const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ---------- head ---------- */
function head(o) {
  return `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.desc)}">
<meta name="theme-color" content="#F1F5FA">
<link rel="canonical" href="PLACEHOLDER_LIVE_URL/${o.file}">

<!-- DEPLOY STEP: patch og:url and og:image with the live absolute URL before zipping -->
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(o.title)}">
<meta property="og:description" content="${esc(o.desc)}">
<meta property="og:url" content="PLACEHOLDER_LIVE_URL/${o.file}">
<meta property="og:image" content="PLACEHOLDER_LIVE_URL/assets/${o.ogImage || 'og-cover.jpg'}">
<meta name="twitter:card" content="summary_large_image">

<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23F1F5FA'/%3E%3Crect x='9' y='9' width='14' height='14' fill='none' stroke='%232E3192' stroke-width='2.6' transform='rotate(45 16 16)'/%3E%3Ccircle cx='16' cy='16' r='3.1' fill='%23F07C1F'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800&family=IBM+Plex+Mono:wght@500&family=Public+Sans:wght@400;500;600&display=swap">
<link rel="stylesheet" href="assets/site.css">
</head>
<body${o.bodyClass ? ' class="' + o.bodyClass + '"' : ''}>

<a class="skip" href="#main">Skip to content</a>
<div class="env" aria-hidden="true"></div>
${nav(o.file)}
<main id="main" tabindex="-1">`;
}

function nav(current) {
  const links = NAV.map(n =>
    `<li><a href="${n.href}"${n.href === current ? ' aria-current="page"' : ''}>${n.label}</a></li>`
  ).join('');
  return `<nav class="nav" id="nav">
  <a class="nav__brand" href="index.html" aria-label="SA Realtors, home">
    <img src="assets/lockup.png" alt="SA Realtors" width="200" height="46">
  </a>
  <button class="navtoggle" id="navtoggle" type="button" aria-expanded="false" aria-controls="navlinks">
    <span class="navtoggle__bars" aria-hidden="true"></span>
    <span class="vh">Menu</span>
  </button>
  <ul class="nav__links" id="navlinks">${links}</ul>
  <a class="btn btn--sm nav__cta" href="#enquire">Enquire now</a>
</nav>`;
}

function foot() {
  return `</main>

<footer class="foot">
  <div class="foot__in">
    <div class="foot__brand">
      <img src="assets/lockup.png" alt="SA Realtors" width="220" height="50" loading="lazy">
    </div>
    <div class="foot__cols">
      <div>
        <h2>Browse</h2>
        <ul>
          <li><a href="properties.html">All properties</a></li>
          <li><a href="properties-for-sale.html">For sale</a></li>
          <li><a href="properties-sold.html">Sold</a></li>
          <li><a href="development-opportunities.html">Land and development</a></li>
        </ul>
      </div>
      <div>
        <h2>Agency</h2>
        <ul>
          <li><a href="about.html">About us</a></li>
          <li><a href="agents.html">The team</a></li>
          <li><a href="contact.html">Contact</a></li>
        </ul>
      </div>
      <div>
        <h2>Office</h2>
        <p>${AGENCY.street}<br>${AGENCY.city}</p>
        <p><a href="tel:${AGENCY.phoneHref}">${AGENCY.phone}</a><br><a href="mailto:${AGENCY.email}">${AGENCY.email}</a></p>
        <p class="foot__rla">${AGENCY.rla}</p>
      </div>
    </div>
  </div>
  <div class="foot__fine">
    <p>&copy; <span id="yr">2026</span> ${AGENCY.name}. All rights reserved.</p>
    <p class="foot__disc">Aerial and location imagery is stock footage and does not depict specific listings.</p>
  </div>
</footer>

<script src="assets/site.js"></script>
</body>
</html>`;
}

/* ---------- page furniture ---------- */

/* the inner-page header: breadcrumb, kicker, big title, optional lede */
function pageHead(o) {
  const crumbs = (o.crumbs || []).map(c =>
    c.href ? `<a href="${c.href}">${esc(c.label)}</a>` : `<span aria-current="page">${esc(c.label)}</span>`
  ).join('<i aria-hidden="true">/</i>');
  const cls = o.centre ? ' phead--centre' : '';
  return `<section class="phead${cls}">
  <div class="wrap">
    <nav class="crumb" aria-label="Breadcrumb">${crumbs}</nav>
    ${o.kicker ? `<p class="kicker"><span class="pegmark" aria-hidden="true"></span>${esc(o.kicker)}</p>` : ''}
    <div class="phead__row">
      <h1>${esc(o.title)}</h1>
      ${o.lede ? `<p class="lede">${esc(o.lede)}</p>` : ''}
    </div>
  </div>
</section>`;
}

/* the reference's signature section header: headline left, short paragraph right */
function sectionHead(title, para, opts) {
  const o = opts || {};
  const cls = 'shead reveal' + (o.centre ? ' shead--centre' : '');
  return `<div class="${cls}">
  ${o.kicker ? `<p class="kicker"><span class="pegmark" aria-hidden="true"></span>${esc(o.kicker)}</p>` : ''}
  <div class="shead__row">
    <h2${o.light ? ' class="on-dark"' : ''}>${esc(title)}</h2>
    ${para ? `<p class="shead__note${o.light ? ' on-dark-soft' : ''}">${esc(para)}</p>` : ''}
  </div>
</div>`;
}

/* ---------- property helpers ---------- */

const SPEC_ICONS = {
  bed: '<path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 14h18M7 9V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/>',
  bath: '<path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM7 12V6a2 2 0 0 1 4 0"/>',
  car: '<path d="M5 16h14M6 16l1.4-5.2A2 2 0 0 1 9.3 9h5.4a2 2 0 0 1 1.9 1.4L18 16M4 16v3M20 16v3"/>',
  land: '<path d="M3 20l4-14 10 2 4 12z" stroke-dasharray="3 2"/><circle cx="12" cy="12" r="1.3"/>'
};

function spec(kind, value, label) {
  if (!value) return '';
  return `<li class="spec"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SPEC_ICONS[kind]}</svg><b>${esc(value)}</b> <span>${esc(label)}</span></li>`;
}

/* what a listing shows as its headline figure, given its status */
function priceOf(p) {
  if (p.state === 'For Sale') return { main: p.priceMain, note: '' };
  if (p.state === 'For Rent') return { main: p.priceMain, note: 'per week' };
  if (p.state === 'Leased') return { main: 'Leased', note: '' };
  if (p.land) return { main: p.land, note: 'Sold' };
  return { main: 'Sold', note: '' };
}

function tagClass(state) {
  return state === 'For Rent' ? 'ptag--rent'
    : state === 'Leased' ? 'ptag--leased'
    : state === 'For Sale' ? 'ptag--sale' : 'ptag--sold';
}

function propertyCard(p) {
  const pr = priceOf(p);
  const url = 'property-' + p.slug + '.html';
  const specs = [
    spec('bed', p.beds, p.beds === '1' ? 'bed' : 'beds'),
    spec('bath', p.baths, p.baths === '1' ? 'bath' : 'baths'),
    spec('car', p.cars, 'car'),
    (!p.beds && p.land) ? spec('land', p.land, '') : ''
  ].join('');
  return `<article class="pcard reveal" data-state="${esc(p.state)}" data-suburb="${esc(p.suburb)}" data-kind="${esc(p.kind)}">
  <a class="pcard__fig" href="${url}" tabindex="-1" aria-hidden="true">
    <img src="assets/img/${p.card}" alt="" width="800" height="533" loading="lazy" decoding="async">
    <span class="ptag ${tagClass(p.state)}">${esc(p.state)}</span>
  </a>
  <div class="pcard__body">
    <p class="pcard__price">${esc(pr.main)}${pr.note ? ` <small>${esc(pr.note)}</small>` : ''}</p>
    <h3 class="pcard__title"><a href="${url}">${esc(p.address)}</a></h3>
    <p class="pcard__sub">${esc(p.suburb)}, South Australia</p>
    ${specs ? `<ul class="pcard__specs">${specs}</ul>` : ''}
  </div>
</article>`;
}

function grid(cards, cls) {
  return `<div class="pgrid ${cls || ''}">${cards.join('\n')}</div>`;
}

/* the reference's horizontal "offers for investment" row */
function offerRow(p) {
  const url = 'property-' + p.slug + '.html';
  return `<article class="orow reveal">
  <a class="orow__fig" href="${url}" tabindex="-1" aria-hidden="true">
    <img src="assets/img/${p.card}" alt="" width="800" height="533" loading="lazy" decoding="async">
  </a>
  <div class="orow__main">
    <h3><a href="${url}">${esc(p.address)}</a></h3>
    <p>${esc(p.suburb)}, South Australia</p>
    <span class="ptag ${tagClass(p.state)}">${esc(p.state)}</span>
  </div>
  <dl class="orow__metrics">
    <div><dt>Land</dt><dd>${esc(p.land || '–')}</dd></div>
    <div><dt>Type</dt><dd>${esc(p.kind === 'land' ? 'Development site' : 'Residential')}</dd></div>
    <div><dt>Status</dt><dd>${esc(p.state)}</dd></div>
  </dl>
</article>`;
}

function agentCard(a) {
  const url = 'agent-' + a.slug + '.html';
  return `<article class="acard reveal">
  <a class="acard__fig" href="${url}" tabindex="-1" aria-hidden="true">
    <img src="assets/${a.img}" alt="" width="760" height="1000" loading="lazy" decoding="async">
  </a>
  <div class="acard__body">
    <h3><a href="${url}">${esc(a.name)}</a></h3>
    <p class="acard__role">${esc(a.role)}</p>
    <p class="acard__focus">${esc(a.focus)}</p>
    <a class="btn btn--ghost btn--sm" href="tel:${a.href}">${esc(a.phone)}</a>
  </div>
</article>`;
}

/* three stat blocks with the reference's little bar charts */
function statBlock(stats) {
  const bars = seed => {
    let s = seed, out = '';
    for (let i = 0; i < 9; i++) {
      s = (s * 1103515245 + 12345) % 2147483648;
      const h = 22 + (s % 100) * 0.62;
      out += `<rect x="${i * 11}" y="${88 - h}" width="6" height="${h}" rx="1.5"/>`;
    }
    return out;
  };
  return `<div class="stats">${stats.map((s, i) => `
  <div class="stat reveal">
    <p class="stat__n">${esc(s.n)}</p>
    <p class="stat__label">${esc(s.label)}</p>
    <svg class="stat__bars" viewBox="0 0 99 88" aria-hidden="true">${bars(i * 977 + 31)}</svg>
  </div>`).join('')}</div>`;
}

/* the dark promo card near the foot of the reference */
function promo(o) {
  return `<section class="sec sec--promo">
  <div class="promo reveal">
    <div class="promo__text">
      <p class="kicker kicker--light"><span class="pegmark" aria-hidden="true"></span>${esc(o.kicker)}</p>
      <h2>${esc(o.title)}</h2>
      <p class="promo__lede">${esc(o.lede)}</p>
      <a class="btn" href="${o.href}">${esc(o.cta)}</a>
    </div>
    <div class="promo__fig">
      <img src="assets/${o.img}" alt="" width="1500" height="844" loading="lazy" decoding="async">
      <svg class="promo__lot" viewBox="0 0 400 260" preserveAspectRatio="none" aria-hidden="true">
        <rect x="8" y="8" width="384" height="244" vector-effect="non-scaling-stroke"/>
      </svg>
    </div>
  </div>
</section>`;
}

/* the enquiry block, repeated as the single call to action */
function enquire(o) {
  const opt = (o && o.options) || [
    'A residential site', 'A future residential project', 'Not sure yet, send me what you have'
  ];
  const heading = (o && o.title) || 'Tell us what you are looking to build.';
  const lede = (o && o.lede) || 'Fill in the form and our team will contact you shortly to discuss available opportunities.';
  return `<section class="sec sec--enquire" id="enquire">
  <div class="enquire">
    <svg class="enquire__lot" viewBox="0 0 600 400" preserveAspectRatio="none" aria-hidden="true">
      <rect x="6" y="6" width="588" height="388" vector-effect="non-scaling-stroke"></rect>
    </svg>
    <div class="enquire__text">
      <p class="kicker kicker--light"><span class="pegmark" aria-hidden="true"></span>Limited projects available</p>
      <h2 class="h2 h2--light">${esc(heading)}</h2>
      <p class="lede lede--light">${esc(lede)}</p>
      <ul class="enquire__meta">
        <li><span>Office</span> ${AGENCY.street}, ${AGENCY.city}</li>
        <li><span>Phone</span> <a href="tel:${AGENCY.phoneHref}">${AGENCY.phone}</a></li>
        <li><span>Email</span> <a href="mailto:${AGENCY.email}">${AGENCY.email}</a></li>
      </ul>
    </div>

    <!-- FORM ENDPOINT: composes a Web3Forms submission. -->
    <form class="form" id="form" data-access-key="${AGENCY.web3formsKey}" novalidate>
      <div class="field">
        <label for="f-name">Your name</label>
        <input id="f-name" name="name" type="text" autocomplete="name" required>
        <p class="err" id="e-name" hidden>Please tell us your name.</p>
      </div>
      <div class="field field--half">
        <label for="f-phone">Phone</label>
        <input id="f-phone" name="phone" type="tel" autocomplete="tel" required>
        <p class="err" id="e-phone" hidden>We need a number to call you on.</p>
      </div>
      <div class="field field--half">
        <label for="f-email">Email</label>
        <input id="f-email" name="email" type="email" autocomplete="email" required>
        <p class="err" id="e-email" hidden>Please check the email address.</p>
      </div>
      <div class="field">
        <label for="f-want">What are you looking for?</label>
        <select id="f-want" name="want">${opt.map(v => `<option>${esc(v)}</option>`).join('')}</select>
      </div>
      <div class="field">
        <label for="f-note">Anything else we should know <span class="opt">(optional)</span></label>
        <textarea id="f-note" name="note" rows="3"></textarea>
      </div>
      <button class="btn btn--wide" type="submit">Send my enquiry</button>
      <p class="form__note">We will only use this to reply to you.</p>

      <div class="form__done" id="formDone" hidden role="status">
        <span class="form__tick" aria-hidden="true"></span>
        <h2>Got it. One of us will call you.</h2>
        <p id="formDoneMsg">Your email app is opening with the enquiry ready to send. Once it is sent we will be in touch shortly with what is currently available.</p>
      </div>
    </form>
  </div>
</section>`;
}

/* ---------- the quick find bar: a real way into the listings ---------- */

/* ---------- three clickable "what are you looking for" cards ---------- */
function chooseType() {
  const opts = [
    ['Land or a development site', 'From 250 square metres to 100 acres', 'development-opportunities.html',
      '<svg viewBox="0 0 40 40"><path d="M6 30 L20 12 L34 30 Z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M6 30 L34 30" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>'],
    ['Properties for sale', 'Homes ready to move into or invest in', 'properties-for-sale.html',
      '<svg viewBox="0 0 40 40"><path d="M6 20 L20 8 L34 20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/><rect x="10" y="20" width="20" height="14" fill="none" stroke="currentColor" stroke-width="2.4"/><rect x="17" y="24" width="6" height="10" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>'],
    ['Properties for rent', 'Places to lease across the northern suburbs', 'properties-for-rent.html',
      '<svg viewBox="0 0 40 40"><rect x="7" y="10" width="26" height="22" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M13 18 h14 M13 24 h10" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="27" cy="24" r="1.8" fill="currentColor"/></svg>']
  ];
  const cards = opts.map(([label, note, href, icon]) => `<a class="choose__card reveal" href="${href}">
    <span class="choose__ico" aria-hidden="true">${icon}</span>
    <span class="choose__label">${esc(label)}</span>
    <span class="choose__note">${esc(note)}</span>
    <span class="choose__go" aria-hidden="true">Show me <i></i></span>
  </a>`).join('\n');
  return `<div class="choose">
  <p class="choose__lead"><span class="pegmark" aria-hidden="true"></span>Tell us what you are looking for</p>
  <div class="choose__grid">${cards}</div>
</div>`;
}

function findBar(suburbs) {
  const opts = suburbs.map(s => '<option>' + esc(s) + '</option>').join('');
  return `<form class="find reveal" id="find" action="properties.html" method="get">
  <p class="find__lead"><span class="pegmark" aria-hidden="true"></span>Find a block</p>
  <div class="find__f">
    <label for="q-type">What are you after?</label>
    <select id="q-type" name="type">
      <option value="">Anything</option>
      <option value="land">Land or a development site</option>
      <option value="residential">A house</option>
    </select>
  </div>
  <div class="find__f">
    <label for="q-suburb">Where?</label>
    <select id="q-suburb" name="suburb">
      <option value="">Anywhere in Adelaide</option>${opts}
    </select>
  </div>
  <button class="btn" type="submit">Show me</button>
</form>`;
}

/* ---------- how it works: three steps, home page only ---------- */
function steps(list) {
  const items = list.map((s, i) => `
  <li class="step reveal" style="--i:${i}">
    <span class="step__n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
    <h3>${esc(s[0])}</h3>
    <p>${esc(s[1])}</p>
  </li>`).join('');
  return `<ol class="steps">${items}</ol>`;
}

/* ---------- a slim proof strip, not a full stats section ---------- */
function proofStrip(stats, suburbs) {
  const nums = stats.map(s =>
    `<div><dt>${esc(s.n)}</dt><dd>${esc(s.short)}</dd></div>`).join('');
  const where = suburbs.map(s =>
    `<a href="properties.html?suburb=${encodeURIComponent(s)}">${esc(s)}</a>`).join('');
  return `<div class="proof reveal">
  <dl class="proof__nums">${nums}</dl>
  <p class="proof__where"><span>Where we work</span>${where}</p>
</div>`;
}

module.exports = {
  AGENCY, AGENTS, NAV, esc,
  head, nav, foot, pageHead, sectionHead,
  propertyCard, grid, offerRow, agentCard, statBlock, promo, enquire,
  chooseType, findBar, steps, proofStrip,
  priceOf, tagClass, spec
};
