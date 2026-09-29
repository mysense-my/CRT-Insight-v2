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

1. **Where do form submissions go?** An inbox, HubSpot, a CRM? Until they say, the form only
   confirms on screen. Wiring it up is a small job once we know.
2. **The support portal URL.** The dropdown option exists and shows the helpdesk email and phone;
   there is a `TODO` comment in `index.html` where the link goes.
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
