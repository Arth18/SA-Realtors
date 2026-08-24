# SA Realtors — Design Package

Tier 1, single journey. Written before the build. Every line of copy here ships verbatim.

---

## 1. The brand premise

**The line is the whole thing.**

Land is not land until somebody draws a line around it. A surveyed boundary is what turns a paddock into a block, a block into a title, and a title into somebody's future. SA Realtors' entire job is knowing which lines are worth drawing and making sure they hold.

Every section of this page is a line being drawn: the lot boundary over the aerial, the growth line across the northern suburbs, the line between titled and untitled, the line under the contract. The signature element draws itself. The interactive moment lets the visitor draw one.

Anything that does not serve the line does not belong on the page.

---

## 2. The palette as CSS tokens

Sampled from the logo, the flyers, and the ending frame of the hero footage.

```css
:root{
  --canvas:#F1F5FA;        /* pale sky paper, pulled from the footage haze. never pure white */
  --canvas-deep:#E4EBF4;   /* the alternating band */
  --panel:#FFFFFF;         /* the flyer's white panel, cards, raised surfaces */
  --ink:#14224A;           /* primary text, the deep navy from the flyer bands */
  --ink-soft:#4C5A78;      /* secondary text */
  --brand:#2E3192;         /* the logo navy. the mark, key headings, the deep bands */
  --brand-deep:#101C3D;    /* footer and the deep navy panel */
  --accent:#B4520E;        /* orange for fills and buttons. accessible on canvas */
  --accent-ink:#A8480A;    /* orange as text. the only orange allowed on type */
  --accent-bright:#F07C1F; /* the true flyer orange. graphics and large shapes only */
  --accent-hover:#8F3C06;
  --accent-muted:rgba(240,124,31,.14);  /* borders, glows, the survey pegs at rest */
  --rule:#C9D5E6;          /* hairlines */
  --rule-strong:#8FA3C0;   /* interactive borders, must clear 3:1 */
}
```

Accent appears in rare doses only: the call to action, focus states, the survey boundary, and the live lot readout. Nowhere else.

## 3. The type trio

| Role | Face | Weights |
|---|---|---|
| Display | **Archivo** (variable, width axis 100–108) | 700, 800 |
| Body | **Public Sans** | 400, 500, 600 |
| Mono | **IBM Plex Mono** | 500 |

Archivo carries the flyers' heavy confident sans without being Oswald or Anton. Public Sans is quiet, institutional and signals trust. IBM Plex Mono has an engineering feel, which is exactly right for a page about measured land — it carries every square metre, frontage and lot number on the page.

The serif in the logo lockup stays in the logo and nowhere else.

---

## 4. The band map

Hero height **500vh** on desktop, **260vh** on phones. Video 6.6s. The starting ranges were 400vh with bands of 0.20 to 0.22; the flick test measured only 4 full steps on bands 1 and 3 against a floor of 5, so the hero was lengthened and the ranges rebalanced to the values below. Re-measured: 6, 5, 5 and 9 full steps at 120px, and no beat skippable at 360px.

| Band | Range | Footage moment | Copy (verbatim) | Entrance |
|---|---|---|---|---|
| 1 | 0.00 → 0.22 | Wide over the estate, clean sky filling the top half | "Every block starts as a line on a map." | Grid snap-align, characters slide into place in reading order, echoing a boundary being set out |
| 2 | 0.26 → 0.48 | Camera glides forward, rooftops tracking past | "We find the ones worth drawing." | Drift-down, words settle from above like a pin dropping |
| 3 | 0.52 → 0.74 | Paddocks and the open plain enter frame past the last row of houses | "North of Adelaide, they are still being drawn." | Halves parting, the line opens outward from the centre |
| 4 | 0.79 → 1.00 | The glide decelerates and rests on the wide estate view | H1 "Your land. Your future."<br>Sub "Residential and future residential sites across Adelaide, from 700 square metres to ten acres."<br>CTA "See what is available" | Word-by-word rise into a staged settle. Headline words rise, subline fades at k 0.66, CTA row at k 0.78 |

Band 1 skips the opacity ease-in and gets the one-time load ramp. Band 4 skips the ease-out.

**Legibility is inverted from the standard, and this is a deliberate deviation.** The footage is bright and high key and the theme is light, so the hero runs **navy type on a lifted sky**, not white type on a dark scrim. Each band's scrim is a soft **white** radial that lifts its region toward the paper colour, and the contrast target is unchanged: worst-pixel 3.5:1 minimum, measured against the busiest frame of each band, with `--ink` as the text colour. Bands 1 to 3 sit in the sky lane, which is the calmest region of every frame. Band 4 sits in a white panel, so its contrast is absolute.

