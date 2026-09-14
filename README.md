# CRT Insights Technologies — homepage mockup v2

A second homepage concept for [CRT Insights Technologies](https://www.crt-insights.com/), the Johor Bahru ERP consultancy. The layout and motion follow the FusionAI Framer template, rebuilt from scratch in CRT's own light palette (navy `#002B5D`, blue `#007AB9`, sky `#6CC6F0`) with Hanken Grotesk and IBM Plex Mono.

Mockup v1 lives in [mysense-my/CRT-Insight](https://github.com/mysense-my/CRT-Insight).

## Structure

```
index.html          the whole page
css/style.css       design tokens, sections, breakpoints (1200 / 810)
js/main.js          reveals, typewriter, tickers, sticky cards, tabs, FAQ, menu, video
js/lenis.min.js     smooth scrolling (Lenis 1.3.11, vendored)
assets/             CRT logos, favicon, partner logos and marks, video poster
```

Plain HTML, CSS and JavaScript. No build step.

## Sections

Hero with a typing prompt panel, partner logo ticker, Solutions bento with rotating glow borders, "AI Automation" with the ACT AC2 Wave WMS Connector demo video (plays inline from 0:12; YouTube loads only on play), industries, Products as sticky stacking cards, Services as auto-rotating panels, Integrations, customers and events ticker, three steps to get started, FAQ, closing call to action and footer.

## Preview locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.
