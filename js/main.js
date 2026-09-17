// =========================================================
// Colégio Cristo Rei — comportamento compartilhado do site
// =========================================================
document.addEventListener('DOMContentLoaded', () => {

  // header shrink on scroll
  const header = document.getElementById('siteHeader');
  if(header){
    window.addEventListener('scroll', () => {
      if(window.scrollY > 12){ header.classList.add('scrolled'); }
      else { header.classList.remove('scrolled'); }
    });
  }

  // mobile menu toggle
  const burger = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if(burger && mobileMenu){
    burger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.remove('open')));
  }

  // reveal on scroll — elementos que dividem o mesmo pai (cards de uma
  // grade, fotos da galeria, itens da timeline etc.) ganham um pequeno
  // atraso crescente para aparecerem em cascata, um depois do outro.
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  const siblingIndex = new Map();
  revealEls.forEach(el => {
    const parent = el.parentElement;
    const i = siblingIndex.get(parent) || 0;
    if(i > 0){ el.style.transitionDelay = (Math.min(i, 6) * 90) + 'ms'; }
    siblingIndex.set(parent, i + 1);
  });

  if('IntersectionObserver' in window && revealEls.length){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        entry.target.classList.toggle('in', entry.isIntersecting);
      });
    }, {threshold:0.15, rootMargin:'0px 0px -40px 0px'});
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  // animated counters
  const counters = document.querySelectorAll('[data-count]');
  if('IntersectionObserver' in window && counters.length){
    const counterIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-count'), 10);
          const duration = 1400;
          const start = performance.now();
          function tick(now){
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.floor(eased * target);
            if(p < 1){ requestAnimationFrame(tick); } else { el.textContent = target; }
          }
          requestAnimationFrame(tick);
          counterIO.unobserve(el);
        }
      });
    }, {threshold:0.4});
    counters.forEach(el => counterIO.observe(el));
  }

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    if(!q) return;
    q.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if(!wasOpen){ item.classList.add('open'); }
    });
  });

  // ---------------------------------------------------------------
  // "Corredor" 3D de fotos — duas fileiras de cards vindo do fundo
  // em direção à tela, com perspectiva. Portado para JS puro (sem
  // React/Spline) a partir da lógica de projeção: cada card cresce
  // geometricamente conforme se aproxima, e as fileiras abrem para
  // os lados a partir do centro.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function buildStreamKeyframes(dir, name, p){
    const steps = [];
    for(let s = 0; s <= p.stops; s++){
      const u = s / p.stops;
      const scale = (p.birthHeight / p.cardHeight) * Math.pow(p.exitHeight / p.birthHeight, u);
      const z = p.perspective * (1 - 1 / scale);
      const rail = p.railExit - (p.railExit - p.railBirth) * Math.pow(1 - u, p.fan);
      const turn = p.turnBirth + (p.turnExit - p.turnBirth) * u;
      steps.push(`${(u * 100).toFixed(2)}%{transform:translate3d(${(dir * rail).toFixed(2)}cqw,0,${z.toFixed(2)}cqw) rotateY(${(-dir * turn).toFixed(2)}deg)}`);
    }
    return `@keyframes ${name}{${steps.join('')}}`;
  }

  function initImageStream(container, images, opts){
    if(!container || !images.length) return;
    const p = Object.assign({
      perspective:30, cardWidth:20, cardHeight:26, cardRadius:0.7,
      birthHeight:2.8, exitHeight:48, railBirth:-11, railExit:44,
      fan:3.3, turnBirth:6, turnExit:28, stops:24
    }, opts.path || {});
    const cards = opts.cards || 8;
    const speed = opts.speed || 16;
    const axis = opts.axis || 52;
    const id = 'is' + Math.random().toString(36).slice(2, 9);
    const rightName = 'isr-' + id, leftName = 'isl-' + id, cardClass = 'iscard-' + id;

    const styleEl = document.createElement('style');
    styleEl.textContent = buildStreamKeyframes(1, rightName, p) + buildStreamKeyframes(-1, leftName, p) +
      `.${cardClass}{position:absolute;left:50%;top:${axis}%;width:${p.cardWidth}cqw;height:${p.cardHeight}cqw;` +
      `margin-left:${-p.cardWidth / 2}cqw;margin-top:${-p.cardHeight / 2}cqw;border-radius:${p.cardRadius}cqw;` +
      `overflow:hidden;backface-visibility:hidden;box-shadow:0 20px 40px -20px rgba(0,0,0,.6);}` +
      `.${cardClass} img{width:100%;height:100%;object-fit:cover;display:block;}` +
      `@media(prefers-reduced-motion:reduce){.${cardClass}{animation-play-state:paused;}}`;
    document.head.appendChild(styleEl);

    container.style.containerType = 'inline-size';

    const stage = document.createElement('div');
    stage.setAttribute('aria-hidden', 'true');
    stage.style.cssText = `position:absolute;inset:0;pointer-events:none;perspective:${p.perspective}cqw;perspective-origin:50% ${axis}%;`;

    const inner = document.createElement('div');
    inner.style.cssText = 'position:absolute;inset:0;transform-style:preserve-3d;';

    [rightName, leftName].forEach((name) => {
      for(let i = 0; i < cards; i++){
        const img = images[i % images.length];
        const card = document.createElement('div');
        card.className = cardClass;
        card.style.animation = reduceMotion ? 'none' : `${name} ${speed}s linear infinite`;
        card.style.animationDelay = (-(i * speed) / cards) + 's';
        if(reduceMotion){
          const u = (i / cards);
          const scale = (p.birthHeight / p.cardHeight) * Math.pow(p.exitHeight / p.birthHeight, u);
          const z = p.perspective * (1 - 1 / scale);
          const dir = name === rightName ? 1 : -1;
          const rail = p.railExit - (p.railExit - p.railBirth) * Math.pow(1 - u, p.fan);
          const turn = p.turnBirth + (p.turnExit - p.turnBirth) * u;
          card.style.transform = `translate3d(${(dir * rail).toFixed(2)}cqw,0,${z.toFixed(2)}cqw) rotateY(${(-dir * turn).toFixed(2)}deg)`;
        }
        const im = document.createElement('img');
        im.src = img.src; im.alt = img.alt || ''; im.loading = 'lazy'; im.decoding = 'async';
        card.appendChild(im);
        inner.appendChild(card);
      }
    });

    stage.appendChild(inner);
    container.appendChild(stage);
  }

  const streamContainer = document.getElementById('schoolStream');
  if(streamContainer){
    const base = 'https://cristoreieduca.com.br/wp-content/uploads/2020/12/';
    initImageStream(streamContainer, [
      {src: base + 'Ensino-Fundamental-I-7-scaled.jpg', alt:'Ensino Fundamental'},
      {src: base + 'Educacao-Infantil-22-scaled.jpg', alt:'Educação Infantil'},
      {src: base + 'Ensino-Fundamental-II-4-scaled.jpg', alt:'Ensino Fundamental II'},
      {src: base + 'Ensino-Fundamental-I-21-scaled.jpg', alt:'Ensino Fundamental'},
      {src: base + 'Ensino-Fundamental-II-25-scaled.jpg', alt:'Ensino Fundamental II'},
      {src: base + 'Educacao-Infantil-12-1-scaled.jpg', alt:'Educação Infantil'},
      {src: base + 'Educacao-Infantil-7-scaled.jpg', alt:'Educação Infantil'},
      {src: base + 'Ensino-Fundamental-I-8-scaled.jpg', alt:'Ensino Fundamental'}
    ], {cards:8, speed:16, axis:52});
  }

});
