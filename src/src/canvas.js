export function init_canvas() {
  const cvs = document.getElementById('bg-canvas');
  if (!cvs) return;
  const ctx = cvs.getContext('2d');

  let W = 0, H = 0, dpr = 1;
  let ptr = { x: -3000, y: -3000, tx: -3000, ty: -3000, vx: 0, vy: 0 };
  let time = 0;
  let ripples = [];
  let sparks = [];
  let bubbles = [];
  let nodes = [];

  const GRID = 52;

  class Ripple {
    constructor(x, y, col) {
      this.x = x; this.y = y;
      this.r = 0; this.maxR = 380;
      this.alpha = 1; this.speed = 7;
      this.col = col || '#facc15';
    }
    step() {
      this.r += this.speed + this.r * 0.018;
      this.alpha -= 0.022;
      return this.alpha > 0 && this.r < this.maxR;
    }
    draw(c) {
      c.save();
      c.beginPath();
      c.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      c.strokeStyle = this.col;
      c.globalAlpha = this.alpha * 0.6;
      c.lineWidth = 1.5;
      c.stroke();
      c.beginPath();
      c.arc(this.x, this.y, Math.max(0, this.r - 18), 0, Math.PI * 2);
      c.strokeStyle = this.col;
      c.globalAlpha = this.alpha * 0.25;
      c.lineWidth = 0.8;
      c.stroke();
      c.restore();
    }
  }

  class Spark {
    constructor(x, y) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 1.2 + Math.random() * 2.8;
      this.x = x; this.y = y;
      this.vx = Math.cos(ang) * spd;
      this.vy = Math.sin(ang) * spd;
      this.alpha = 0.8 + Math.random() * 0.2;
      this.r = 1.5 + Math.random() * 1.8;
      this.decay = 0.025 + Math.random() * 0.02;
      this.gold = Math.random() < 0.6;
    }
    step() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.04;
      this.vx *= 0.97;
      this.alpha -= this.decay;
      return this.alpha > 0;
    }
    draw(c) {
      c.save();
      c.globalAlpha = this.alpha;
      c.beginPath();
      c.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      c.fillStyle = this.gold ? '#facc15' : 'rgba(255,255,255,0.9)';
      c.shadowColor = this.gold ? '#facc15' : '#fff';
      c.shadowBlur = 8;
      c.fill();
      c.restore();
    }
  }

  class Bubble {
    constructor(x, y, r, vy) {
      this.x = x;
      this.y = y;
      this.r = r || (6 + Math.random() * 10);
      this.vy = vy || -(0.8 + Math.random() * 1.5);
      this.vx = (Math.random() - 0.5) * 0.45;
      this.wobble = Math.random() * Math.PI * 2;
      this.wobbleSpd = 0.02 + Math.random() * 0.025;
      this.alpha = 0.45 + Math.random() * 0.35;
      this.decay = 0.0035 + Math.random() * 0.004;
      this.gold = Math.random() < 0.28;
    }
    step() {
      this.wobble += this.wobbleSpd;
      this.x += this.vx + Math.sin(this.wobble) * 0.45;
      this.y += this.vy;
      this.alpha -= this.decay;
      return this.alpha > 0 && this.y > -60 && this.y < H + 60;
    }
    draw(c) {
      c.save();
      c.globalAlpha = Math.max(0, this.alpha);
      const bgGrad = c.createRadialGradient(
        this.x - this.r * 0.35, this.y - this.r * 0.35, 1,
        this.x, this.y, this.r
      );
      if (this.gold) {
        bgGrad.addColorStop(0, 'rgba(250,204,21,0.22)');
        bgGrad.addColorStop(0.6, 'rgba(250,204,21,0.06)');
        bgGrad.addColorStop(1, 'rgba(250,204,21,0.01)');
      } else {
        bgGrad.addColorStop(0, 'rgba(255,255,255,0.20)');
        bgGrad.addColorStop(0.6, 'rgba(255,255,255,0.05)');
        bgGrad.addColorStop(1, 'rgba(255,255,255,0.01)');
      }
      c.fillStyle = bgGrad;
      c.beginPath();
      c.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      c.fill();

      c.strokeStyle = this.gold ? 'rgba(250,204,21,0.45)' : 'rgba(255,255,255,0.38)';
      c.lineWidth = 1;
      c.stroke();

      c.beginPath();
      c.arc(this.x - this.r * 0.35, this.y - this.r * 0.35, Math.max(1, this.r * 0.24), 0, Math.PI * 2);
      c.fillStyle = '#ffffff';
      c.shadowColor = this.gold ? '#facc15' : '#ffffff';
      c.shadowBlur = 6;
      c.fill();

      c.beginPath();
      c.arc(this.x + this.r * 0.32, this.y + this.r * 0.32, Math.max(0.8, this.r * 0.16), 0, Math.PI * 2);
      c.fillStyle = this.gold ? 'rgba(250,204,21,0.5)' : 'rgba(255,255,255,0.45)';
      c.fill();
      c.restore();
    }
  }


  function rsz() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    cvs.width = Math.floor(W * dpr);
    cvs.height = Math.floor(H * dpr);
    cvs.style.width = W + 'px';
    cvs.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    nodes = [];
    const cols = Math.ceil(W / GRID) + 1;
    const rows = Math.ceil(H / GRID) + 1;
    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        nodes.push({
          bx: c * GRID,
          by: r * GRID,
          ox: 0, oy: 0,
          glow: 0,
          phase: Math.random() * Math.PI * 2,
          speed: 0.004 + Math.random() * 0.004
        });
      }
    }
  }

  window.addEventListener('resize', rsz);
  rsz();

  window.addEventListener('mousemove', e => {
    ptr.vx = e.clientX - ptr.tx;
    ptr.vy = e.clientY - ptr.ty;
    ptr.tx = e.clientX;
    ptr.ty = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    ptr.tx = -3000; ptr.ty = -3000;
  });

  let allowBubbles = true;
  fetch('/config.json').then(r => r.json()).then(c => {
    if (c?.bubbles === false) {
      allowBubbles = false;
      bubbles.length = 0;
    }
  }).catch(() => {});

  function spawnBubble(dir, speedFactor) {
    if (!allowBubbles) return;
    let bx;
    const side = Math.random();
    if (side < 0.45) bx = W * (0.02 + Math.random() * 0.16);
    else if (side < 0.90) bx = W * (0.82 + Math.random() * 0.16);
    else bx = W * (0.28 + Math.random() * 0.44);
    const by = dir > 0 ? H + 20 : -20;
    const vy = dir > 0 ? -(1.2 + Math.random() * 2.2) * speedFactor : (1.2 + Math.random() * 2.2) * speedFactor;
    const r = (Math.random() < 0.25 ? 12 + Math.random() * 8 : 5 + Math.random() * 7);
    bubbles.push(new Bubble(bx, by, r, vy));
  }

  for (let i = 0; i < 12; i++) {
    let bx;
    const side = Math.random();
    if (side < 0.45) bx = W * (0.03 + Math.random() * 0.16);
    else if (side < 0.90) bx = W * (0.81 + Math.random() * 0.16);
    else bx = W * (0.25 + Math.random() * 0.5);
    bubbles.push(new Bubble(bx, Math.random() * H, 5 + Math.random() * 9, -(0.4 + Math.random() * 0.8)));
  }

  let lastSY = window.scrollY;
  window.addEventListener('scroll', () => {
    if (!allowBubbles) return;
    const sy = window.scrollY;
    const dy = sy - lastSY;
    lastSY = sy;
    const count = Math.min(3, Math.floor(Math.abs(dy) * 0.15));
    for (let i = 0; i < count; i++) {
      spawnBubble(dy >= 0 ? 1 : -1, Math.min(1.8, 1 + Math.abs(dy) * 0.02));
    }
  }, { passive: true });


  window.addEventListener('click', e => {
    ripples.push(new Ripple(e.clientX, e.clientY, '#facc15'));
    setTimeout(() => ripples.push(new Ripple(e.clientX, e.clientY, 'rgba(255,255,255,0.7)')), 80);
    for (let i = 0; i < 14; i++) sparks.push(new Spark(e.clientX, e.clientY));
  });

  setTimeout(() => {
    ripples.push(new Ripple(W * 0.38, H * 0.40, '#facc15'));
  }, 180);
  setTimeout(() => {
    ripples.push(new Ripple(W * 0.38, H * 0.40, 'rgba(255,255,255,0.5)'));
    for (let i = 0; i < 8; i++) sparks.push(new Spark(W * 0.38, H * 0.40));
  }, 520);

  function draw_vignette() {
    const g = ctx.createRadialGradient(W * 0.5, H * 0.42, H * 0.1, W * 0.5, H * 0.42, H * 0.85);
    g.addColorStop(0, 'transparent');
    g.addColorStop(1, 'rgba(0,0,0,0.72)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function draw_aurora() {
    const ax = W * 0.5 + Math.cos(time * 0.18) * W * 0.22;
    const ay = H * 0.3 + Math.sin(time * 0.22) * H * 0.1;
    const g1 = ctx.createRadialGradient(ax, ay, 0, ax, ay, W * 0.55);
    g1.addColorStop(0, 'rgba(250,204,21,0.028)');
    g1.addColorStop(0.5, 'rgba(250,204,21,0.008)');
    g1.addColorStop(1, 'transparent');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);

    const bx = W * 0.72 + Math.cos(time * 0.14 + 2) * W * 0.12;
    const by = H * 0.6 + Math.sin(time * 0.17 + 1) * H * 0.12;
    const g2 = ctx.createRadialGradient(bx, by, 0, bx, by, W * 0.35);
    g2.addColorStop(0, 'rgba(99,102,241,0.018)');
    g2.addColorStop(1, 'transparent');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);
  }

  function draw_grid_and_nodes() {
    const proxR = 300;
    const tiltStr = 5;

    ctx.lineWidth = 0.5;

    for (let n of nodes) {
      const dx = n.bx - ptr.x;
      const dy = n.by - ptr.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const prox = dist < proxR ? (1 - dist / proxR) : 0;

      const ripPush = (() => {
        let rx = 0, ry = 0;
        for (let rp of ripples) {
          const rdx = n.bx - rp.x;
          const rdy = n.by - rp.y;
          const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
          const diff = Math.abs(rdist - rp.r);
          if (diff < 55) {
            const factor = (1 - diff / 55) * rp.alpha * 10;
            rx += (rdx / Math.max(1, rdist)) * factor;
            ry += (rdy / Math.max(1, rdist)) * factor;
          }
        }
        return { x: rx, y: ry };
      })();

      n.ox += ((-dx / Math.max(1, dist)) * prox * tiltStr - n.ox) * 0.12;
      n.oy += ((-dy / Math.max(1, dist)) * prox * tiltStr - n.oy) * 0.12;
      n.glow += (prox - n.glow) * 0.1;

      n.nx = n.bx + n.ox + ripPush.x;
      n.ny = n.by + n.oy + ripPush.y;

      const wave = Math.sin(n.phase + time * n.speed * 300) * 0.5 + 0.5;
      n.baseAlpha = 0.04 + wave * 0.025;
    }

    const cols_count = Math.ceil(W / GRID) + 2;
    const rows_count = Math.ceil(H / GRID) + 2;

    for (let r = 0; r < rows_count - 1; r++) {
      for (let c = 0; c < cols_count - 1; c++) {
        const i = r * cols_count + c;
        const right = i + 1;
        const down = i + cols_count;
        const n = nodes[i];
        const nr = nodes[right];
        const nd = nodes[down];
        if (!n || !nr || !nd) continue;

        const avgGlow = (n.glow + nr.glow) * 0.5;
        ctx.beginPath();
        ctx.moveTo(n.nx, n.ny);
        ctx.lineTo(nr.nx, nr.ny);
        ctx.strokeStyle = avgGlow > 0.02
          ? `rgba(250,204,21,${0.04 + avgGlow * 0.14})`
          : `rgba(255,255,255,${n.baseAlpha})`;
        ctx.stroke();

        const avgGlowV = (n.glow + nd.glow) * 0.5;
        ctx.beginPath();
        ctx.moveTo(n.nx, n.ny);
        ctx.lineTo(nd.nx, nd.ny);
        ctx.strokeStyle = avgGlowV > 0.02
          ? `rgba(250,204,21,${0.04 + avgGlowV * 0.14})`
          : `rgba(255,255,255,${n.baseAlpha})`;
        ctx.stroke();
      }
    }

    const arm = 4;
    for (let n of nodes) {
      if (n.glow > 0.04) {
        ctx.save();
        ctx.strokeStyle = `rgba(250,204,21,${0.18 + n.glow * 0.7})`;
        ctx.lineWidth = 1.2;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 6 + n.glow * 14;
        ctx.beginPath();
        ctx.moveTo(n.nx - arm, n.ny); ctx.lineTo(n.nx + arm, n.ny);
        ctx.moveTo(n.nx, n.ny - arm); ctx.lineTo(n.nx, n.ny + arm);
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.fillStyle = `rgba(255,255,255,${n.baseAlpha + 0.04})`;
        ctx.fillRect(n.nx - 0.5, n.ny - 0.5, 1.5, 1.5);
      }
    }
  }

  function draw_cursor_light() {
    if (ptr.x < -500) return;
    const g = ctx.createRadialGradient(ptr.x, ptr.y, 0, ptr.x, ptr.y, 260);
    g.addColorStop(0, 'rgba(250,204,21,0.055)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.015)');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    const speed = Math.sqrt(ptr.vx * ptr.vx + ptr.vy * ptr.vy);
    if (speed > 3) {
      const trailG = ctx.createRadialGradient(ptr.x, ptr.y, 0, ptr.x, ptr.y, 90);
      trailG.addColorStop(0, `rgba(250,204,21,${Math.min(0.12, speed * 0.008)})`);
      trailG.addColorStop(1, 'transparent');
      ctx.fillStyle = trailG;
      ctx.fillRect(0, 0, W, H);
    }
  }

  function ploop() {
    time += 0.016;
    ptr.x += (ptr.tx - ptr.x) * 0.1;
    ptr.y += (ptr.ty - ptr.y) * 0.1;

    ctx.fillStyle = '#070709';
    ctx.fillRect(0, 0, W, H);

    draw_aurora();

    for (let i = ripples.length - 1; i >= 0; i--) {
      if (!ripples[i].step()) ripples.splice(i, 1);
      else ripples[i].draw(ctx);
    }

    draw_grid_and_nodes();
    draw_cursor_light();
    draw_vignette();

    for (let i = sparks.length - 1; i >= 0; i--) {
      if (!sparks[i].step()) sparks.splice(i, 1);
      else sparks[i].draw(ctx);
    }

    for (let i = bubbles.length - 1; i >= 0; i--) {
      if (!bubbles[i].step()) bubbles.splice(i, 1);
      else bubbles[i].draw(ctx);
    }


    requestAnimationFrame(ploop);
  }
  ploop();
}
