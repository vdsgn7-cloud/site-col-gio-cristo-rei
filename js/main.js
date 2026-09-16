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
        if(entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
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

  // carrossel de fotos — troca automática com crossfade, pausa no hover
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.carousel').forEach(carousel => {
    const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
    const dots = Array.from(carousel.querySelectorAll('.carousel-dots .dot'));
    if(slides.length < 2) return;
    let current = Math.max(slides.findIndex(s => s.classList.contains('is-active')), 0);
    let timer = null;

    function goTo(index){
      slides[current].classList.remove('is-active');
      if(dots[current]) dots[current].classList.remove('is-active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('is-active');
      if(dots[current]) dots[current].classList.add('is-active');
    }
    function start(){
      if(reduceMotion) return;
      stop();
      timer = setInterval(() => goTo(current + 1), 4200);
    }
    function stop(){
      if(timer){ clearInterval(timer); timer = null; }
    }
    dots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); start(); }));
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    start();
  });

});
