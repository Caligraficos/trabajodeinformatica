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

/* Artículo 1 · mapa activo según la sección visible */
var a1Links=document.querySelectorAll(".a1-map-card");var a1Targets=Array.from(a1Links).map(function(link){return document.querySelector(link.getAttribute("href"));}).filter(Boolean);if("IntersectionObserver" in window&&a1Targets.length){var a1Observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){a1Links.forEach(function(link){link.classList.toggle("is-current",link.getAttribute("href")==="#"+entry.target.id);});}});},{rootMargin:"-18% 0px -68% 0px"});a1Targets.forEach(function(target){a1Observer.observe(target);});}

/* Contextual SVG icons for article 1 headings */

(function(){
 var map=document.querySelector(".article1-reading-map"); if(!map)return;
 var paths={
 brain:'<path d="M9 4.5a3 3 0 0 0-5.5 1.7A3.5 3.5 0 0 0 3 12a3.5 3.5 0 0 0 2.5 5.8A3 3 0 0 0 11 19V5a2 2 0 0 0-2-2"/><path d="M15 4.5a3 3 0 0 1 5.5 1.7A3.5 3.5 0 0 1 21 12a3.5 3.5 0 0 1-2.5 5.8A3 3 0 0 1 13 19V5a2 2 0 0 1 2-2"/>',
 screen:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4M7 8h10m-10 4h6"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 content:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8m-8 4h8m-8 4h5"/>',
 family:'<path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20"/><circle cx="10" cy="8" r="3.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7m1 3h1.5a3.5 3.5 0 0 1 2.5 3.3V20"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
 search:'<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/>',
 book:'<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z"/><path d="M4 5.5v14A2.5 2.5 0 0 1 6.5 17H20"/>',
 flask:'<path d="M9 3h6m-5 0v6l-5.5 9.2A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-2.8L14 9V3"/><path d="M8 15h8"/>',
 chart:'<path d="M4 19.5h16"/><path d="M6.5 16V10m5.5 6V5m5.5 11v-8"/>',
 light:'<path d="M9 18h6m-5 3h4m-2-20a7 7 0 0 0-4.2 12.6c.8.6 1.2 1.3 1.2 2.4h6c0-1.1.4-1.8 1.2-2.4A7 7 0 0 0 12 1z"/>',
 scale:'<path d="M12 3v18m-7-15h14M5 6l-3 6h6L5 6zm14 0-3 6h6l-3-6zM8 21h8"/>',
 clipboard:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5h6V7H9zM8 11h8m-8 4h8"/>'
 };
 function choose(t){t=t.toLowerCase();
 if(/salud mental|emocion|socioemocional|comportamiento|desarrollo infantil/.test(t))return "brain";
 if(/pantalla|plataforma|digital|dispositivo/.test(t))return "screen";
 if(/tiempo|sueño|hábito|descanso/.test(t))return "clock";
 if(/contenido/.test(t))return "content";
 if(/padres|familia|hogar|acompañamiento|docentes|instituciones/.test(t))return "family";
 if(/objetivo|propósito|formulación/.test(t))return "target";
 if(/problema|pregunta/.test(t))return "search";
 if(/antecedente|teórica|contrastación|referencia/.test(t))return "book";
 if(/investigación|metodología|técnica|instrumento|proceso|recolección/.test(t))return "flask";
 if(/resultado|dato|cifra|síntesis|estadístic/.test(t))return "chart";
 if(/conclusión|recomendación|justificación/.test(t))return "light";
 if(/variable/.test(t))return "scale"; return "clipboard";
 }
 document.querySelectorAll(".doc h2,.doc h3,.doc h4").forEach(function(h){
 if(h.closest(".article1-reading-map")||h.querySelector(".a1-heading-icon,.a1-title-icon"))return;
 var span=document.createElement("span");span.className="a1-title-icon";span.setAttribute("aria-hidden","true");
 span.innerHTML='<svg viewBox="0 0 24 24">'+paths[choose(h.textContent||"")]+'</svg>';h.insertBefore(span,h.firstChild);
 });
})();
