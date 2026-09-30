/* CRT Insights — homepage v2 (FusionAI layout) interactions */
(function(){
"use strict";

const root    = document.documentElement;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/* ---------------------------------------------------------- *
 * 1. Split headings into words / characters for the blur-up
 *    reveal (the template's text effect)
 * ---------------------------------------------------------- */
$$(".reveal[data-split]").forEach(el=>{
  const text = el.textContent.trim().replace(/\s+/g, " ");
  const byChar = el.dataset.split === "chars";
  const base = el.closest(".hero") ? (byChar ? .55 : .15) : 0;
  const step = byChar ? .006 : .08;
  el.setAttribute("aria-label", text);
  el.textContent = "";
  let n = 0;
  text.split(" ").forEach((word, wi, all)=>{
    const wrap = document.createElement("span");
    wrap.setAttribute("aria-hidden", "true");
    if(byChar){
      wrap.className = "wd";
      [...word].forEach(ch=>{
        const s = document.createElement("span");
        s.className = "ch"; s.textContent = ch;
        s.style.setProperty("--d", (base + n++ * step).toFixed(3) + "s");
        wrap.appendChild(s);
      });
    }else{
      wrap.className = "w"; wrap.textContent = word;
      wrap.style.setProperty("--d", (base + wi * step).toFixed(3) + "s");
    }
    el.appendChild(wrap);
    if(wi < all.length - 1) el.appendChild(document.createTextNode(" "));
  });
});

/* ---------------------------------------------------------- *
 * 2. Hero entrance
 * ---------------------------------------------------------- */
let started = false;
const startIntro = ()=>{
  if(started) return;
  started = true;
  void document.body.offsetWidth;
  root.classList.add("loaded");
  $$(".hero .reveal").forEach(el => el.classList.add("go"));
};
const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
Promise.race([fontsReady, new Promise(r => setTimeout(r, 900))]).then(()=>{
  requestAnimationFrame(()=> requestAnimationFrame(startIntro));
  setTimeout(startIntro, 250);
});

/* ---------------------------------------------------------- *
 * 3. Headline keyword, typed out one letter at a time
 * ---------------------------------------------------------- */
const tw = $(".tw");
if(tw){
  const word  = $(".tw-word", tw);
  const caret = $(".tw-caret", tw);
  const WORDS = ["e-Invoicing", "ERP", "WMS", "ESG"];
  const wait  = ms => new Promise(r => setTimeout(r, ms));
  if(reduced){
    word.textContent = WORDS[0];
  }else{
    caret.classList.add("blink");
    (async ()=>{
      await wait(1900);
      let i = 0;
      for(;;){
        const from = WORDS[i];
        i = (i + 1) % WORDS.length;
        const to = WORDS[i];
        caret.classList.remove("blink");
        for(let n = from.length; n >= 0; n--){       // rub the old word out
          word.textContent = from.slice(0, n);
          await wait(38);
        }
        await wait(260);
        for(let n = 1; n <= to.length; n++){         // type the new one
          word.textContent = to.slice(0, n);
          await wait(72 + Math.random() * 60);
        }
        caret.classList.add("blink");
        await wait(2200);
      }
    })();
  }
}

/* ---------------------------------------------------------- *
 * 4. Hero prompt: types a question, sends it, answers, repeats
 * ---------------------------------------------------------- */
const promptWrap = $(".prompt-wrap");
if(promptWrap){
  const typed  = $(".typed", promptWrap);
  const send   = $(".send", promptWrap);
  const chips  = $$(".chip", promptWrap);
  const answer = $(".answer", promptWrap);
  const line   = $(".answer-line", promptWrap);
  const rows   = $(".answer-rows", promptWrap);
  const SCRIPT = [
    { chip:2, q:"Show invoices waiting for LHDN validation",
      a:"Three invoices are still with LHDN. The rest cleared this week.",
      rows:[["Awaiting validation", "3 invoices"], ["Validated this week", "139 invoices"]] },
    { chip:1, q:"Which items are below their reorder point?",
      a:"Twelve items are below reorder point. A purchase order is drafted for your approval.",
      rows:[["Below reorder point", "12 items"], ["Draft purchase order", "Ready to approve"]] },
    { chip:0, q:"Summarise this month's receivables",
      a:"Receivables stand at RM 1.12M, collected in 31 days on average.",
      rows:[["Outstanding", "RM 1.12M"], ["Average days to collect", "31 days"]] }
  ];
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const fill = (step)=>{
    line.textContent = step.a;
    rows.innerHTML = "";
    step.rows.forEach(([k, v])=>{
      const row = document.createElement("div");
      row.className = "answer-row";
      row.innerHTML = "<span></span><b></b>";
      row.firstChild.textContent = k;
      row.lastChild.textContent = v;
      rows.appendChild(row);
    });
  };

  if(reduced){
    typed.textContent = SCRIPT[0].q;
    chips[SCRIPT[0].chip].classList.add("is-on");
    answer.hidden = false; answer.classList.add("show", "done");
    fill(SCRIPT[0]);
  }else{
    let visible = true;
    if("IntersectionObserver" in window){
      new IntersectionObserver(es => es.forEach(e => visible = e.isIntersecting), { threshold:0 })
        .observe(promptWrap);
    }
    (async ()=>{
      await sleep(2400);
      for(let i = 0; ; i = (i + 1) % SCRIPT.length){
        while(!visible) await sleep(400);
        const step = SCRIPT[i];
        chips.forEach((c, k) => c.classList.toggle("is-on", k === step.chip));
        for(let n = 1; n <= step.q.length; n++){
          typed.textContent = step.q.slice(0, n);
          await sleep(38 + Math.random() * 45);
        }
        await sleep(600);
        send.classList.add("is-armed");
        await sleep(450);
        send.classList.add("is-press");
        await sleep(220);
        send.classList.remove("is-press");
        answer.hidden = false;
        await sleep(40);
        answer.classList.add("show");
        await sleep(1100);
        fill(step);
        answer.classList.add("done");
        await sleep(3600);
        answer.classList.remove("show");
        send.classList.remove("is-armed");
        await sleep(520);
        answer.hidden = true;
        answer.classList.remove("done");
        line.textContent = ""; rows.innerHTML = "";
        for(let n = step.q.length; n >= 0; n--){
          typed.textContent = step.q.slice(0, n);
          await sleep(12);
        }
        chips.forEach(c => c.classList.remove("is-on"));
        await sleep(400);
      }
    })();
  }
}

/* ---------------------------------------------------------- *
 * 5. Smooth scrolling
 * ---------------------------------------------------------- */
let lenis = null;
if(!reduced && typeof Lenis === "function"){
  lenis = new Lenis({ lerp:.075, wheelMultiplier:.95, smoothWheel:true });
  requestAnimationFrame(function raf(t){ lenis.raf(t); requestAnimationFrame(raf); });
}

/* ---------------------------------------------------------- *
 * 6. Tickers — each set is cloned until the row is covered,
 *    then the track moves exactly one set per cycle
 * ---------------------------------------------------------- */
const tickers = $$(".ticker");
tickers.forEach(t=>{
  const track = $(".ticker-track", t);
  const originals = [...track.children];
  const approx = Math.max(1, track.scrollWidth);
  const copies = Math.max(1, Math.ceil(2600 / approx));
  for(let c = 0; c < copies; c++){
    originals.forEach(node=>{
      const d = node.cloneNode(true);
      d.classList.add("dup");
      d.setAttribute("aria-hidden", "true");
      track.appendChild(d);
    });
  }
  t._first = originals[0];
  t._firstDup = track.children[originals.length];
});
function measureTickers(){
  tickers.forEach(t=>{
    if(!t._firstDup) return;
    const period = t._firstDup.offsetLeft - t._first.offsetLeft;
    if(period <= 0) return;
    const track = $(".ticker-track", t);
    track.style.setProperty("--shift", -period + "px");
    track.style.setProperty("--dur", (period / (parseFloat(t.dataset.speed) || 40)).toFixed(2) + "s");
  });
}
measureTickers();
addEventListener("load", measureTickers);
addEventListener("resize", measureTickers);

/* ---------------------------------------------------------- *
 * 7. Product windows keep their desktop layout and scale down
 *    as one piece on narrower screens
 * ---------------------------------------------------------- */
const fits = $$(".fit");
function fitAll(){
  fits.forEach(el=>{
    const box = el.parentElement;
    // data-minw keeps a window readable on a phone; the box scrolls sideways instead
    const avail = Math.max(box.clientWidth, parseFloat(el.dataset.minw) || 0);
    if(!avail) return;
    const w = parseFloat(el.dataset.w) || 1240;
    const s = Math.min(1, avail / w);
    el.style.width = w + "px";
    el.style.scale = s < 1 ? String(s) : "";
    box.style.height = (el.offsetHeight * s) + "px";
  });
}
fitAll();
addEventListener("resize", fitAll);
fontsReady.then(fitAll);

/* ---------------------------------------------------------- *
 * 8. Reveal on view
 * ---------------------------------------------------------- */
if(reduced || !("IntersectionObserver" in window)){
  $$(".rv").forEach(el => el.classList.add("in"));
  $$(".reveal").forEach(el => el.classList.add("go"));
}else{
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const el = e.target;
      if(el.classList.contains("rv")) el.classList.add("in");
      if(el.classList.contains("reveal")) el.classList.add("go");
      io.unobserve(el);
    });
  }, { rootMargin:"0px 0px -12% 0px" });
  $$(".rv, .reveal:not(.hero .reveal)").forEach(el => io.observe(el));
}

