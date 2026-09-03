export function init_nav() {
  const bar = document.getElementById('nav-pill-bar');
  if (!bar) return;
  const bubble = document.getElementById('nav-bubble');
  const links = bar.querySelectorAll('.tl');
  if (!links.length || !bubble) return;

  function set_bubble(el) {
    links.forEach(l => l.classList.remove('active'));
    el.classList.add('active');

    const barRect = bar.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const x = elRect.left - barRect.left;
    const w = elRect.width;

    bubble.style.width = `${w}px`;
    bubble.style.transform = `translateX(${x}px)`;
    bubble.style.opacity = '1';
  }

  links.forEach(l => {
    l.addEventListener('mouseenter', () => set_bubble(l));
    l.addEventListener('click', (e) => {
      const href = l.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        set_bubble(l);
        const target = document.querySelector(href);
        if (target) {
          const y = target.getBoundingClientRect().top + window.pageYOffset - 110;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }
    });
  });

  bar.addEventListener('mouseleave', () => {
    update_scrollspy();
  });

  function update_scrollspy() {
    const scrollPos = window.scrollY + 200;
    const s_serv = document.getElementById('services');
    const s_proj = document.getElementById('project');
    const s_cryp = document.getElementById('crypto');

    let current = links[0];
    if (s_cryp && scrollPos >= s_cryp.offsetTop) {
      current = bar.querySelector('a[href="#crypto"]') || current;
    } else if (s_proj && scrollPos >= s_proj.offsetTop) {
      current = bar.querySelector('a[href="#project"]') || current;
    } else if (s_serv && scrollPos >= s_serv.offsetTop) {
      current = bar.querySelector('a[href="#services"]') || current;
    }
    set_bubble(current);
  }

  const navWrap = document.querySelector('.top-nav-wrap');
  function check_dock_scroll() {
    if (navWrap) {
      if (window.scrollY > 30) {
        navWrap.classList.add('scrolled');
      } else {
        navWrap.classList.remove('scrolled');
      }
    }
  }

  window.addEventListener('scroll', () => {
    update_scrollspy();
    check_dock_scroll();
  }, { passive: true });

  setTimeout(() => {
    update_scrollspy();
    check_dock_scroll();
  }, 150);

  window.addEventListener('resize', () => {
    const cur = bar.querySelector('.tl.active') || links[0];
    if (cur) set_bubble(cur);
  });
}
