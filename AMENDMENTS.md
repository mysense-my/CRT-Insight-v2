# Client feedback, round 1 — what changed

Client comments dated 23 Sep 2026. This file tracks what is done in the code and what is still
waiting on CRT.

## Done

**1. Headline no longer says "ERP" only.**
One word swaps in place every 2.6 seconds — e-Invoicing → ERP → WMS → ESG — inside the fixed line
"…, implemented and supported in Malaysia and Singapore". The line around it is written for search
(the four product terms plus both countries) rather than for one product. Screen readers get the
full sentence from the `aria-label`; the animation is hidden from them.
`index.html` hero, `.rotator`; `css/style.css` `.rotator` / `.rot-word`; `js/main.js` block 3.

**2. The self-typing panel now answers itself.**
It types a question, highlights the matching topic chip, lights and presses Send, thinks with three
dots, then writes an answer and two data rows, clears, and moves to the next question. Three
questions cycle: LHDN validation, reorder points, receivables.
`js/main.js` block 4, `SCRIPT` array — questions and answers are all edited in one place there.

**3. The panel moved to the right of the hero.**
The hero is now two columns: copy on the left, the typing panel on the right sitting over an app
window with a chart. That fills the empty right-hand side and removes about 500px of page height.
On a phone the window stacks above the panel with its sidebar hidden.

**4. Industries rebuilt from Site 3, photos always on.**
New standalone `#industries` section: six square photo cards on a swipeable rail with arrows,
three visible at a time on a laptop, one and a bit on a phone. The photo is permanent — no hover
reveal — with a white fade at the bottom so the text sits on white rather than on the picture.

**5. One form, and every button leads to it.**
New `#contact` section replacing the old closing call to action. A "What do you need?" dropdown
offers **Book a consultation**, **Support portal, I am an existing customer**, and **Something
else**. Picking the support option reveals the helpdesk email and phone.
**Nothing is sent.** Submitting shows an on-screen note saying so. See "Waiting on CRT" below.
Buttons now pointing at the form: the top bar, the phone menu, the hero, the FAQ panel, and every
industry card.

**6. Full-width hover menu in the header.**
Hovering anywhere over the nav expands the bar into a full-width panel showing the whole site at
once — Solutions, Products, Services, Industries and a contact card. The item under the cursor
stays lit and the rest dim. Keyboard users get it on focus, Escape closes it. Below 1200px the
burger menu takes over as before and the panel is switched off.

**7. "Book a Demo" is now "Book a Consultation"** in the top bar and the phone menu.

**8. "20 Years of Excellence" is gone.** The hero pill reads "In Malaysia and Singapore since
2006". The award card now reads "Anniversary dinner, 2026".

**9. Integrations stopped moving.** Two still, centred rows of tiles. The partner logo strip near
the top of the page still moves — CRT only asked for the integrations section.

**10. "How we work", horizontal.** New `#process` section: the four stages from Site 1 left to
right on one line with a connecting rail, each with a photo, so the whole process reads in one
glance. This replaced the old "Get started in three simple steps" section, which said much the
same thing — that alone took a section off the page.

**11. The staff photo is gone.** The demo video poster is now CRT's booth with Acumatica at SCLS
Malaysia 2025 (`assets/img/event-poster.jpg`), cropped to 16:9 from `ev-scls-booth.jpg`.

**12. The page is shorter.** On a laptop 12,024px → 11,881px and on a phone 13,917px → 12,647px,
*after* adding a photo industries section and a contact form. What did it: the hero panel moved up
beside the copy, the three-steps section was replaced rather than added to, section padding came
down from 100px to 78px, the product cards are shorter, and on a phone the four Solutions panels
became one swipeable row instead of four stacked ones.

**13. Phone fixes.**
- The typing panel and its window are visible on a phone now. They used to be switched off below
  810px, so the thing the client liked most was missing.
- "AI Automation" ran off both edges. It now fits.
- The Services window was shrunk to 29% and unreadable. It now renders at 66% and swipes sideways.
- Checked at 320, 390, 768, 1024, 1280 and 1440px: no sideways scrolling anywhere, no console
  errors.

## Waiting on CRT

1. ~~Where do form submissions go?~~ Not needed for a mockup. The form shows a proper sent
   state instead, and we wire up a destination when the site is actually built.
2. ~~The support portal URL.~~ There is no external portal to link to. Picking "Support portal"
   turns the form into a support ticket (which system, how urgent, what is happening) with the
   helpdesk email and phone alongside it. A dedicated support page is a separate build.
3. **Industry photos.** The six are free stock from Burst by Shopify (commercial use, no
   attribution). Three came from Site 3, three are new. If CRT has their own, swap them in —
   `assets/img/ind-*.jpg`, square, 900×900.
4. **"How we work" photos.** Also Burst stock, generic office scenes chosen so they don't read as
   CRT staff. `assets/img/how-*.jpg`, 16:9, 720×405.