/* ---------------------------------------------------------- *
 * 9. Scroll-linked: "Automation" rises into place, and each
 *    product card eases back as the next one covers it
 * ---------------------------------------------------------- */
const grad  = $(".ai-title .grad");
const title = $(".ai-title");
const stack = $(".stack");
const cards = $$(".scard");
let cardTops = [];

function measureStack(){
  if(!stack) return;
  const top = stack.getBoundingClientRect().top + scrollY;
  let acc = top;
  cardTops = cards.map(c=>{
    const t = acc;
    acc += c.offsetHeight + (parseFloat(getComputedStyle(c).marginBottom) || 0);
    return t;
  });
}
/* "How we work": the media panel follows the step you are reading */
const hwSteps  = $$(".hw-step");
const hwSlides = $$(".hw-slide");
const hwNodes  = $$(".hw-node");
const hwFill   = $(".hw-fill");
function updateHow(){
  if(hwSteps.length < 2) return;
  // on a phone the progress bar is pinned near the top, so the step that counts
  // as "current" is the one just below it, not the one at mid-screen
  const mid = innerWidth < 810 ? 200 : innerHeight * .52;
  let active = 0;
  hwSteps.forEach((st, i)=>{ if(st.getBoundingClientRect().top < mid) active = i; });
  hwSteps.forEach((st, i)=> st.classList.toggle("dim", i !== active));
  hwSlides.forEach((sl, i)=> sl.classList.toggle("on", i === active));
  hwNodes.forEach((n, i)=> n.classList.toggle("on", i <= active));
  if(hwFill) hwFill.style.width = (active / (hwSteps.length - 1) * 100) + "%";
}

