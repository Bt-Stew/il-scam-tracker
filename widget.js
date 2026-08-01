/*!
 * BBB Scam Tracker — Embeddable Carousel Widget
 * Central Illinois BBB Scam Tracker digest, built by X1 Marketing.
 *
 * Install by pasting on any page:
 *   <div id="bbb-scam-carousel"></div>
 *   <script src="https://bt-stew.github.io/il-scam-tracker/widget.js" async></script>
 *
 * Optional data-attributes on the container div:
 *   data-limit="10"          number of reports to show (default 10, max 15)
 *   data-city="Peoria"       comma-separated city filter, case-insensitive substring match
 *   data-types="Phishing,Romance"   comma-separated scam-type filter
 *   data-autoplay="true"     "false" to disable autoplay
 *   data-interval="6000"     ms between auto-advances
 *   data-theme="light"       "light" (default) or "dark"
 *   data-title="..."         custom header text
 *   data-cta-text="..."      custom CTA button label
 *   data-cta-url="..."       custom CTA button link
 *
 * No API calls are made — this widget only fetches a single static JSON
 * snapshot (widget-data.json) that BBB of Central Illinois' automated
 * pipeline refreshes daily. Nothing dynamic runs on BBB's or any other
 * live system when this script loads.
 */
(function () {
  'use strict';

  var CURRENT_SCRIPT = document.currentScript;
  var BASE_URL = CURRENT_SCRIPT
    ? CURRENT_SCRIPT.src.replace(/widget\.js.*$/, '')
    : 'https://bt-stew.github.io/il-scam-tracker/';
  var DATA_URL = BASE_URL + 'widget-data.json';
  var STYLE_ID = 'bbbst-carousel-styles';
  var SELECTOR = '#bbb-scam-carousel, [data-bbb-scam-carousel]';

  var TYPE_COLORS = {
    'Phishing': '#411624',
    'Romance': '#8a1f3d',
    'Online Purchase': '#0047BB',
    'Employment': '#183C50',
    'Counterfeit Product': '#0077BF',
    'Identity Theft': '#411624',
    'Debt Collections': '#183C50',
    'Sweepstakes/Lottery': '#B88900',
    'Charity/Phishing': '#411624',
    'Retail Business': '#0077BF',
    'Other': '#4a4a4a'
  };
  var DEFAULT_TYPE_COLOR = '#0047BB';

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var css = ''
      + '.bbbst-widget{--bbbst-blue:#0047BB;--bbbst-navy:#032160;--bbbst-blue-light:#0077BF;'
      + '--bbbst-teal:#183C50;--bbbst-burgundy:#411624;--bbbst-yellow:#F0C400;'
      + '--bbbst-offwhite:#EBEADA;--bbbst-pale:#E8F2FF;--bbbst-card-bg:#FFFFFF;'
      + '--bbbst-text:#1a1a1a;--bbbst-muted:#5b6472;--bbbst-border:#e2e6ec;'
      + 'box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;'
      + 'max-width:720px;margin:0 auto;color:var(--bbbst-text);position:relative;}'
      + '.bbbst-widget *{box-sizing:border-box;}'
      + '.bbbst-widget.bbbst-dark{--bbbst-card-bg:#0f1d33;--bbbst-text:#f2f4f8;--bbbst-muted:#aeb8c9;--bbbst-border:#233150;--bbbst-pale:#122a4d;}'
      + '.bbbst-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px;flex-wrap:wrap;}'
      + '.bbbst-head-left{display:flex;align-items:center;gap:9px;}'
      + '.bbbst-badge-icon{width:28px;height:28px;border-radius:6px;background:var(--bbbst-blue);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;letter-spacing:-0.5px;flex-shrink:0;}'
      + '.bbbst-title{font-size:15px;font-weight:700;color:var(--bbbst-navy);line-height:1.2;}'
      + '.bbbst-dark .bbbst-title{color:#fff;}'
      + '.bbbst-updated{font-size:11px;color:var(--bbbst-muted);margin-top:1px;}'
      + '.bbbst-track-wrap{position:relative;overflow:hidden;border-radius:14px;}'
      + '.bbbst-track{display:flex;transition:transform .45s cubic-bezier(.22,.61,.36,1);}'
      + '.bbbst-slide{flex:0 0 100%;padding:2px;}'
      + '.bbbst-card{background:var(--bbbst-card-bg);border:1px solid var(--bbbst-border);border-radius:14px;'
      + 'padding:18px 20px 16px;height:100%;box-shadow:0 1px 3px rgba(3,33,96,0.07);}'
      + '.bbbst-card-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px;flex-wrap:wrap;}'
      + '.bbbst-type-pill{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;'
      + 'color:#fff;text-transform:uppercase;letter-spacing:0.3px;}'
      + '.bbbst-loss{font-size:12px;font-weight:700;color:var(--bbbst-burgundy);}'
      + '.bbbst-dark .bbbst-loss{color:#ff9baf;}'
      + '.bbbst-loc-row{font-size:13px;font-weight:600;color:var(--bbbst-navy);margin-bottom:6px;}'
      + '.bbbst-dark .bbbst-loc-row{color:#cfe0ff;}'
      + '.bbbst-loc-row .bbbst-date{font-weight:400;color:var(--bbbst-muted);margin-left:6px;}'
      + '.bbbst-desc{font-size:13.5px;line-height:1.5;color:var(--bbbst-text);'
      + 'display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden;min-height:4.4em;}'
      + '.bbbst-biz{font-size:11.5px;color:var(--bbbst-muted);margin-top:8px;}'
      + '.bbbst-biz b{color:var(--bbbst-text);font-weight:600;}'
      + '.bbbst-controls{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:12px;}'
      + '.bbbst-arrow{background:var(--bbbst-card-bg);border:1px solid var(--bbbst-border);color:var(--bbbst-navy);'
      + 'width:30px;height:30px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;'
      + 'font-size:14px;line-height:1;transition:background .15s, transform .1s;padding:0;}'
      + '.bbbst-dark .bbbst-arrow{color:#fff;}'
      + '.bbbst-arrow:hover{background:var(--bbbst-pale);}'
      + '.bbbst-arrow:active{transform:scale(0.92);}'
      + '.bbbst-arrow:disabled{opacity:0.35;cursor:default;}'
      + '.bbbst-dots{display:flex;gap:6px;}'
      + '.bbbst-dot{width:6px;height:6px;border-radius:50%;background:var(--bbbst-border);border:none;padding:0;cursor:pointer;}'
      + '.bbbst-dot.bbbst-active{background:var(--bbbst-blue);width:16px;border-radius:4px;transition:width .2s;}'
      + '.bbbst-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:14px;flex-wrap:wrap;}'
      + '.bbbst-cta{background:var(--bbbst-blue);color:#fff !important;text-decoration:none;font-size:12.5px;font-weight:700;'
      + 'padding:8px 16px;border-radius:8px;display:inline-block;transition:background .15s;}'
      + '.bbbst-cta:hover{background:var(--bbbst-navy);}'
      + '.bbbst-attrib{font-size:10.5px;color:var(--bbbst-muted);}'
      + '.bbbst-attrib a{color:var(--bbbst-muted);text-decoration:underline;}'
      + '.bbbst-skeleton{height:150px;border-radius:14px;background:linear-gradient(90deg,var(--bbbst-pale) 25%,var(--bbbst-border) 37%,var(--bbbst-pale) 63%);'
      + 'background-size:400% 100%;animation:bbbst-shimmer 1.4s ease infinite;}'
      + '@keyframes bbbst-shimmer{0%{background-position:100% 0;}100%{background-position:0 0;}}'
      + '.bbbst-empty{text-align:center;padding:24px 12px;font-size:13px;color:var(--bbbst-muted);}'
      + '@media(min-width:640px){.bbbst-desc{-webkit-line-clamp:3;min-height:3.3em;}}';
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function formatMoney(n) {
    if (!n || n <= 0) return null;
    return '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 });
  }

  function formatDate(iso) {
    var d = new Date(iso + 'T00:00:00');
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function parseOptions(container) {
    var ds = container.dataset || {};
    var cities = (ds.city || ds.cities || '')
      .split(',').map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean);
    var types = (ds.types || '')
      .split(',').map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean);
    return {
      limit: Math.min(parseInt(ds.limit, 10) || 10, 15),
      autoplay: ds.autoplay !== 'false',
      interval: Math.max(parseInt(ds.interval, 10) || 6000, 2500),
      cities: cities,
      types: types,
      theme: ds.theme === 'dark' ? 'dark' : 'light',
      title: ds.title || 'Recent Scam Reports — Central Illinois',
      ctaText: ds.ctaText || 'Report a Scam',
      ctaUrl: ds.ctaUrl || 'https://www.bbb.org/scamtracker/lookupscam'
    };
  }

  function renderSkeleton(container, opts) {
    container.innerHTML = ''
      + '<div class="bbbst-widget' + (opts.theme === 'dark' ? ' bbbst-dark' : '') + '">'
      + '  <div class="bbbst-head">'
      + '    <div class="bbbst-head-left">'
      + '      <div class="bbbst-badge-icon">B</div>'
      + '      <div><div class="bbbst-title">' + escapeHtml(opts.title) + '</div>'
      + '      <div class="bbbst-updated">Loading latest reports…</div></div>'
      + '    </div>'
      + '  </div>'
      + '  <div class="bbbst-skeleton"></div>'
      + '</div>';
  }

  function renderFallback(container, opts) {
    container.innerHTML = ''
      + '<div class="bbbst-widget' + (opts.theme === 'dark' ? ' bbbst-dark' : '') + '">'
      + '  <div class="bbbst-head">'
      + '    <div class="bbbst-head-left">'
      + '      <div class="bbbst-badge-icon">B</div>'
      + '      <div class="bbbst-title">' + escapeHtml(opts.title) + '</div>'
      + '    </div>'
      + '  </div>'
      + '  <div class="bbbst-card bbbst-empty">'
      + '    Live scam report feed is temporarily unavailable.<br>'
      + '    <a class="bbbst-cta" style="margin-top:10px;" href="' + escapeHtml(opts.ctaUrl) + '" target="_blank" rel="noopener">'
      + '      Visit BBB Scam Tracker'
      + '    </a>'
      + '  </div>'
      + '</div>';
  }

  function buildCard(r) {
    var color = TYPE_COLORS[r.type] || DEFAULT_TYPE_COLOR;
    var loss = formatMoney(r.amt);
    return ''
      + '<div class="bbbst-slide">'
      + '  <div class="bbbst-card">'
      + '    <div class="bbbst-card-top">'
      + '      <span class="bbbst-type-pill" style="background:' + color + '">' + escapeHtml(r.type || 'Scam Report') + '</span>'
      + (loss ? '<span class="bbbst-loss">' + loss + ' reported lost</span>' : '<span class="bbbst-loss" style="color:var(--bbbst-muted);font-weight:600;">No loss reported</span>')
      + '    </div>'
      + '    <div class="bbbst-loc-row">' + escapeHtml(r.city || 'Illinois')
      + '      <span class="bbbst-date">' + escapeHtml(formatDate(r.date)) + '</span>'
      + '    </div>'
      + '    <div class="bbbst-desc">' + escapeHtml(r.desc || '') + '</div>'
      + (r.biz && r.biz !== '—' ? '<div class="bbbst-biz">Business named: <b>' + escapeHtml(r.biz) + '</b></div>' : '')
      + '  </div>'
      + '</div>';
  }

  function renderCarousel(container, payload, opts) {
    var all = (payload && payload.reports) || [];
    var filtered = all.filter(function (r) {
      var cityMatch = !opts.cities.length || opts.cities.some(function (c) {
        return (r.city || '').toLowerCase().indexOf(c) !== -1;
      });
      var typeMatch = !opts.types.length || opts.types.some(function (t) {
        return (r.type || '').toLowerCase().indexOf(t) !== -1;
      });
      return cityMatch && typeMatch;
    }).slice(0, opts.limit);

    if (!filtered.length) {
      renderFallback(container, opts);
      return;
    }

    var updatedLabel = payload.generated_at ? 'Updated ' + formatDate(payload.generated_at) : 'Updated regularly';
    var dashboardUrl = payload.dashboard_url || opts.ctaUrl;

    container.innerHTML = ''
      + '<div class="bbbst-widget' + (opts.theme === 'dark' ? ' bbbst-dark' : '') + '">'
      + '  <div class="bbbst-head">'
      + '    <div class="bbbst-head-left">'
      + '      <div class="bbbst-badge-icon">B</div>'
      + '      <div><div class="bbbst-title">' + escapeHtml(opts.title) + '</div>'
      + '      <div class="bbbst-updated">' + escapeHtml(updatedLabel) + ' · Source: BBB Scam Tracker</div></div>'
      + '    </div>'
      + '  </div>'
      + '  <div class="bbbst-track-wrap">'
      + '    <div class="bbbst-track">' + filtered.map(buildCard).join('') + '</div>'
      + '  </div>'
      + '  <div class="bbbst-controls">'
      + '    <button type="button" class="bbbst-arrow" data-dir="-1" aria-label="Previous report">&#8249;</button>'
      + '    <div class="bbbst-dots"></div>'
      + '    <button type="button" class="bbbst-arrow" data-dir="1" aria-label="Next report">&#8250;</button>'
      + '  </div>'
      + '  <div class="bbbst-foot">'
      + '    <a class="bbbst-cta" href="' + escapeHtml(opts.ctaUrl) + '" target="_blank" rel="noopener">' + escapeHtml(opts.ctaText) + '</a>'
      + '    <span class="bbbst-attrib">Powered by <a href="https://bbbscamstop.com/central-illinois" target="_blank" rel="noopener">BBB Scam Stop Program</a></span>'
      + '  </div>'
      + '</div>';

    var track = container.querySelector('.bbbst-track');
    var slides = container.querySelectorAll('.bbbst-slide');
    var dotsWrap = container.querySelector('.bbbst-dots');
    var prevBtn = container.querySelector('.bbbst-arrow[data-dir="-1"]');
    var nextBtn = container.querySelector('.bbbst-arrow[data-dir="1"]');
    var index = 0;
    var timer = null;

    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'bbbst-dot' + (i === 0 ? ' bbbst-active' : '');
      dot.setAttribute('aria-label', 'Go to report ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); });
      dotsWrap.appendChild(dot);
    });
    var dots = container.querySelectorAll('.bbbst-dot');

    function update() {
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
      dots.forEach(function (d, i) { d.classList.toggle('bbbst-active', i === index); });
      if (slides.length <= 1) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
      }
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      update();
    }

    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    prevBtn.addEventListener('click', function () { prev(); restart(); });
    nextBtn.addEventListener('click', function () { next(); restart(); });

    function start() {
      if (!opts.autoplay || slides.length <= 1) return;
      stop();
      timer = setInterval(next, opts.interval);
    }
    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }
    function restart() { stop(); start(); }

    container.addEventListener('mouseenter', stop);
    container.addEventListener('mouseleave', start);
    container.addEventListener('focusin', stop);
    container.addEventListener('focusout', start);

    // basic touch swipe support
    var touchStartX = null;
    var wrap = container.querySelector('.bbbst-track-wrap');
    wrap.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
      stop();
    }, { passive: true });
    wrap.addEventListener('touchend', function (e) {
      if (touchStartX === null) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); }
      touchStartX = null;
      start();
    }, { passive: true });

    update();
    start();
  }

  function init(container) {
    if (container.dataset.bbbstInitialized) return;
    container.dataset.bbbstInitialized = 'true';
    var opts = parseOptions(container);
    injectStyles();
    renderSkeleton(container, opts);
    fetch(DATA_URL, { mode: 'cors', credentials: 'omit', cache: 'default' })
      .then(function (res) {
        if (!res.ok) throw new Error('bad response');
        return res.json();
      })
      .then(function (payload) { renderCarousel(container, payload, opts); })
      .catch(function () { renderFallback(container, opts); });
  }

  function initAll() {
    var nodes = document.querySelectorAll(SELECTOR);
    for (var i = 0; i < nodes.length; i++) init(nodes[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Expose a manual init hook for containers added dynamically after load.
  window.BBBScamCarousel = { init: init, initAll: initAll };
})();
