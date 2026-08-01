/*!
 * BBB Central Illinois Scam Shield — Embeddable Partner Badge
 * Built by X1 Marketing for BBB of Central Illinois.
 *
 * Unlike the BBB Accredited Business seal, this badge:
 *   - is NOT tied to an individual BBB business profile
 *   - links to the public Scam Shield program page (bbbscamstop.com/central-illinois),
 *     not any bbb.org profile or third-party site
 *   - shows a self-updating "Current as of [today's date]" line, computed in the
 *     visitor's browser on every page load — no manual updates, ever.
 *
 * Install by pasting on any page:
 *   <div id="bbb-scam-shield" data-tier="local-guardian"></div>
 *   <script src="https://bt-stew.github.io/il-scam-tracker/scamshieldbadge.js" async></script>
 *   (Note: the live filename on GitHub Pages has no hyphens — scamshieldbadge.js —
 *   even though this source file is named scam-shield-badge.js locally.)
 *
 * Optional data-attributes on the container div:
 *   data-tier="local-scout"        "local-scout" | "local-guardian" | "local-sentinel" (default: local-scout)
 *   data-theme="light"             "light" (default) or "dark"
 *   data-date-format="full"        "full" (August 1, 2026) | "short" (Aug 1, 2026) | "month-year" (August 2026)
 *   data-label="..."               override the tier name shown
 *   data-tagline="..."             override the small program line under the tier name
 *   data-tooltip="true"            "false" to disable the hover/focus info tooltip
 *   data-image="https://..."       override the badge image for this instance
 *   data-url="https://..."         override the link target (default: bbbscamstop.com/central-illinois)
 *
 * Multiple badges (different tiers) can run on the same page.
 */
