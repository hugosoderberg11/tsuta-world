(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var contactLottieAnim = null;

  function initContactLottie() {
    var el = document.getElementById("contact-lottie");
    if (!el || typeof lottie === "undefined") return false;
    if (el.dataset.lottieBound === "1") return true;

    el.dataset.lottieBound = "1";
    el.innerHTML = "";
    contactLottieAnim = lottie.loadAnimation({
      container: el,
      renderer: "svg",
      loop: !reduced,
      autoplay: !reduced,
      path: "assets/hero-wave-flow.json",
      rendererSettings: { preserveAspectRatio: "xMidYMid slice" }
    });

    contactLottieAnim.addEventListener("DOMLoaded", function () {
      el.classList.add("is-ready");
      var section = el.closest("#contact, .top-contact-section, .cm-contact, .contact-wave-section");
      if (section) section.classList.add("has-lottie");
    });

    contactLottieAnim.addEventListener("data_failed", function () {
      console.error("[contact-lottie] failed to load assets/hero-wave-flow.json");
    });

    return true;
  }

  window.tsutaInitContactLottie = initContactLottie;

  function wait() {
    var n = 0;
    (function tick() {
      if (initContactLottie() || n > 120) return;
      n += 1;
      setTimeout(tick, 50);
    })();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wait);
  } else {
    wait();
  }
})();