Text shadow is replaced by a soft white halo token for the same reason:
`--tshadow:0 1px 2px rgba(255,255,255,.9),0 3px 14px rgba(241,245,250,.75),0 10px 44px rgba(241,245,250,.6)`

## 5. The compact-hero copy block

**Changed by the client on 2026-08-20: phones keep the scroll video.** The four device conditions now only change the LAYOUT, to a wide aerial band with the panel beneath it, because a 16:9 shot cropped to a tall screen is mostly empty sky. The video still scrubs with scroll inside that band, over a shorter 260vh run. Reduced motion is the one condition that drops the video entirely. The SVG boundary anchor is switched to xMaxYMid in the compact layout so it matches the video crop exactly.

For the compact layout and reduced motion. Composed over the ending frame with the white panel.

- **Headline:** Your land. Your future.
- **Subline:** Residential and future residential sites across Adelaide, from 700 square metres to ten acres.
- **CTA:** See what is available

---

## 6. The below-fold outline

Every section funnels to one anchor: **`#enquire`**, the enquiry form.

### 6.1 The offer
Lifted from the developer flyer, which is already the right pitch.

- Kicker: `LIMITED PROJECTS AVAILABLE`
- Headline: **Are you a property developer looking for your next residential project?**
- Body: We have multiple development opportunities available right now, from small residential sites at 700 square metres through to ten acre future residential projects.
- Three badges, navy circles with orange marks, all three treated identically:
  1. **Residential and future residential land**
  2. **Multiple project sizes available**
  3. **Suitable for developers and investors**
- Link: Fill in the enquiry form → `#enquire`

### 6.2 Survey a block — THE INTERACTIVE MOMENT
Sits on the straight-down aerial of empty subdivided blocks.

- Kicker: `HOLD TO SURVEY`
- Headline: **This is what we do all day.**
- Body: Press and hold anywhere on the block. That is the whole job, finding the line worth drawing and making sure it holds.
- The hold: the dashed boundary draws around the block edge by edge, four corner pegs drop in, and a mono readout counts up to the lot data. Release early and it eases back down, never snaps. Completing it reveals the three site-size cards in sequence.
- Readout copy (mono): `AREA 700m² – 10 ACRES` / `ZONING RESIDENTIAL & FUTURE RESIDENTIAL` / `STATUS AVAILABLE NOW`
- Reduced motion gets the finished state immediately, no hold required.

### 6.3 Why the north
**No published figures on the page, by the client's decision.** The case is made qualitatively instead, so nothing on the site can go stale or be argued with.

- Kicker: `THE NORTHERN CORRIDOR`
- Headline: **Why we keep looking north.**
- Body: The northern corridor is where Adelaide still has room. Estates are releasing in stages, the infrastructure is already in the ground, and rentals up here do not sit empty for long. That is why most of what we have is north.
- Four points, all four treated identically, each on a corner peg marker:
  1. **The infrastructure is already there.** Hospital, schools, shopping centres, the northern expressway and the rail line. Built, not promised.
  2. **Land is still releasing.** New stages keep coming out of Munno Para, Angle Vale, Kudla and Evanston Gardens.
  3. **Rentals do not sit empty.** Demand across these suburbs has stayed tight, which matters if you plan to hold.
  4. **There is room to build.** Sites up here still come in sizes you can actually develop, not just buy.
- Closing line: Ask us for the current numbers on any suburb and we will send them.

### 6.4 The four reasons
Their own flyer's value props, kept word for word.

**High growth area** · **Strong rental returns** · **Future development potential** · **Secure long term investment**

Each gets one plain sentence underneath. All four styled identically.

### 6.5 What stops people
The objections from the research, in the buyers' own words, answered straight.

- **"The advertised price is never the final price."**
  True, and it is usually site costs that do it. Earthworks, service connections, fencing, driveways and landscaping sit outside most advertised prices. We tell you what a site is likely to cost to make ready before you commit, not after.
- **"Is it titled or untitled?"**
  We tell you on every site, in writing. It matters, because you cannot settle your loan or start building on untitled land, and titles slip on weather and council timing. If a site is untitled we tell you the expected date and what happens if it moves.
- **"Is Adelaide still a buy after the boom?"**
  Honestly, the easy money has been made. What is left in the north is growth backed by real infrastructure and vacancy rates under one per cent. That is a different case from a boom, and it is the one we will make to you with numbers.
- **"How do I know the site actually stacks up?"**
  Ask us for the numbers on any site and we will send them. If a site does not work for what you want to build, we will tell you that too.

