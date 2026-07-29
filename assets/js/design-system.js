(function(){
  /* ---- navbar: transparente → sólida no scroll (ref. artefacto) ---- */
  var header = document.getElementById('siteHeader');
  function onScroll(){
    if(window.scrollY > 60){ header.classList.add('site-header--fixed'); }
    else{ header.classList.remove('site-header--fixed'); }
  }
  document.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* ---- mobile nav toggle ---- */
  var toggle = document.getElementById('navToggle');
  var navList = document.getElementById('navList');
  toggle.addEventListener('click', function(){
    var open = navList.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  navList.querySelectorAll('.nav-link').forEach(function(l){
    l.addEventListener('click', function(){ navList.classList.remove('is-open'); });
  });

  /* ---- reveal engine (IntersectionObserver, ref. pollus .js-animation + instagram-slides) ---- */
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, {threshold:.18, rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.js-animation,[data-reveal]').forEach(function(el){ io.observe(el); });

  /* ---- hero: micro-parallax no mousemove (só desktop com mouse fino,
     respeita prefers-reduced-motion) — vídeo/conteúdo reagem em profundidades
     diferentes via --px/--py, consumidos no CSS de cada página ---- */
  var heroEl = document.querySelector('.hero');
  var wantsMotion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasFinePointer = window.matchMedia('(pointer:fine)').matches;
  if(heroEl && wantsMotion && hasFinePointer){
    var heroRAF = null, heroPX = 0, heroPY = 0;
    heroEl.addEventListener('mousemove', function(e){
      var r = heroEl.getBoundingClientRect();
      heroPX = ((e.clientX - r.left) / r.width - .5) * 2;
      heroPY = ((e.clientY - r.top) / r.height - .5) * 2;
      if(!heroRAF){
        heroRAF = requestAnimationFrame(function(){
          heroEl.style.setProperty('--px', heroPX.toFixed(3));
          heroEl.style.setProperty('--py', heroPY.toFixed(3));
          heroRAF = null;
        });
      }
    });
    heroEl.addEventListener('mouseleave', function(){
      heroEl.style.setProperty('--px', 0);
      heroEl.style.setProperty('--py', 0);
    });
  }

  /* ---- seletor de cor: troca a imagem do produto ---- */
  var swatchRow = document.getElementById('swatchRow');
  var stageImgs = document.querySelectorAll('.color-swatch-img');
  var nameEl = document.getElementById('swatchName');
  var codeEl = document.getElementById('swatchCode');
  if(swatchRow){
    swatchRow.addEventListener('click', function(e){
      var btn = e.target.closest('.swatch');
      if(!btn) return;
      swatchRow.querySelectorAll('.swatch').forEach(function(s){ s.classList.remove('is-active'); });
      btn.classList.add('is-active');
      var color = btn.getAttribute('data-color');
      stageImgs.forEach(function(img){
        img.classList.toggle('is-active', img.getAttribute('data-color') === color);
      });
      nameEl.textContent = btn.getAttribute('data-name');
      codeEl.textContent = btn.getAttribute('data-code');
    });
  }

  /* ---- viewer 3D: arraste para girar (ref. meucentury 360°) ---- */
  var viewer = document.getElementById('viewer3dEl');
  if(viewer){
    var product = document.getElementById('viewer3dImg');
    var shadow = document.getElementById('viewer3dShadow');
    var autoBtn = document.getElementById('autoRotateBtn');
    var resetBtn = document.getElementById('resetViewBtn');
    var ry = 8, autoAngle = 0, autoRotate = true, dragging = false, startX = 0, startRy = 0;

    function applyRotation(){
      var clamped = Math.max(-45, Math.min(45, ry));
      product.style.setProperty('--ry', clamped + 'deg');
      shadow.style.setProperty('--shadow-scale', (1 - Math.abs(clamped)/120).toFixed(2));
    }

    function tick(){
      if(autoRotate && !dragging){
        autoAngle += 0.35;
        ry = Math.sin(autoAngle * Math.PI/180) * 16;
        applyRotation();
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    function pointerDown(x){
      dragging = true; startX = x; startRy = ry;
      viewer.classList.add('is-dragging','is-interacted');
    }
    function pointerMove(x){
      if(!dragging) return;
      ry = startRy + (x - startX) * 0.35;
      applyRotation();
    }
    function pointerUp(){ dragging = false; viewer.classList.remove('is-dragging'); }

    viewer.addEventListener('mousedown', function(e){ pointerDown(e.clientX); });
    window.addEventListener('mousemove', function(e){ pointerMove(e.clientX); });
    window.addEventListener('mouseup', pointerUp);
    viewer.addEventListener('touchstart', function(e){ pointerDown(e.touches[0].clientX); viewer.classList.add('is-interacted'); }, {passive:true});
    viewer.addEventListener('touchmove', function(e){ pointerMove(e.touches[0].clientX); }, {passive:true});
    viewer.addEventListener('touchend', pointerUp);

    autoBtn.addEventListener('click', function(){
      autoRotate = !autoRotate;
      autoBtn.classList.toggle('is-active', autoRotate);
      autoBtn.setAttribute('aria-pressed', autoRotate ? 'true':'false');
    });
    resetBtn.addEventListener('click', function(){
      ry = 0; autoAngle = 0; applyRotation();
    });
  }

  /* ---- modal ---- */
  var openBtn = document.getElementById('openModalBtn');
  var backdrop = document.getElementById('modalBackdrop');
  var closeBtn = document.getElementById('modalClose');
  function openModal(){ backdrop.classList.add('is-open'); document.body.style.overflow='hidden'; }
  function closeModal(){ backdrop.classList.remove('is-open'); document.body.style.overflow=''; }
  if(openBtn){
    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', function(e){ if(e.target === backdrop) closeModal(); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeModal(); });
  }

  /* ---- glow que segue o mouse nos cards de vidro ---- */
  document.querySelectorAll('.card--glass').forEach(function(card){
    card.addEventListener('mousemove', function(e){
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left)/r.width*100) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top)/r.height*100) + '%');
    });
  });
})();
