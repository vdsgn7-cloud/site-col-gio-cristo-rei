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

  // reveal on scroll
  const revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && revealEls.length){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, {threshold:0.15});
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

});
