(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var desktop = window.matchMedia("(min-width: 961px)").matches;
  var mobile = window.matchMedia("(max-width: 767px)").matches;

  if (!reduced) document.documentElement.classList.add("js-motion");

  var heroLottieAnim = null;
  var contactLottieAnim = null;

  function initHeroLottie() {
    var heroLottieEl = document.getElementById("hero-lottie");
    if (!heroLottieEl) return true;
    if (typeof lottie === "undefined") return false;
    if (heroLottieAnim) return true;

    heroLottieEl.innerHTML = "";
    heroLottieAnim = lottie.loadAnimation({
      container: heroLottieEl,
      renderer: "svg",
      loop: !reduced,
      autoplay: !reduced,
      path: "assets/hero-wave-flow.json",
      rendererSettings: { preserveAspectRatio: "xMidYMid slice" }
    });

    heroLottieAnim.addEventListener("DOMLoaded", function () {
      heroLottieEl.classList.add("is-ready");
      var shell = document.querySelector(".top-hero-shell");
      if (shell) shell.classList.add("has-lottie");
    });

    heroLottieAnim.addEventListener("data_failed", function () {
      console.error("[hero-lottie] failed to load assets/hero-wave-flow.json");
    });

    return true;
  }

  function waitForHeroLottie(done) {
    var n = 0;
    (function tick() {
      if (initHeroLottie() || n > 120) return done();
      n += 1;
      setTimeout(tick, 50);
    })();
  }

  function initContactLottie() {
    var contactLottieEl = document.getElementById("contact-lottie");
    if (!contactLottieEl) return true;
    if (contactLottieEl.dataset.lottieBound === "1" || contactLottieEl.classList.contains("is-ready")) return true;
    if (typeof window.tsutaInitContactLottie === "function") {
      return window.tsutaInitContactLottie();
    }
    if (typeof lottie === "undefined") return false;
    if (contactLottieAnim) return true;

    contactLottieEl.dataset.lottieBound = "1";
    contactLottieEl.innerHTML = "";
    contactLottieAnim = lottie.loadAnimation({
      container: contactLottieEl,
      renderer: "svg",
      loop: !reduced,
      autoplay: !reduced,
      path: "assets/hero-wave-flow.json",
      rendererSettings: { preserveAspectRatio: "xMidYMid slice" }
    });

    contactLottieAnim.addEventListener("DOMLoaded", function () {
      contactLottieEl.classList.add("is-ready");
      var section = contactLottieEl.closest("#contact, .top-contact-section, .cm-contact, .contact-wave-section");
      if (section) section.classList.add("has-lottie");
    });

    contactLottieAnim.addEventListener("data_failed", function () {
      console.error("[contact-lottie] failed to load assets/hero-wave-flow.json");
    });

    return true;
  }

  function waitForContactLottie(done) {
    var n = 0;
    (function tick() {
      if (initContactLottie() || n > 120) return done();
      n += 1;
      setTimeout(tick, 50);
    })();
  }

  function cloneHeroDeco() {
    if (typeof window.applyAtmDeco === "function") window.applyAtmDeco();
  }

  function waitForScene(done) {
    var n = 0;
    (function tick() {
      var ready =
        document.querySelector(".hero-title") &&
        document.querySelectorAll(".top-service-card").length >= 1 &&
        document.querySelector("#contact");
      if (ready || n > 80) return done();
      n += 1;
      setTimeout(tick, 50);
    })();
  }

  function formatCountValue(value, decimal) {
    if (decimal) return value.toFixed(1);
    return String(Math.round(value));
  }

  function initNumbersCountUp() {
    var section = document.getElementById("numbers");
    if (!section) return;

    var nums = section.querySelectorAll(".top-numbers-num");
    if (!nums.length) return;

    var items = [];
    nums.forEach(function (el) {
      var value = parseFloat(el.getAttribute("data-value"), 10);
      if (isNaN(value)) return;
      var decimal = el.getAttribute("data-decimal") === "1";
      items.push({ el: el, value: value, decimal: decimal });
      if (reduced) {
        el.textContent = formatCountValue(value, decimal);
      } else {
        el.textContent = decimal ? "0.0" : "0";
      }
    });

    if (reduced || !items.length) return;

    var started = false;
    var duration = 1750;

    function runCountUp() {
      if (started) return;
      started = true;
      var startTime = null;

      function frame(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);

        items.forEach(function (item) {
          var current = item.value * eased;
          item.el.textContent = formatCountValue(current, item.decimal);
        });

        if (progress < 1) {
          requestAnimationFrame(frame);
        } else {
          items.forEach(function (item) {
            item.el.textContent = formatCountValue(item.value, item.decimal);
          });
        }
      }

      requestAnimationFrame(frame);
    }

    if (!("IntersectionObserver" in window)) {
      runCountUp();
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          runCountUp();
          observer.disconnect();
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(section);
  }

  function boot() {
    initNumbersCountUp();
    waitForScene(function () {
      waitForHeroLottie(function () {
        waitForContactLottie(function () {
          cloneHeroDeco();
          if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
          gsap.registerPlugin(ScrollTrigger);
          if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(init).catch(init);
          } else {
            init();
          }
        });
      });
    });
  }

  function init() {
    if (reduced) return;

    var easeOut = "power4.out";
    var easeSoft = "power3.out";

    initHero(easeOut);
    initSectionDeco();
    initMedia(easeOut, easeSoft);
    initNews(easeSoft);
    initServices(easeOut, easeSoft);
    initContact(easeOut);
    bindHeroPills();

    ScrollTrigger.refresh();
    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        ScrollTrigger.refresh();
      }, 180);
    });
  }

  function initHero(easeOut) {
    var hero = document.getElementById("hero");
    if (!hero) return;

    var copy = hero.querySelector(".hero-copy-main");
    var visual = hero.querySelector(".hero-visual");
    var decos = hero.querySelectorAll(".hero-anim-deco");

    if (copy) {
      gsap.set(copy, { y: 24, opacity: 0 });
      gsap.to(copy, {
        y: 0,
        opacity: 1,
        duration: 0.95,
        ease: easeOut || "power4.out",
        delay: 0.08
      });
    }

    if (visual) {
      gsap.set(visual, { x: 18, opacity: 0 });
      gsap.to(visual, {
        x: 0,
        opacity: 1,
        duration: 1.1,
        ease: easeOut || "power4.out",
        delay: 0.32
      });
    }

    decos.forEach(function (el, i) {
      gsap.to(el, {
        y: i % 2 === 0 ? -7 : 6,
        duration: 5.5 + i * 0.6,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 0.9 + i * 0.12
      });
    });
  }

  function initSectionDeco() {
    if (mobile) return;
    ["#media", "#services", "#numbers", "#about", "#news", "#contact", "#footer"].forEach(function (sel) {
      var section = document.querySelector(sel);
      if (!section) return;
      var parts = section.querySelectorAll(".hero-deco-grid, .hero-deco-wash, .hero-deco svg");
      parts.forEach(function (el, i) {
        gsap.to(el, {
          y: i % 2 === 0 ? 48 : -36,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.7
          }
        });
      });
    });
  }

  function bindHeroPills() {
    document.addEventListener("mouseover", function (e) {
      var pill = e.target.closest && e.target.closest(".hero-pill");
      if (!pill) return;
      document.querySelectorAll(".hero-pill").forEach(function (p) {
        p.classList.remove("is-active");
      });
      pill.classList.add("is-active");
    });
  }

  function initMedia(easeOut, easeSoft) {
    var head = document.querySelector(".top-media-head");
    var cards = gsap.utils.toArray(".top-media-card");
    if (!head && !cards.length) return;

    if (head) {
      gsap.set(head, { clearProps: "transform,clipPath,opacity" });
    }

    cards.forEach(function (card, i) {
      var fromX = i % 2 === 0 ? (desktop ? 48 : 24) : desktop ? 48 : 24;
      var img = card.querySelector("img");
      var num = card.querySelector(".top-media-no");
      var body = card.querySelector(".top-media-body");

      gsap.set(card, { x: fromX, opacity: 0, rotate: i % 2 === 0 ? -1.2 : 1.2 });
      if (num) gsap.set(num, { y: -18, opacity: 0 });
      if (body) gsap.set(body, { y: 28, opacity: 0 });

      var tl = gsap.timeline({
        defaults: { ease: easeOut },
        scrollTrigger: {
          trigger: card,
          start: "top 82%",
          once: true
        }
      });
      tl.to(card, { x: 0, opacity: 1, rotate: 0, duration: 1.1 });
      if (body) tl.to(body, { y: 0, opacity: 1, duration: 0.85 }, 0.28);
      if (num) tl.to(num, { y: 0, opacity: 1, duration: 0.7 }, 0.45);

      if (img && desktop) {
        gsap.fromTo(
          img,
          { scale: 1.08 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8
            }
          }
        );
      }
    });
  }

  function initNews(easeSoft) {
    var rows = gsap.utils.toArray(".top-news-row");
    var head = document.querySelector(".top-news-side");
    if (head) {
      gsap.from(head, {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: easeSoft,
        scrollTrigger: { trigger: "#news", start: "top 80%", once: true }
      });
    }
    rows.forEach(function (row, i) {
      gsap.set(row, { y: 56, opacity: 0, clipPath: "inset(100% 0 0 0)" });
      gsap.to(row, {
        y: 0,
        opacity: 1,
        clipPath: "inset(0% 0 0 0)",
        duration: 0.9,
        delay: i * 0.08,
        ease: easeSoft,
        scrollTrigger: {
          trigger: row,
          start: "top 88%",
          once: true
        }
      });
    });
  }

  function initServices(easeOut, easeSoft) {
    var head = document.querySelector(".top-service-head");
    var cards = gsap.utils.toArray(".top-service-card");
    if (head) {
      gsap.from(head, {
        y: 28,
        opacity: 0,
        duration: 0.9,
        ease: easeOut,
        scrollTrigger: { trigger: "#services", start: "top 78%", once: true }
      });
    }

    cards.forEach(function (card, i) {
      var odd = i % 2 === 0;
      var fromX = odd ? (desktop ? -90 : -24) : desktop ? 90 : 24;
      var visual = card.querySelector(".top-service-visual");
      var body = card.querySelector(".top-service-body");
      var idx = card.querySelector(".top-service-idx");
      var start = desktop ? (odd ? "top 76%" : "top 60%") : "top 86%";

      gsap.set(card, { y: 40, opacity: 0 });
      if (visual) gsap.set(visual, { x: fromX * 0.35 });
      if (body) gsap.set(body, { x: fromX, opacity: 0 });
      if (idx) gsap.set(idx, { scale: 1.8, opacity: 0, y: 20 });

      var tl = gsap.timeline({
        defaults: { ease: easeOut },
        scrollTrigger: {
          trigger: card,
          start: start,
          once: true
        }
      });

      tl.to(card, { y: 0, opacity: 1, duration: 0.45 }, 0);
      if (visual) {
        tl.to(visual, { x: 0, duration: 1.15 }, 0);
      }
      if (idx) tl.to(idx, { scale: 1, opacity: 1, y: 0, duration: 0.85 }, 0.2);
      if (body) tl.to(body, { x: 0, opacity: 1, duration: 1, ease: easeSoft }, 0.28);

      if (!mobile) {
        gsap.to(card, {
          "--svc-shift": odd ? "28px" : "-24px",
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.7
          }
        });
      }
    });
  }

  function initContact() {
    return;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
