(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fmt = function (n, dec) {
    return new Intl.NumberFormat("es-VE", {
      minimumFractionDigits: dec, maximumFractionDigits: dec
    }).format(n);
  };

  var boards=document.querySelectorAll(".insight-board");
  if("IntersectionObserver" in window){var bo=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");bo.unobserve(e.target);}});},{threshold:.15});boards.forEach(function(b){bo.observe(b);});}else{boards.forEach(function(b){b.classList.add("in");});}

  /* Resaltar conceptos clave sin modificar el texto académico */
  function markKeywords(root) {
    var terms = [
      "mediación activa","control parental","brecha digital","contratos digitales familiares",
      "realidad virtual","salud mental","plataformas digitales","niños de 2 a 8 años",
      "tiempo de pantalla","desarrollo socioemocional","dolor procedimental","distracción cognitiva",
      "ansiedad anticipatoria","analgesia no farmacológica","seguridad virtual","orientación pedagógica",
      "confianza intrafamiliar","ciberacoso","privacidad","acompañamiento adulto"
    ];
    var pattern = new RegExp("(" + terms.sort(function(a,b){return b.length-a.length;}).join("|") + ")", "gi");
    root.querySelectorAll(".doc p").forEach(function(p){
      if(p.closest(".abstract-full")) return;
      var walker=document.createTreeWalker(p,NodeFilter.SHOW_TEXT);
      var nodes=[];
      while(walker.nextNode()){
        var node=walker.currentNode;
        if(!node.parentElement || node.parentElement.closest("strong,b,a,em,.keyword-mark,code")) continue;
        pattern.lastIndex=0;
        if(pattern.test(node.nodeValue)) nodes.push(node);
      }
      nodes.forEach(function(node){
        pattern.lastIndex=0;
        var value=node.nodeValue, frag=document.createDocumentFragment(), last=0, match;
        while((match=pattern.exec(value))!==null){
          if(match.index>last) frag.appendChild(document.createTextNode(value.slice(last,match.index)));
          var mark=document.createElement("strong");
          mark.className="keyword-mark";
          mark.textContent=match[0];
          frag.appendChild(mark);
          last=pattern.lastIndex;
        }
        if(last<value.length) frag.appendChild(document.createTextNode(value.slice(last)));
        if(last>0) node.parentNode.replaceChild(frag,node);
      });
    });
  }
  var docRoot=document.querySelector(".doc"); if(docRoot) markKeywords(docRoot);

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
    if (el.getAttribute("data-counted") === "true") return;
    el.setAttribute("data-counted", "true");
    var to = parseFloat(el.getAttribute("data-to"));
    var dec = parseInt(el.getAttribute("data-dec") || "0", 10);
    var sign = el.getAttribute("data-sign") === "-" ? "−" : "";
    var suffix = el.getAttribute("data-suffix") || "";
    var from = parseFloat(el.getAttribute("data-from") || "0");
    if (reduce) { el.textContent = sign + fmt(to, dec) + suffix; return; }
    var start = null, dur = 950;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 4);
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


  document.querySelectorAll("table[data-sortable]").forEach(function(table){
    table.querySelectorAll("thead button[data-sort]").forEach(function(btn){btn.addEventListener("click",function(){
      var col=Number(btn.getAttribute("data-sort"));var dir=btn.getAttribute("data-dir")==="asc"?"desc":"asc";
      table.querySelectorAll("thead button[data-sort]").forEach(function(b){b.removeAttribute("data-dir");});btn.setAttribute("data-dir",dir);
      var body=table.tBodies[0];Array.from(body.rows).sort(function(a,b){
        var av=a.cells[col].getAttribute("data-value")||a.cells[col].textContent.trim();var bv=b.cells[col].getAttribute("data-value")||b.cells[col].textContent.trim();
        var an=Number(av.replace(/[^0-9,.-]/g,"").replace(",","."));var bn=Number(bv.replace(/[^0-9,.-]/g,"").replace(",","."));
        var numeric=av!==""&&bv!==""&&!Number.isNaN(an)&&!Number.isNaN(bn);var cmp=numeric?an-bn:av.localeCompare(bv,"es",{numeric:true,sensitivity:"base"});return dir==="asc"?cmp:-cmp;
      }).forEach(function(row){body.appendChild(row);});
    });});
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

/* Realce de la sección activa en el mapa de lectura */
var mapLinks=document.querySelectorAll(".vr-map-card");var mapTargets=Array.from(mapLinks).map(function(link){return document.querySelector(link.getAttribute("href"));}).filter(Boolean);if("IntersectionObserver" in window&&mapTargets.length){var mapObserver=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){mapLinks.forEach(function(link){link.classList.toggle("is-current",link.getAttribute("href")==="#"+entry.target.id);});}});},{rootMargin:"-18% 0px -68% 0px"});mapTargets.forEach(function(target){mapObserver.observe(target);});}
