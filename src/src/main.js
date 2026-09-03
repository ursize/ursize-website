import { init_canvas } from './canvas.js';
import { init_audio } from './audio.js';
import { init_discord } from './discord.js';
import { init_timezone } from './timezone.js';
import { init_timer } from './timer.js';
import { init_qr } from './qr.js';
import { init_nav } from './nav.js';
import { init_fx } from './fx.js';
import { init_views } from './views.js';


document.addEventListener('DOMContentLoaded', () => {
  init_canvas();
  init_audio();
  init_discord();
  init_timezone();
  init_timer();
  init_qr();
  init_nav();
  init_fx();
  init_views();


  const b_btn = document.getElementById('burger-btn');
  const m_drw = document.getElementById('mob-drawer');
  if (b_btn && m_drw) {
    b_btn.addEventListener('click', () => {
      m_drw.classList.toggle('hidden');
      b_btn.classList.toggle('open');
    });
    document.querySelectorAll('.mob-link').forEach(l => {
      l.addEventListener('click', () => {
        m_drw.classList.add('hidden');
        b_btn.classList.remove('open');
      });
    });
  }
});