function onScroll(){
  updateHow();
  if(grad && !reduced){
    const vh = innerHeight;
    const r = title.getBoundingClientRect();
    const start = vh * 1.12, end = vh * .245;
    const p = clamp((start - r.top) / (start - end));
    const dist = innerWidth < 810 ? 70 : innerWidth < 1200 ? 130 : 200;
    grad.style.transform = "translate3d(0," + ((1 - p) * dist).toFixed(1) + "px,0)";
  }
  if(cards.length && !reduced){
    // how far back a card falls: gentler on small screens
    const amt = innerWidth < 810 ? .2 : innerWidth < 1200 ? .3 : .4;
    cards.forEach((c, i)=>{
      if(i === cards.length - 1){ c.style.transform = ""; return; }
      const span = (cardTops[i + 1] - cardTops[i]) || 770;
      const p = clamp((scrollY - (cardTops[i] - 25)) / span);
      const e = -(Math.cos(Math.PI * p) - 1) / 2;
      c.style.transform = p > 0 ? "perspective(1200px) scale(" + (1 - amt * e).toFixed(4) + ")" : "";
    });
  }
}
measureStack();
updateHow();
if(lenis) lenis.on("scroll", onScroll);
else addEventListener("scroll", onScroll, { passive:true });
addEventListener("resize", ()=>{ measureStack(); onScroll(); });
addEventListener("load", ()=>{ fitAll(); measureStack(); onScroll(); });
onScroll();

/* ---------------------------------------------------------- *
 * 10. Services panels rotate every 7s with a progress bar
 * ---------------------------------------------------------- */
