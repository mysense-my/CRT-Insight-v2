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
 * 3. Typewriter in the prompt panel
 * ---------------------------------------------------------- */
const typed = $(".typed");
if(typed){
  const lines = JSON.parse(typed.dataset.lines);
  let li = 0, ci = 0, dir = 1;
  const tick = ()=>{
    const line = lines[li];
    if(dir > 0){
      typed.textContent = line.slice(0, ++ci);
      if(ci >= line.length){ dir = -1; return setTimeout(tick, 2400); }
      return setTimeout(tick, 45 + Math.random() * 45);
    }
    typed.textContent = line.slice(0, --ci);
    if(ci <= 0){ dir = 1; li = (li + 1) % lines.length; return setTimeout(tick, 450); }
    return setTimeout(tick, 18);
  };
  if(reduced) typed.textContent = lines[0];
  else setTimeout(tick, 2600);
}

/* ---------------------------------------------------------- *
 * 4. Smooth scrolling
 * ---------------------------------------------------------- */
let lenis = null;
if(!reduced && typeof Lenis === "function"){
  lenis = new Lenis({ lerp:.075, wheelMultiplier:.95, smoothWheel:true });
  requestAnimationFrame(function raf(t){ lenis.raf(t); requestAnimationFrame(raf); });
}

/* ---------------------------------------------------------- *
 * 5. Tickers — each set is cloned until the row is covered,
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
 * 6. Product windows keep their desktop layout and scale down
 *    as one piece on narrower screens
 * ---------------------------------------------------------- */
const fits = $$(".fit");
function fitAll(){
  fits.forEach(el=>{
    const box = el.parentElement;
    const avail = box.clientWidth;
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
 * 7. Reveal on view
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
 * 8. Scroll-linked: "Automation" rises into place, and each
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
function onScroll(){
  if(grad && !reduced){
    const vh = innerHeight;
    const r = title.getBoundingClientRect();
    const start = vh * 1.12, end = vh * .245;
    const p = clamp((start - r.top) / (start - end));
    const dist = innerWidth < 810 ? 70 : innerWidth < 1200 ? 130 : 200;
    grad.style.transform = "translate3d(0," + ((1 - p) * dist).toFixed(1) + "px,0)";
  }
  if(cards.length && !reduced){
    const on = innerWidth >= 1200;
    cards.forEach((c, i)=>{
      if(!on || i === cards.length - 1){ c.style.transform = ""; return; }
      const p = clamp((scrollY - (cardTops[i] - 25)) / 770);
      const e = -(Math.cos(Math.PI * p) - 1) / 2;
      c.style.transform = p > 0 ? "perspective(1200px) scale(" + (1 - .4 * e).toFixed(4) + ")" : "";
    });
  }
}
measureStack();
if(lenis) lenis.on("scroll", onScroll);
else addEventListener("scroll", onScroll, { passive:true });
addEventListener("resize", ()=>{ measureStack(); onScroll(); });
addEventListener("load", ()=>{ fitAll(); measureStack(); onScroll(); });
onScroll();

/* ---------------------------------------------------------- *
 * 9. Services panels rotate every 7s with a progress bar
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
 * 10. Stories: a swipe row with dots on phones
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
 * 11. FAQ — one answer open at a time
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
 * 12. Nav panel (tablet and phone)
 * ---------------------------------------------------------- */
const nav = $("#nav");
const burger = $(".burger");
const panel = $("#nav-panel");
let navOpen = false;
const setNav = (open)=>{
  if(navOpen === open) return;
  navOpen = open;
  nav.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  panel.style.height = open ? panel.scrollHeight + "px" : "0px";
};
if(burger && panel){
  burger.addEventListener("click", ()=> setNav(!navOpen));
  addEventListener("keydown", e=>{ if(e.key === "Escape" && navOpen){ setNav(false); burger.focus(); } });
  matchMedia("(min-width: 1200px)").addEventListener("change", ev=>{ if(ev.matches) setNav(false); });
}

/* ---------------------------------------------------------- *
 * 13. In-page links land each heading just under the nav
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
 * 14. Product demo video — plays in its window. The YouTube
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
