(function () {
  var root = document.documentElement;

  // Language: saved choice first, then the browser's language
  var langButtons = document.querySelectorAll("[data-set-lang]");

  function setLang(lang) {
    root.lang = lang;
    langButtons.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.setLang === lang));
    });
    try { localStorage.setItem("lang", lang); } catch (e) {}
  }

  var saved = null;
  try { saved = localStorage.getItem("lang"); } catch (e) {}
  setLang(saved || ((navigator.language || "").toLowerCase().indexOf("el") === 0 ? "el" : "en"));

  langButtons.forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.dataset.setLang); });
  });

  // Phone and tablet menu
  var top = document.querySelector(".top");
  var menuButton = document.querySelector(".top__menu");

  function setMenu(open) {
    top.classList.toggle("is-open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
  }

  menuButton.addEventListener("click", function () { setMenu(!top.classList.contains("is-open")); });
  document.querySelectorAll(".top__nav a, .top__logo").forEach(function (a) {
    a.addEventListener("click", function () { setMenu(false); });
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  window.addEventListener("resize", function () { setMenu(false); });

  // Header hides while scrolling down and returns when scrolling up
  var lastY = window.scrollY;
  window.addEventListener("scroll", function () {
    var y = window.scrollY;
    if (Math.abs(y - lastY) < 6) return;
    top.classList.toggle("is-hidden", y > lastY && y > 240 && !top.classList.contains("is-open"));
    lastY = y;
  }, { passive: true });
  top.addEventListener("focusin", function () { top.classList.remove("is-hidden"); });

  // Photos and blocks of text fade in once as they come into view
  var revealItems = document.querySelectorAll(".work .shot, .build .shot, .about__img, .about__text, .services__head, .work__head, .chapter__head, .work__note, .build__intro, .build__cols > div, .stage, .contact__main > div, .contact__foot");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealItems.forEach(function (el) { el.classList.add("reveal"); observer.observe(el); });
    // The four services draw their rules and bring in their text one after another
    document.querySelectorAll(".services__list").forEach(function (el) { el.classList.add("will-draw"); observer.observe(el); });
  }

  // Scope of works: a click opens the four lists together and a second click closes them.
  // On a phone, where the services sit one under another, each opens on its own.
  var scopeToggles = document.querySelectorAll(".scope__toggle");
  scopeToggles.forEach(function (button) {
    button.addEventListener("click", function () {
      var open = !button.closest("li").classList.contains("is-open");
      var group = window.matchMedia("(max-width: 560px)").matches ? [button] : scopeToggles;
      group.forEach(function (b) {
        b.closest("li").classList.toggle("is-open", open);
        b.setAttribute("aria-expanded", String(open));
      });
    });
  });

  // The email address is put together here, so it is not in the page source for spam robots to collect
  document.querySelectorAll("[data-mail]").forEach(function (a) {
    var address = a.dataset.mail + "@" + a.dataset.host;
    a.href = "mailto:" + address;
    a.textContent = address;
  });

  // The year in the footer keeps itself current
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Photo viewer: steps through the photos of the group that was opened
  var viewer = document.getElementById("viewer");
  var viewerImg = document.getElementById("viewer-img");
  var set = [];
  var index = 0;

  function show(i) {
    index = (i + set.length) % set.length;
    viewerImg.classList.remove("is-ready");
    viewerImg.src = set[index].dataset.full;
    viewerImg.alt = set[index].querySelector("img").alt;
    if (viewerImg.complete) viewerImg.classList.add("is-ready");
  }
  viewerImg.addEventListener("load", function () { viewerImg.classList.add("is-ready"); });

  document.querySelectorAll(".shot").forEach(function (shot) {
    shot.addEventListener("click", function () {
      set = Array.prototype.slice.call(shot.closest(".work, .build").querySelectorAll(".shot"));
      show(set.indexOf(shot));
      viewer.showModal();
    });
  });

  viewer.addEventListener("click", function (e) {
    var step = e.target.closest("[data-step]");
    if (step) { show(index + Number(step.dataset.step)); return; }
    if (e.target === viewer || e.target.closest("[data-close]") || e.target.tagName === "FIGURE") viewer.close();
  });

  // Swipe left or right on a touch screen to change photo
  var touchX = null;
  viewer.addEventListener("touchstart", function (e) { touchX = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive: true });
  viewer.addEventListener("touchend", function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
  });

  viewer.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") show(index + 1);
    if (e.key === "ArrowLeft") show(index - 1);
  });
})();
