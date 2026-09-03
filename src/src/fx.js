export function init_fx() {
  const statExp = document.getElementById('stat-exp');
  const statSafe = document.getElementById('stat-safe');
  const statYear = document.getElementById('stat-year');

  function animate_num(el, start, target, suffix, duration, delay) {
    if (!el) return;
    setTimeout(() => {
      const startTime = performance.now();
      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(1, elapsed / duration);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (target - start) * ease);
        el.textContent = current + suffix;
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = target + suffix;
        }
      }
      requestAnimationFrame(update);
    }, delay);
  }

  animate_num(statExp, 0, 2, ' yrs', 1100, 300);
  animate_num(statSafe, 0, 100, '%', 1400, 450);
  animate_num(statYear, 2020, 2027, '', 1600, 600);

  const tiltCards = document.querySelectorAll('[data-tilt]');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;
      const shineX = (x / rect.width) * 100;
      const shineY = (y / rect.height) * 100;

      card.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
      card.style.setProperty('--shine-x', `${shineX.toFixed(1)}%`);
      card.style.setProperty('--shine-y', `${shineY.toFixed(1)}%`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)';
      card.style.setProperty('--shine-x', '50%');
      card.style.setProperty('--shine-y', '50%');
    });
  });

  let lastY = window.scrollY;
  let vel = 0;
  let dVel = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    vel = y - lastY;
    lastY = y;
  }, { passive: true });

  const bCards = document.querySelectorAll('.glass-card, .project-box, .c-card, .service-card, .views-pill');
  function bLoop() {
    dVel += (vel - dVel) * 0.12;
    vel *= 0.86;
    const str = Math.max(-0.025, Math.min(0.025, dVel * 0.0008));
    if (Math.abs(str) > 0.0003) {
      bCards.forEach(c => {
        if (!c.hasAttribute('data-tilt') || !c.matches(':hover')) {
          c.style.transform = `scale(${1 - str * 0.4}, ${1 + str}) translateY(${-dVel * 0.06}px)`;
        }
      });
    } else {
      bCards.forEach(c => {
        if (!c.hasAttribute('data-tilt') && c.style.transform) {
          c.style.transform = '';
        }
      });
    }
    requestAnimationFrame(bLoop);
  }
  bLoop();

  const io = new IntersectionObserver(ents => {
    ents.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('bubbly-show');
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.sec-wrap, .project-box, .grid-crypto, .services-grid').forEach(el => {
    el.classList.add('bubbly-reveal');
    io.observe(el);
  });
}