5. **What goes in each dropdown column?** The mechanism is built and filled with the sections that
   exist today. Real menu items go in `.mega-in` once the 15-page sitemap is agreed.
6. **Industry copy** for Engineering, Life Sciences and Property Management is written by us as
   generic capability statements. Site 3 only had the names. CRT should confirm the wording.
7. **Button destinations.** Still a one-page mockup, so everything jumps within the page. That
   resolves itself when the inner pages exist.


---

# Round 2 — 29 Sep 2026

**Scroll jank at Solutions — found and fixed.** The horizontal scrollers (Solutions, Industries,
Services window, process strip) carried `data-lenis-prevent`, which tells the smooth-scroll library
to ignore the mouse wheel over that element. Wheeling over the Solutions section fell back to the
browser's own scrolling while Lenis was still animating, and the two fought each other — that was
the snapping and breaking. They now carry `data-lenis-prevent-touch` instead: the wheel stays with
Lenis, and only touch swipes are left to the browser so the rails still pan sideways on a phone.

**Headline rewritten and typed out.** It now reads "We do **ERP** best in Malaysia and Singapore",
and the keyword is rubbed out letter by letter and retyped — e-Invoicing → ERP → WMS → ESG — with a
blinking caret. `js/main.js` block 3.

**Hero scales with the screen.** The page container grows from 1240px to 1400px on wide monitors
(the nav follows it), the headline is `clamp(40px, 4.5vw, 66px)`, and the right-hand column is
`clamp(430px, 46%, 700px)` so the panel gets bigger on a large display instead of staying fixed.
Inside the stage, one variable `--pt` drives the app window height, the prompt position and the
stage height together, so the whole thing scales as one piece.

**Hero height.** `min-height: min(100dvh, 1000px)` with the content vertically centred, and a
bottom padding of `clamp(48px, 7vh, 88px)`. The answer bubble now clears the bottom edge by 56–119px
at every width tested.

**"AI Automation" on a phone** is one line again and the blue sphere is hidden there.

**Products stack on phones and tablets now.** The cards were only sticky above 1200px; the stacking
scale-back runs at every width, gentler on small screens (20% instead of 40%), and the scroll
distance is measured per card instead of a fixed 770px.

**"How we work" rebuilt with Site 1's scroll effect.** A horizontal stepper across the top keeps all
four stages visible at once — that was the client's "one glance" ask — and below it the media panel
sticks while you read, cross-fading between the four photos as each stage becomes active; inactive
stages dim. On a phone the photo is dropped and the progress bar itself pins under the header instead, so you
watch the dots fill and the stages light up one by one as you scroll the list. Captions sit under
the photo, never on it. (The first attempt kept the photo pinned on mobile and the step text
painted over it — the pinned bar reads far better in the space available.)

**Mobile menu redesigned.** Opening the burger now fills the screen edge to edge: CRT logo and a
close X in the header, Solutions / Products / Services / Industries as accordion rows that open one
at a time, Events and FAQ as plain rows, and a full-width "Book a Consultation" with the email and
WhatsApp links pinned to the bottom. Page scrolling locks while it is open.

**Length.** Laptop 12,433px, phone 13,249px. Phone is still below where it started (13,917px);
the laptop figure is a little above its 12,024px starting point because the rebuilt "How we work"
costs about 490px and the hero now fills the viewport on purpose. If the client still finds it long,
the next candidates are the Products stack (2,055px) and the Solutions bento (1,403px).

Checked at 320, 390, 768, 1024, 1280, 1440 and 1920px: no sideways scrolling, no console errors, no
dead anchor links.

**Mobile "How we work", second pass.** The pinned photo was being overlapped by the step text, so
on phones the photo is gone and the progress bar is what sticks (`top:76px`, tucked under the nav
pill). The stages scroll under it and light one at a time. The "which stage am I on" threshold is
200px from the top on phones instead of mid-screen, because the bar sits near the top. Desktop is
unchanged: two columns, photo panel still sticky and cross-fading. Phone length 13,249px → 13,067px.

**Round 3 — the form is the support portal.** The two open questions on the form are closed: this
is a mockup, so it does not need a submission destination, and the support portal is something we
build rather than a link CRT hands over. Picking "Support portal" now switches the same form into a
support ticket: the message label becomes "What is happening?", two extra fields appear (which
system, how urgent), the button becomes "Raise a support ticket", and the helpdesk email and phone
sit above it. Submitting any of the three modes swaps the card for a tick and a confirmation,
worded per mode, with a "Send another" button. No invented response times.

**Bug found while testing:** `hidden` was doing nothing on `.cform`, `.field` and `.answer` because
our own `display:grid` / `display:flex` rules beat the browser's `[hidden]` default. The support
fields and the sent panel were visible all the time. Fixed with `[hidden]{ display:none !important }`
in the reset. That also means the hero answer bubble is genuinely out of the layout when hidden now,
which is checked and still animating correctly.

Re-checked at 320, 390, 768, 1024, 1280, 1440 and 1920px: no sideways scrolling, no console errors,
no dead anchor links.
