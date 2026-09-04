(function () {
  "use strict";

  var STYLE_ID = "site-nav-css";
  var CSS = [
    ".site-nav-toggle{display:none;align-items:center;justify-content:center;flex-shrink:0;width:44px;height:44px;margin:0;padding:0;border:0;border-radius:10px;background:transparent;cursor:pointer;color:#111318}",
    ".site-nav-toggle span{display:block;width:18px;height:2px;margin:2.5px 0;background:currentColor;border-radius:1px;transition:transform .2s ease,opacity .2s ease}",
    "body.site-nav-open .site-nav-toggle span:nth-child(1){transform:translateY(7px) rotate(45deg)}",
    "body.site-nav-open .site-nav-toggle span:nth-child(2){opacity:0}",
    "body.site-nav-open .site-nav-toggle span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}",
    ".site-nav-overlay{display:none;position:fixed;inset:0;z-index:70;background:rgba(17,19,24,.42);border:0;padding:0;margin:0;cursor:pointer}",
    ".site-nav-drawer{display:none;position:fixed;top:0;right:0;z-index:71;width:min(86vw,360px);height:100%;padding:88px 24px calc(28px + env(safe-area-inset-bottom));background:#fff;box-shadow:-16px 0 40px rgba(17,19,24,.12);overflow:auto;-webkit-overflow-scrolling:touch}",
    ".site-nav-drawer a{display:flex;align-items:center;min-height:52px;padding:12px 4px;border-bottom:1px solid #E6EEF6;font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:700;letter-spacing:.08em;color:#111318}",
    ".site-nav-drawer a.page-header-contact,.site-nav-drawer a.top-header-contact{margin-top:20px;justify-content:center;min-height:52px;border:0;border-radius:999px;background:#3B82F6;color:#fff}",
    "body.site-nav-open{overflow:hidden}",
    "body.site-nav-open .page-header,body.site-nav-open .top-header{z-index:80}",
    "body.site-nav-open .site-nav-overlay,body.site-nav-open .site-nav-drawer{display:block}",
    "@media (max-width:960px){",
    ".site-nav-toggle{display:inline-flex}",
    ".page-header-nav a:not(.page-header-contact),.top-header-nav a:not(.top-header-contact){display:none !important}",
    ".page-header-inner,.page-header-inner--nav,.top-header-inner{flex-wrap:nowrap !important}",
    ".page-header-nav,.top-header-nav{margin-left:auto;gap:10px !important}",
    ".page-header-inner,.top-header-inner{padding-top:env(safe-area-inset-top)}",
    "}"
  ].join("");

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function closeNav() {
    document.body.classList.remove("site-nav-open");
    var btn = document.querySelector(".site-nav-toggle");
    if (btn) {
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "メニューを開く");
    }
  }

  function openNav() {
    document.body.classList.add("site-nav-open");
    var btn = document.querySelector(".site-nav-toggle");
    if (btn) {
      btn.setAttribute("aria-expanded", "true");
      btn.setAttribute("aria-label", "メニューを閉じる");
    }
  }

  function init() {
    injectStyles();
    var inner = document.querySelector(".page-header-inner--nav, .top-header-inner");
    var nav = document.querySelector(".page-header-nav, .top-header-nav");
    if (!inner || !nav) return false;
    if (inner.dataset.navBound === "1") return true;

    inner.dataset.navBound = "1";

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "site-nav-toggle";
    btn.setAttribute("aria-label", "メニューを開く");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", "site-nav-drawer");
    btn.innerHTML = "<span></span><span></span><span></span>";

    var overlay = document.createElement("button");
    overlay.type = "button";
    overlay.className = "site-nav-overlay";
    overlay.setAttribute("aria-label", "メニューを閉じる");

    var drawer = document.createElement("nav");
    drawer.id = "site-nav-drawer";
    drawer.className = "site-nav-drawer";
    drawer.setAttribute("aria-label", "サイトメニュー");
    Array.prototype.forEach.call(nav.querySelectorAll("a"), function (link) {
      drawer.appendChild(link.cloneNode(true));
    });

    inner.appendChild(btn);
    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    btn.addEventListener("click", function () {
      if (document.body.classList.contains("site-nav-open")) closeNav();
      else openNav();
    });
    overlay.addEventListener("click", closeNav);
    drawer.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });

    return true;
  }

  function wait() {
    var n = 0;
    (function tick() {
      if (init() || n > 120) return;
      n += 1;
      setTimeout(tick, 50);
    })();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wait);
  } else {
    wait();
  }

  if (typeof MutationObserver === "function") {
    var obs = new MutationObserver(function () {
      var inner = document.querySelector(".page-header-inner--nav, .top-header-inner");
      if (inner && inner.dataset.navBound !== "1") init();
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