const arts = $$(".tab-art");
const bars = $$(".tab-bars button");
const cols = $$(".tab-col");
if(arts.length){
  const DUR = 7000;
  let cur = 0, t0 = performance.now(), visible = false;
  const setTab = (i)=>{
    cur = i; t0 = performance.now();
    arts.forEach((a, k) => a.classList.toggle("on", k === i));
    cols.forEach((c, k) => c.classList.toggle("on", k === i));
    bars.forEach((b, k)=>{
      b.classList.toggle("on", k === i);
      b.setAttribute("aria-selected", String(k === i));
      b.firstElementChild.style.width = "0%";
    });
  };
  bars.forEach((b, k) => b.addEventListener("click", ()=> setTab(k)));
  cols.forEach((c, k) => c.addEventListener("click", ()=> setTab(k)));
  if("IntersectionObserver" in window){
    new IntersectionObserver(es => es.forEach(e=>{
      visible = e.isIntersecting;
      if(visible) t0 = performance.now() - (parseFloat(bars[cur].firstElementChild.style.width) || 0) / 100 * DUR;
    }), { threshold:.2 }).observe($(".tabs-panel"));
  }else visible = true;
  if(!reduced){
    requestAnimationFrame(function loop(now){
      if(visible){
        const p = Math.min(1, (now - t0) / DUR);
        bars[cur].firstElementChild.style.width = (p * 100).toFixed(2) + "%";
        if(p >= 1) setTab((cur + 1) % arts.length);
      }
      requestAnimationFrame(loop);
    });
  }
}

/* ---------------------------------------------------------- *
 * 11. Stories: a swipe row with dots on phones
 * ---------------------------------------------------------- */
const storyRow  = $(".story-ticker");
const storyDots = $(".story-dots");
if(storyRow && storyDots){
  const stories = $$(".story:not(.dup)", storyRow);
  stories.forEach(()=> storyDots.appendChild(document.createElement("i")));
  const dots = [...storyDots.children];
  const sync = ()=>{
    const mid = storyRow.scrollLeft + storyRow.clientWidth / 2;
    let best = 0, bestD = Infinity;
    stories.forEach((s, i)=>{
      const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - mid);
      if(d < bestD){ bestD = d; best = i; }
    });
    dots.forEach((d, i) => d.classList.toggle("on", i === best));
  };
  storyRow.addEventListener("scroll", sync, { passive:true });
  sync();
}

/* ---------------------------------------------------------- *
 * 12. FAQ — one answer open at a time
 * ---------------------------------------------------------- */
const qas = $$(".qa");
const setQa = (qa, open)=>{
  const btn = $("button", qa), ans = $(".ans", qa);
  if(qa.classList.contains("open") === open) return;
  btn.setAttribute("aria-expanded", String(open));
  if(reduced){ qa.classList.toggle("open", open); return; }
  if(open){
    ans.style.height = "0px";
    qa.classList.add("open");
    ans.style.height = ans.scrollHeight + "px";
  }else{
    ans.style.height = ans.scrollHeight + "px";
    void ans.offsetHeight;
    qa.classList.remove("open");
    ans.style.height = "0px";
  }
};
qas.forEach((qa, i)=>{
  const btn = $("button", qa), ans = $(".ans", qa);
  ans.id = "faq-answer-" + i;
  btn.setAttribute("aria-controls", ans.id);
  ans.addEventListener("transitionend", e=>{ if(e.propertyName === "height") ans.style.height = ""; });
  btn.addEventListener("click", ()=>{
    const open = !qa.classList.contains("open");
    if(open) qas.forEach(o => o !== qa && setQa(o, false));
    setQa(qa, open);
  });
});

/* ---------------------------------------------------------- *
 * 13. Nav panel (tablet and phone)
 * ---------------------------------------------------------- */
