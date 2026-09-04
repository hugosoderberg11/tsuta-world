(function () {
  "use strict";

  var MARKUP =
    '<div class="hero-deco" aria-hidden="true">' +
    '<div class="hero-deco-grid"></div>' +
    '<div class="hero-deco-wash"></div>' +
    '<svg viewBox="0 0 1440 860" preserveAspectRatio="xMidYMid slice" focusable="false">' +
    '<g fill="none" stroke="#3B82F6" stroke-width="1" opacity="0.22">' +
    '<circle cx="170" cy="740" r="210"/><circle cx="170" cy="740" r="148"/><circle cx="1260" cy="120" r="160"/>' +
    "</g>" +
    '<g stroke="#3B82F6" stroke-width="1" opacity="0.16">' +
    '<line x1="220" y1="36" x2="220" y2="250"/><line x1="48" y1="190" x2="300" y2="190"/>' +
    '<line x1="1180" y1="420" x2="1180" y2="780"/><line x1="1020" y1="640" x2="1380" y2="640"/>' +
    "</g>" +
    '<g fill="#2563EB" opacity="0.35">' +
    '<rect x="216" y="186" width="8" height="8" rx="1"/><rect x="1176" y="636" width="8" height="8" rx="1"/><rect x="70" y="70" width="6" height="6" rx="1"/>' +
    "</g>" +
    '<g stroke="#3B82F6" stroke-width="1.3" opacity="0.28">' +
    '<path d="M390 70 l0 10 M385 75 l10 0"/><path d="M820 110 l0 10 M815 115 l10 0"/>' +
    '<path d="M1320 280 l0 10 M1315 285 l10 0"/><path d="M80 320 l0 10 M75 325 l10 0"/><path d="M560 800 l0 10 M555 805 l10 0"/>' +
    "</g>" +
    '<g fill="#3B82F6" opacity="0.18">' +
    '<circle cx="1088" cy="220" r="1.5"/><circle cx="1102" cy="220" r="1.5"/><circle cx="1116" cy="220" r="1.5"/><circle cx="1130" cy="220" r="1.5"/>' +
    '<circle cx="1088" cy="234" r="1.5"/><circle cx="1102" cy="234" r="1.5"/><circle cx="1116" cy="234" r="1.5"/><circle cx="1130" cy="234" r="1.5"/>' +
    '<circle cx="1088" cy="248" r="1.5"/><circle cx="1102" cy="248" r="1.5"/><circle cx="1116" cy="248" r="1.5"/><circle cx="1130" cy="248" r="1.5"/>' +
    '<circle cx="140" cy="110" r="1.5"/><circle cx="154" cy="110" r="1.5"/><circle cx="168" cy="110" r="1.5"/>' +
    '<circle cx="140" cy="124" r="1.5"/><circle cx="154" cy="124" r="1.5"/><circle cx="168" cy="124" r="1.5"/>' +
    "</g></svg></div>";

  var TARGETS = [
    ".ui-atm",
    ".top-footer",
    ".cm-hero",
    ".cm-works",
    ".cm-contact",
    ".cm-section",
    ".page-main",
    ".site-footer",
    ".fs-hero",
    ".fs-section"
  ].join(",");

  var VARIANTS = ["", "scaleX(-1)", "scaleY(-1)", "rotate(180deg)"];

  function makeDeco() {
    var wrap = document.createElement("div");
    wrap.innerHTML = MARKUP;
    return wrap.firstElementChild;
  }

  function applyAtmDeco() {
    if (!document.body) return;
    if (document.body.classList.contains("plain-ui")) return;

    if (!document.body.querySelector(":scope > .atm-page-deco")) {
      var page = makeDeco();
      page.classList.add("atm-page-deco");
      document.body.insertBefore(page, document.body.firstChild);
    }

    var nodes = document.querySelectorAll(TARGETS);
    nodes.forEach(function (el, i) {
      if (el.id === "hero") return;
      if (el.classList.contains("fs-section--dark")) return;
      if (el.classList.contains("fs-contact-cta")) return;
      if (el.classList.contains("cm-section") && el.closest(".cm-works")) return;
      if (el.querySelector(":scope > .hero-deco")) return;
      el.classList.add("atm-surface");
      var deco = makeDeco();
      var variant = VARIANTS[i % VARIANTS.length];
      if (variant) deco.style.transform = variant;
      el.insertBefore(deco, el.firstChild);
    });
  }

  window.applyAtmDeco = applyAtmDeco;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyAtmDeco);
  } else {
    applyAtmDeco();
  }
})();
