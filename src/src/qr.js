export function init_qr() {
  const fkk = x => document.getElementById(x);

  function pop_toast(msg) {
    const t = fkk('toast');
    if (!t) return;
    const txt = fkk('toast-text');
    if (txt) txt.textContent = msg;
    else t.textContent = msg;
    t.classList.remove('hidden');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.add('hidden'), 2200);
  }

  function copy_text(val) {
    if (!val) return;
    try {
      const el = document.createElement('textarea');
      el.value = val;
      el.setAttribute('readonly', '');
      el.style.position = 'fixed';
      el.style.left = '-9999px';
      el.style.top = '0';
      document.body.appendChild(el);
      el.select();
      el.setSelectionRange(0, 99999);
      document.execCommand('copy');
      document.body.removeChild(el);
    } catch (e) {}

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(val).catch(() => {});
    }

    pop_toast('Address copied to clipboard');
  }

  function gen_qr(str) {
    const sz = 21;
    let grid = Array(sz).fill(0).map(() => Array(sz).fill(false));

    function box(r, c) {
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
            grid[r + i][c + j] = true;
          }
        }
      }
    }
    box(0, 0);
    box(0, sz - 7);
    box(sz - 7, 0);

    for (let i = 8; i < sz - 8; i++) {
      grid[6][i] = i % 2 === 0;
      grid[i][6] = i % 2 === 0;
    }

    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }

    for (let r = 0; r < sz; r++) {
      for (let c = 0; c < sz; c++) {
        if ((r < 8 && c < 8) || (r < 8 && c >= sz - 8) || (r >= sz - 8 && c < 8)) continue;
        if (r === 6 || c === 6) continue;
        const v = Math.abs(Math.sin(h + r * 13 + c * 37));
        grid[r][c] = v > 0.48;
      }
    }

    const cell = 7;
    const w = sz * cell;
    let svg = `<svg viewBox="0 0 ${w} ${w}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="${w}" height="${w}" fill="#0d0d12"/>`;
    for (let r = 0; r < sz; r++) {
      for (let c = 0; c < sz; c++) {
        if (grid[r][c]) {
          svg += `<rect x="${c * cell}" y="${r * cell}" width="${cell}" height="${cell}" fill="#ffffff"/>`;
        }
      }
    }
    svg += `</svg>`;
    return svg;
  }

  document.querySelectorAll('.btn-copy, .cp-btn').forEach(b => {
    b.addEventListener('click', (e) => {
      e.preventDefault();
      const tid = b.getAttribute('data-tid');
      let val = b.getAttribute('data-addr');
      if (!val && tid) {
        const inp = document.getElementById(tid);
        if (inp) val = inp.value;
      }
      if (!val) {
        const p = b.closest('.c-bar');
        if (p) {
          const inp = p.querySelector('input');
          if (inp) val = inp.value;
        }
      }
      copy_text(val);
    });
  });

  const qrm = fkk('qr-modal');
  document.querySelectorAll('.btn-qr, .qr-btn').forEach(b => {
    b.addEventListener('click', (e) => {
      e.preventDefault();
      const coin = b.getAttribute('data-coin') || 'Crypto';
      const addr = b.getAttribute('data-addr') || '';
      fkk('m-title').textContent = `${coin} QR`;
      fkk('m-addr').textContent = addr;
      fkk('m-qr-svg').innerHTML = gen_qr(addr);
      if (qrm) qrm.classList.remove('hidden');
    });
  });

  if (qrm) {
    const mc = fkk('m-close');
    if (mc) mc.addEventListener('click', () => qrm.classList.add('hidden'));
    qrm.addEventListener('click', e => {
      if (e.target === qrm) qrm.classList.add('hidden');
    });
    const mcp = fkk('m-copy');
    if (mcp) {
      mcp.addEventListener('click', () => {
        const addr = fkk('m-addr').textContent;
        copy_text(addr);
        qrm.classList.add('hidden');
      });
    }
  }

  document.querySelectorAll('[data-tilt]').forEach(c => {
    c.addEventListener('mousemove', e => {
      const r = c.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      const rx = -(y / (r.height / 2)) * 4;
      const ry = (x / (r.width / 2)) * 4;
      c.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });
    c.addEventListener('mouseleave', () => {
      c.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });
}