const nav = $("#nav");
const burger = $(".burger");
const panel = $("#nav-panel");
let navOpen = false;
const mRows = $$(".mrow[aria-expanded]", panel || document);
const closeSubs = ()=> mRows.forEach(r=>{
  r.setAttribute("aria-expanded", "false");
  r.nextElementSibling.style.height = "0px";
});
const setNav = (open)=>{
  if(navOpen === open) return;
  navOpen = open;
  nav.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  document.body.style.overflow = open ? "hidden" : "";
  if(lenis) open ? lenis.stop() : lenis.start();
  if(!open) setTimeout(closeSubs, 320);
};
if(burger && panel){
  burger.addEventListener("click", ()=> setNav(!navOpen));
  addEventListener("keydown", e=>{ if(e.key === "Escape" && navOpen){ setNav(false); burger.focus(); } });
  matchMedia("(min-width: 1200px)").addEventListener("change", ev=>{ if(ev.matches) setNav(false); });
  panel.addEventListener("click", e=>{ if(e.target.closest("a")) setNav(false); });

  // rows stagger in when the sheet opens
  mRows.concat($$(".mrow.mlink", panel)).forEach((r, i)=> r.style.setProperty("--md", (.06 + i * .04).toFixed(2) + "s"));

  // one section open at a time, like an accordion
  mRows.forEach(row=>{
    const sub = row.nextElementSibling;
    row.addEventListener("click", ()=>{
      const open = row.getAttribute("aria-expanded") !== "true";
      mRows.forEach(other=>{
        if(other === row) return;
        other.setAttribute("aria-expanded", "false");
        other.nextElementSibling.style.height = "0px";
      });
      row.setAttribute("aria-expanded", String(open));
      sub.style.height = open ? sub.firstElementChild.offsetHeight + "px" : "0px";
    });
  });
}

/* ---------------------------------------------------------- *
 * 13b. Full-width hover menu (desktop): hovering the nav opens
 *      the whole site map, the hovered item stays lit
 * ---------------------------------------------------------- */
const mega = $("#mega");
const navShell = $(".nav-shell");
if(mega && navShell){
  const megaIn = $(".mega-in", mega);
  const megaCols = $$(".mega-col", mega);
  const deskQ = matchMedia("(min-width: 1200px)");
  let tOpen = 0, tClose = 0, megaOpen = false;
  const setMega = (open)=>{
    if(open && !deskQ.matches) return;
    if(megaOpen === open) return;
    megaOpen = open;
    nav.classList.toggle("mega-open", open);
    mega.style.height = open ? megaIn.offsetHeight + "px" : "0px";
    if(!open) megaCols.forEach(c => c.classList.remove("dim"));
  };
  const openSoon  = ()=>{ clearTimeout(tClose); clearTimeout(tOpen); tOpen  = setTimeout(()=> setMega(true), 80); };
  const closeSoon = ()=>{ clearTimeout(tOpen);  clearTimeout(tClose); tClose = setTimeout(()=> setMega(false), 180); };
  $(".nav-links").addEventListener("mouseenter", openSoon);
  mega.addEventListener("mouseenter", ()=>{ clearTimeout(tClose); });
  navShell.addEventListener("mouseleave", closeSoon);
  navShell.addEventListener("focusin", ()=>{ clearTimeout(tClose); setMega(true); });
  navShell.addEventListener("focusout", e=>{ if(!navShell.contains(e.relatedTarget)) setMega(false); });
  $$(".nav-links a[data-mega]").forEach(a=>{
    a.addEventListener("mouseenter", ()=>{
      megaCols.forEach(c => c.classList.toggle("dim", c.dataset.mega !== a.dataset.mega));
    });
    a.addEventListener("mouseleave", ()=> megaCols.forEach(c => c.classList.remove("dim")));
  });
  mega.addEventListener("click", e=>{ if(e.target.closest("a")) setMega(false); });
  addEventListener("keydown", e=>{ if(e.key === "Escape") setMega(false); });
  deskQ.addEventListener("change", ()=> setMega(false));
  addEventListener("resize", ()=>{ if(megaOpen) mega.style.height = megaIn.offsetHeight + "px"; });
}

/* ---------------------------------------------------------- *
 * 13c. Horizontal rails (industries): arrows scroll one card,
 *      arrows disable at each end
 * ---------------------------------------------------------- */
$$(".rail").forEach(rail=>{
  const head = rail.closest(".container")?.querySelector(".rail-nav");
  if(!head) return;
  const card = $(".rail-track > *", rail);
  const step = ()=> card ? card.getBoundingClientRect().width + 24 : rail.clientWidth * .8;
  const sync = ()=>{
    const max = rail.scrollWidth - rail.clientWidth - 2;
    head.querySelector('[data-dir="-1"]').disabled = rail.scrollLeft <= 2;
    head.querySelector('[data-dir="1"]').disabled  = rail.scrollLeft >= max;
  };
  head.querySelectorAll("[data-dir]").forEach(b=>{
    b.addEventListener("click", ()=>{
      rail.scrollBy({ left: step() * Number(b.dataset.dir), behavior: reduced ? "auto" : "smooth" });
    });
  });
  rail.addEventListener("scroll", sync, { passive:true });
  addEventListener("resize", sync);
  sync();
});