(function () {
  'use strict';

  var CURRENT_SCRIPT = document.currentScript;
  var BASE_URL = CURRENT_SCRIPT
    ? CURRENT_SCRIPT.src.replace(/scam-shield-badge\.js.*$/, '')
    : 'https://bt-stew.github.io/il-scam-tracker/';
  var IMG_BASE = 'https://bbb.x1marketinginc.com/images/';
  var DEFAULT_URL = 'https://bbbscamstop.com/central-illinois';
  var STYLE_ID = 'bbbss-badge-styles';
  var SELECTOR = '#bbb-scam-shield, [data-bbb-scam-shield]';
  var PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==';

  // All three tiers share one badge image (shield-only.gif) — only the
  // label, tagline, and accent color change per tier. Override per-instance
  // via data-image if a tier ever needs its own art.
  var SHIELD_IMAGE = IMG_BASE + 'shield-only.gif';
  var TIERS = {
    'local-scout': {
      label: 'Local Scout',
      tagline: 'BBB of Central Illinois Scam Shield Partner',
      image: SHIELD_IMAGE,
      accent: '#0047BB',
      blurb: 'Local Scout partners help BBB of Central Illinois spot and report emerging scams as they happen.'
    },
    'local-guardian': {
      label: 'Local Guardian',
      tagline: 'BBB of Central Illinois Scam Shield Partner',
      image: SHIELD_IMAGE,
      accent: '#183C50',
      blurb: 'Local Guardian partners actively share scam alerts with their customers and community.'
    },
    'local-sentinel': {
      label: 'Local Sentinel',
      tagline: 'BBB of Central Illinois Scam Shield Partner',
      image: SHIELD_IMAGE,
      accent: '#B88900',
      blurb: 'Local Sentinel is the highest Scam Shield tier — sustained, ongoing partnership in the fight against fraud in Central Illinois.'
    }
  };
  var DEFAULT_TIER = 'local-scout';

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var css = ''
      + '.bbbss-badge{--bbbss-blue:#0047BB;--bbbss-navy:#032160;--bbbss-blue-light:#0077BF;'
      + '--bbbss-teal:#183C50;--bbbss-burgundy:#411624;--bbbss-yellow:#F0C400;'
      + '--bbbss-card-bg:#FFFFFF;--bbbss-text:#1a1a1a;--bbbss-muted:#5b6472;--bbbss-border:#e2e6ec;--bbbss-accent:#0047BB;'
      + 'box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;'
      + 'display:inline-flex;flex-direction:column;align-items:center;gap:10px;width:220px;'
      + 'padding:16px 14px 14px;border-radius:14px;background:var(--bbbss-card-bg);border:1px solid var(--bbbss-border);'
      + 'box-shadow:0 1px 3px rgba(3,33,96,0.08);position:relative;text-align:center;text-decoration:none;cursor:pointer;'
      + 'transition:box-shadow .2s ease, transform .2s ease;outline:none;}'
      + '.bbbss-badge *{box-sizing:border-box;}'
      + '.bbbss-badge:hover,.bbbss-badge:focus-visible{box-shadow:0 6px 18px rgba(3,33,96,0.16);transform:translateY(-2px);}'
      + '.bbbss-badge.bbbss-dark{--bbbss-card-bg:#0f1d33;--bbbss-text:#f2f4f8;--bbbss-muted:#aeb8c9;--bbbss-border:#233150;}'
      + '.bbbss-imgwrap{width:124px;height:124px;display:flex;align-items:center;justify-content:center;}'
      + '.bbbss-img{max-width:100%;max-height:100%;display:block;opacity:0;transition:opacity .3s ease;}'
      + '.bbbss-img.bbbss-loaded{opacity:1;}'
      + '.bbbss-tier{font-size:14px;font-weight:800;color:var(--bbbss-navy);line-height:1.25;}'
      + '.bbbss-dark .bbbss-tier{color:#fff;}'
      + '.bbbss-tagline{font-size:10.5px;font-weight:600;color:var(--bbbss-muted);letter-spacing:0.2px;line-height:1.3;}'
      + '.bbbss-divider{width:28px;height:2px;border-radius:2px;background:var(--bbbss-accent);margin:1px 0;}'
      + '.bbbss-date{display:flex;align-items:center;gap:5px;font-size:10.5px;color:var(--bbbss-muted);}'
      + '.bbbss-dot{width:6px;height:6px;border-radius:50%;background:#2fa84f;flex-shrink:0;'
      + 'box-shadow:0 0 0 rgba(47,168,79,0.5);animation:bbbss-pulse 2.2s infinite;}'
      + '@keyframes bbbss-pulse{0%{box-shadow:0 0 0 0 rgba(47,168,79,0.45);}70%{box-shadow:0 0 0 5px rgba(47,168,79,0);}100%{box-shadow:0 0 0 0 rgba(47,168,79,0);}}'
      + '.bbbss-tooltip{position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%) translateY(4px);'
      + 'width:220px;background:var(--bbbss-navy);color:#fff;font-size:11.5px;line-height:1.45;font-weight:500;'
      + 'padding:10px 12px;border-radius:9px;opacity:0;pointer-events:none;transition:opacity .15s ease, transform .15s ease;z-index:10;'
      + 'box-shadow:0 6px 16px rgba(0,0,0,0.18);}'
      + '.bbbss-tooltip::after{content:"";position:absolute;top:100%;left:50%;transform:translateX(-50%);'
      + 'border:6px solid transparent;border-top-color:var(--bbbss-navy);}'
      + '.bbbss-badge:hover .bbbss-tooltip,.bbbss-badge:focus-visible .bbbss-tooltip{'
      + 'opacity:1;transform:translateX(-50%) translateY(0);}'
      + '.bbbss-attrib{font-size:9px;color:var(--bbbss-muted);opacity:0.85;letter-spacing:0.2px;}';
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

  function formatToday(format) {
    var d = new Date();
    if (format === 'month-year') {
      return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    if (format === 'short') {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  function parseOptions(container) {
    var ds = container.dataset || {};
    var tierKey = TIERS[ds.tier] ? ds.tier : DEFAULT_TIER;
    var tier = TIERS[tierKey];
    return {
      tierKey: tierKey,
      label: ds.label || tier.label,
      tagline: ds.tagline || tier.tagline,
      image: ds.image || tier.image,
      accent: tier.accent,
      blurb: ds.blurb || tier.blurb,
      theme: ds.theme === 'dark' ? 'dark' : 'light',
      dateFormat: ds.dateFormat || 'full',
      tooltip: ds.tooltip !== 'false',
      url: ds.url || DEFAULT_URL
    };
  }

  function render(container, opts) {
    var dark = opts.theme === 'dark' ? ' bbbss-dark' : '';
    var ariaLabel = opts.label + ' — ' + opts.tagline + ' — Current as of ' + formatToday(opts.dateFormat) + '. Opens the BBB Central Illinois Scam Shield program page.';

    container.innerHTML = ''
      + '<a class="bbbss-badge' + dark + '" href="' + escapeHtml(opts.url) + '" target="_blank" rel="noopener noreferrer" aria-label="' + escapeHtml(ariaLabel) + '">'
      + '  <div class="bbbss-imgwrap">'
      + '    <img class="bbbss-img" data-src="' + escapeHtml(opts.image) + '" src="' + PLACEHOLDER + '" alt="' + escapeHtml(opts.label + ' — ' + opts.tagline) + '">'
      + '  </div>'
      + '  <div class="bbbss-tier">' + escapeHtml(opts.label) + '</div>'
      + '  <div class="bbbss-tagline">' + escapeHtml(opts.tagline) + '</div>'
      + '  <div class="bbbss-divider"></div>'
      + '  <div class="bbbss-date"><span class="bbbss-dot"></span>Current as of <span class="bbbss-date-text">' + escapeHtml(formatToday(opts.dateFormat)) + '</span></div>'
      + (opts.tooltip ? '  <div class="bbbss-tooltip" role="tooltip">' + escapeHtml(opts.blurb) + '</div>' : '')
      + '  <div class="bbbss-attrib">BBB of Central Illinois</div>'
      + '</a>';

    var badgeEl = container.querySelector('.bbbss-badge');
    badgeEl.style.setProperty('--bbbss-accent', opts.accent);

    // Lazy-load the real badge image once it's near the viewport.
    var img = container.querySelector('.bbbss-img');
    function load() {
      img.src = img.getAttribute('data-src');
      img.addEventListener('load', function () { img.classList.add('bbbss-loaded'); }, { once: true });
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { load(); io.disconnect(); }
        });
      }, { rootMargin: '150px' });
      io.observe(container);
    } else {
      load();
    }

    // Keep the date accurate if a badge is left open across a midnight rollover
    // (e.g. a kiosk or an always-open browser tab).
    var dateText = container.querySelector('.bbbss-date-text');
    setInterval(function () { dateText.textContent = formatToday(opts.dateFormat); }, 60 * 60 * 1000);
  }

  function init(container) {
    if (container.dataset.bbbssInitialized) return;
    container.dataset.bbbssInitialized = 'true';
    injectStyles();
    render(container, parseOptions(container));
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
  window.BBBScamShield = { init: init, initAll: initAll, TIERS: TIERS };
})();
