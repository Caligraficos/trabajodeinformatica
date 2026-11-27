(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fmt = function (n, dec) {
    return new Intl.NumberFormat("es-VE", {
      minimumFractionDigits: dec, maximumFractionDigits: dec
    }).format(n);
  };

  var boards=document.querySelectorAll(".insight-board");
  if("IntersectionObserver" in window){var bo=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");bo.unobserve(e.target);}});},{threshold:.15});boards.forEach(function(b){bo.observe(b);});}else{boards.forEach(function(b){b.classList.add("in");});}
  /* Barra de progreso de lectura */
  var bar = document.querySelector(".progress");
  function onScroll() {
    if (!bar) return;
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Contador animado para números */
  function countUp(el) {
    var to = parseFloat(el.getAttribute("data-to"));
    var dec = parseInt(el.getAttribute("data-dec") || "0", 10);
    var sign = el.getAttribute("data-sign") === "-" ? "−" : "";
    var suffix = el.getAttribute("data-suffix") || "";
    var from = parseFloat(el.getAttribute("data-from") || "0");
    if (reduce) { el.textContent = sign + fmt(to, dec) + suffix; return; }
    var start = null, dur = 1600;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var v = from + (to - from) * eased;
      el.textContent = sign + fmt(Math.abs(v), dec) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      el.classList.add("in");
      el.querySelectorAll && el.querySelectorAll("[data-to]").forEach(countUp);
      if (el.matches && el.matches("[data-to]")) countUp(el);
      io.unobserve(el);
    });
  }, { threshold: 0.25 });

  document.querySelectorAll(".reveal, .hl, .stat, .bars, [data-to]").forEach(function (el) {
    io.observe(el);
  });

  /* Pestañas */
  document.querySelectorAll("[data-tabs]").forEach(function (wrap) {
    var btns = wrap.querySelectorAll(".tab-btn");
    var panels = wrap.querySelectorAll(".tab-panel");
    btns.forEach(function (btn, i) {
      btn.addEventListener("click", function () {
        btns.forEach(function (b) { b.setAttribute("aria-selected", "false"); });
        panels.forEach(function (p) { p.hidden = true; });
        btn.setAttribute("aria-selected", "true");
        panels[i].hidden = false;
        panels[i].style.animation = "none";
        panels[i].offsetHeight; // reinicia la animación
        panels[i].style.animation = "";
      });
    });
  });

  /* Progreso de la lista de recomendaciones */
  document.querySelectorAll("[data-checklist]").forEach(function (list) {
    var boxes = list.querySelectorAll("input[type=checkbox]");
    var out = document.querySelector("[data-checklist-count]");
    function update() {
      var n = 0;
      boxes.forEach(function (b) { if (b.checked) n++; });
      if (out) out.textContent = n + " de " + boxes.length + " compromisos marcados";
    }
    boxes.forEach(function (b) { b.addEventListener("change", update); });
    update();
  });
})();