/* ---------------------------------------------------------- *
 * 13d. Contact form. One form, three jobs: booking a
 *      consultation, raising a support ticket, or anything
 *      else. Nothing is sent, this is a mockup.
 * ---------------------------------------------------------- */
const cform = $("#cform");
if(cform){
  const card    = cform.parentElement;
  const need    = $("#f-need", cform);
  const note    = $("#support-note", cform);
  const status  = $("#form-status", cform);
  const msgLbl  = $("#f-msg-label", cform);
  const sendLbl = $("#f-send", cform);
  const supportFields = $$(".support-only", cform);
  const done    = $("#form-done", card);
  const again   = $("#form-again", card);

  const MODES = {
    consultation: { label:"What would you like to talk about?", send:"Send enquiry",
                    title:"Thanks, we have got your details",
                    body:"The CRT team will pick this up and get back to you." },
    support:      { label:"What is happening?", send:"Raise a support ticket",
                    title:"Your ticket is with the helpdesk",
                    body:"Our support team will follow up on the details you gave us." },
    other:        { label:"How can we help?", send:"Send enquiry",
                    title:"Thanks, we have got your details",
                    body:"The CRT team will pick this up and get back to you." }
  };

  const syncNeed = ()=>{
    const mode = MODES[need.value] || MODES.other;
    const support = need.value === "support";
    note.hidden = !support;
    supportFields.forEach(f => f.hidden = !support);
    msgLbl.textContent = mode.label;
    sendLbl.textContent = mode.send;
    sendLbl.nextElementSibling.textContent = mode.send;
  };
  need.addEventListener("change", syncNeed);
  syncNeed();

  cform.addEventListener("submit", e=>{
    e.preventDefault();
    const missing = ["f-name", "f-email"].filter(id => !$("#" + id, cform).value.trim());
    if(missing.length){
      status.textContent = "Please add your name and work email.";
      status.classList.add("on");
      $("#" + missing[0], cform).focus();
      return;
    }
    const mode = MODES[need.value] || MODES.other;
    $("#done-title", done).textContent = mode.title;
    $("#done-body", done).textContent  = mode.body;
    cform.hidden = true;
    done.hidden = false;
  });

  again.addEventListener("click", ()=>{
    cform.reset();
    status.textContent = "";
    status.classList.remove("on");
    syncNeed();
    done.hidden = true;
    cform.hidden = false;
  });
}

/* ---------------------------------------------------------- *
 * 14. In-page links land each heading just under the nav
 * ---------------------------------------------------------- */
document.addEventListener("click", e=>{
  const a = e.target.closest('a[href^="#"]');
  if(!a) return;
  const hash = a.getAttribute("href");
  if(hash.length < 2) return;
  const target = hash === "#top" ? 0 : document.getElementById(hash.slice(1));
  if(target === null) return;
  e.preventDefault();
  setNav(false);
  let y = 0;
  if(target !== 0){
    const pad = /^(SECTION)$/.test(target.tagName) ? parseFloat(getComputedStyle(target).paddingTop) || 0 : 0;
    y = Math.max(0, target.getBoundingClientRect().top + scrollY + pad - 124);
  }
  if(lenis) lenis.scrollTo(y, { duration:1.4 });
  else scrollTo({ top:y, behavior: reduced ? "auto" : "smooth" });
});

/* ---------------------------------------------------------- *
 * 15. Product demo video — plays in its window. The YouTube
 *     player is only requested once someone presses play, and
 *     it starts at 0:12 to skip the intro.
 * ---------------------------------------------------------- */
$$(".vw-stage").forEach(stage=>{
  stage.addEventListener("click", ()=>{
    if(stage.classList.contains("playing")) return;
    const start = parseInt(stage.dataset.start, 10);
    const f = document.createElement("iframe");
    f.src = "https://www.youtube-nocookie.com/embed/" + stage.dataset.video +
            "?autoplay=1&rel=0&modestbranding=1&playsinline=1" + (start > 0 ? "&start=" + start : "");
    f.title = stage.dataset.title || "Video";
    f.allow = "accelerometer; autoplay; encrypted-media; picture-in-picture; web-share";
    f.allowFullscreen = true;
    stage.appendChild(f);
    stage.classList.add("playing");
    const btn = $(".vw-play", stage);
    if(btn) btn.remove();
    f.focus();
  });
});

})();