### 6.6 The people
Trust furniture. Both portraits, treated identically.

- Kicker: `A NAME YOU CAN TRUST`
- Headline: **You will be dealing with these two.**
- **Nayan Darji** — Director and Property Advisor — 0410 708 765
- **Dishant Suresh** — Principal and Buyers Agent — 0434 750 000
- Body: We are a small Adelaide agency and you get one of us on the phone, not a queue. Office at 380 Payneham Road, Payneham. RLA 344822.

### 6.7 The enquiry form — THE ONE CALL TO ACTION
`id="enquire"`. Matches the flyer's own wording.

- Kicker: `LIMITED PROJECTS AVAILABLE`
- Headline: **Tell us what you are looking to build.**
- Body: Fill in the form and our team will contact you shortly to discuss available opportunities.
- Fields: `Your name` · `Phone` · `Email` · `What are you looking for?` (select: A residential site · A future residential project · Not sure yet, send me what you have) · `Anything else we should know` (optional)
- Button: **Send my enquiry**
- Success state: **Got it. One of us will call you.** We have your enquiry and will be in touch shortly with what is currently available.
- **Handling: settled at deploy, not at build.** The agency already has Namecheap PrivateEmail on `contact@sarealtors.com.au` and their own hosting, so the target answer is a small mail handler on that hosting posting straight to their inbox, with no third party and no monthly cap. Until hosting is connected the form falls back to a composed mailto so the button is never dead, and the success state says exactly which of the two is live. Mark the swap point with `<!-- FORM ENDPOINT -->`.

### 6.8 Footer
- Logo lockup, address, phone, email, RLA 344822.
- Honest imagery line, small: `Aerial and location imagery is stock footage and does not depict specific listings.`
- The brand is real, so there is no fictional-brand disclosure.

---

## 7. The vector layer plan

Everything below is drawn by hand in SVG. All of it honours reduced motion by showing its final state with the drives stopped.

- **The survey boundary (THE SIGNATURE).** A dashed navy-and-orange lot boundary with square corner pegs. It appears three times, and its absence would gut the page: drawing itself over the hero's ending frame at the settle, drawn by the visitor in the hold moment, and as a quiet framing device around the enquiry form. `stroke-dasharray` and `stroke-dashoffset` driven by scroll progress.
- **The corner peg.** A small rotated square with a centre dot, the surveyor's mark. Used as the bullet, the list marker, and the section divider. It is the page's punctuation.
- **The contour rule.** A single hairline that follows a gentle contour, dividing sections, drawing itself as each section enters.
- **The swoosh.** The curve from the logo, enlarged as the section transition from white panel to navy band, matching the developer flyer's teardrop divide.
- **Whisper particles.** Very slow drifting dust motes in the hero's sky lane only, at 4 per cent opacity, 60 second cycles, negative delays, paused off-screen and on hidden tabs.
- **The fixed environment layer.** One page-wide soft sky gradient that drifts over 90 seconds behind everything, so scrolling feels like moving through one place.

---

## 8. The engineering list

The build owes all of it, no half-remembering:

Blob fetch of the hero video (under 8MB, plain form, poster painted first). dt-normalized lerp in a rAF loop that rests when converged and when the hero is off-screen. Gated seeks with the deadlock escape on `error`. Delta-gated DOM writes, 10Hz throttle on the mono readouts. Band pacing in scroll distance with the flick test at 120, 240 and 360px. The four-layer legibility system, inverted to light. The five static-hero gates, character-identical in CSS and JS, armed and disarmed from change listeners. Complete and beautiful without the video. Reduced motion honoured live in both directions. `overflow-x: clip` on html and body with `hidden` first. Entrances prefixed with the container class and stagger delays retired afterwards. Animate transform and opacity only. Real contrast computed, not guessed. Semantic landmarks, skip link, `aria-hidden` on the video and every decoration, `:focus-visible` in the accent, 44px touch targets under coarse pointer. Inline SVG favicon of the corner peg. og tags left with a `<!-- DEPLOY STEP -->` marker.

---

## 9. The copy gate

Every viewer-facing line above ships verbatim. The built page must pass the Phase 9 grep gate before anyone sees it: zero em dashes, zero instances of leverage, seamless, empower, unlock, robust, actionable, data-driven or solutions, plus the body sweep for "not just X, it's Y", false ranges, vague attributions, generic big finishes, and the words testament, landscape, delve and elevate.

Deliberate brand devices stay: **BUILD · DEVELOP · INVEST · GROW** is theirs and ships as written. "Your land. Your future." is theirs. The repeated line motif is designed, not drift.
