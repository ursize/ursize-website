export function init_audio() {
  const fkk = x => document.getElementById(x);
  
  let fuckingfuckingor = false;
  let shiisisisisiis = 0;
  let damnn = 0.7;
  let wtf = false;
  let cur = 0;
  let is_scrubbing = false;

  const trklist = [
    {
      n: 'Bounce Out x Limerence',
      len: 165,
      src: 'https://files.catbox.moe/cs2ari.mp3',
      art: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02af41341020c85f2f2279aeb2',
      spot: 'https://open.spotify.com/track/5lZsh9Qf7CbHI9Fcc7Zcsq'
    },
    {
      n: 'Airplane Mode',
      len: 142,
      src: 'https://files.catbox.moe/h6srmw.mp3',
      art: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02d653f88352c2da499146473f',
      spot: 'https://open.spotify.com/track/5XKZua8kqgHwcxeKiMIjge'
    }
  ];

  let real_aud = new Audio();
  real_aud.preload = 'auto';
  real_aud.crossOrigin = 'anonymous';
  real_aud.src = trklist[0].src;
  real_aud.volume = damnn;

  real_aud.addEventListener('timeupdate', () => {
    if (is_scrubbing) return;
    cur = real_aud.currentTime;
    const dur = real_aud.duration || trklist[shiisisisisiis].len;
    const m = Math.floor(cur / 60);
    const s = Math.floor(cur % 60).toString().padStart(2, '0');
    fkk('t-cur').textContent = `${m}:${s}`;
    const dm = Math.floor(dur / 60);
    const ds = Math.floor(dur % 60).toString().padStart(2, '0');
    fkk('t-dur').textContent = `${dm}:${ds}`;
    fkk('track-fill').style.width = `${(cur / dur) * 100}%`;
  });

  real_aud.addEventListener('ended', () => {
    switch_trk((shiisisisisiis + 1) % trklist.length);
    real_aud.play().catch(() => {});
  });

  real_aud.addEventListener('loadedmetadata', () => {
    const dur = real_aud.duration || trklist[shiisisisisiis].len;
    const dm = Math.floor(dur / 60);
    const ds = Math.floor(dur % 60).toString().padStart(2, '0');
    fkk('t-dur').textContent = `${dm}:${ds}`;
  });

  function up_aud_dom() {
    const trk = trklist[shiisisisisiis];
    fkk('ab-now').textContent = trk.n;
    const art_img = fkk('ab-disc-art');
    if (art_img && art_img.src !== trk.art) art_img.src = trk.art;
    const spt = fkk('spot-link');
    if (spt) spt.href = trk.spot;
  }

  function play_flip() {
    fuckingfuckingor = !fuckingfuckingor;

    if (fuckingfuckingor) {
      real_aud.play().then(() => {
        fkk('p-ic').classList.add('hidden');
        fkk('pa-ic').classList.remove('hidden');
        fkk('ab-disc').classList.add('spin');
        fkk('eq-box').classList.add('active');
      }).catch(() => {
        fuckingfuckingor = false;
        fkk('p-ic').classList.remove('hidden');
        fkk('pa-ic').classList.add('hidden');
        fkk('ab-disc').classList.remove('spin');
        fkk('eq-box').classList.remove('active');
      });
    } else {
      real_aud.pause();
      fkk('p-ic').classList.remove('hidden');
      fkk('pa-ic').classList.add('hidden');
      fkk('ab-disc').classList.remove('spin');
      fkk('eq-box').classList.remove('active');
    }
  }

  function switch_trk(idx) {
    shiisisisisiis = idx;
    real_aud.src = trklist[shiisisisisiis].src;
    real_aud.currentTime = 0;
    fkk('trk-0').classList.toggle('active', idx === 0);
    fkk('trk-1').classList.toggle('active', idx === 1);
    up_aud_dom();
    if (fuckingfuckingor) {
      real_aud.play().catch(() => {});
    }
  }

  fkk('ctl-play').addEventListener('click', play_flip);
  fkk('ctl-prev').addEventListener('click', () => {
    switch_trk((shiisisisisiis - 1 + trklist.length) % trklist.length);
  });
  fkk('ctl-next').addEventListener('click', () => {
    switch_trk((shiisisisisiis + 1) % trklist.length);
  });
  fkk('trk-0').addEventListener('click', () => switch_trk(0));
  fkk('trk-1').addEventListener('click', () => switch_trk(1));

  fkk('vol-slider').addEventListener('input', e => {
    damnn = parseFloat(e.target.value) / 100;
    real_aud.volume = damnn;
    if (damnn === 0) {
      wtf = true;
      fkk('v-ic').classList.add('hidden');
      fkk('m-ic').classList.remove('hidden');
    } else {
      wtf = false;
      fkk('v-ic').classList.remove('hidden');
      fkk('m-ic').classList.add('hidden');
    }
  });

  fkk('ctl-mute').addEventListener('click', () => {
    wtf = !wtf;
    real_aud.muted = wtf;
    fkk('v-ic').classList.toggle('hidden', wtf);
    fkk('m-ic').classList.toggle('hidden', !wtf);
  });

  const seeker_el = fkk('track-seeker');

  function do_scrub(cx) {
    const rc = seeker_el.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (cx - rc.left) / rc.width));
    const dur = real_aud.duration || trklist[shiisisisisiis].len;
    const tgt_t = p * dur;

    fkk('track-fill').style.width = `${p * 100}%`;
    const m = Math.floor(tgt_t / 60);
    const s = Math.floor(tgt_t % 60).toString().padStart(2, '0');
    fkk('t-cur').textContent = `${m}:${s}`;
    return tgt_t;
  }

  seeker_el.addEventListener('mousedown', e => {
    is_scrubbing = true;
    seeker_el.classList.add('scrubbing');
    const t = do_scrub(e.clientX);
    real_aud.currentTime = t;
  });

  window.addEventListener('mousemove', e => {
    if (!is_scrubbing) return;
    const t = do_scrub(e.clientX);
    real_aud.currentTime = t;
  });

  window.addEventListener('mouseup', e => {
    if (!is_scrubbing) return;
    is_scrubbing = false;
    seeker_el.classList.remove('scrubbing');
    const t = do_scrub(e.clientX);
    real_aud.currentTime = t;
  });

  seeker_el.addEventListener('touchstart', e => {
    if (e.touches && e.touches[0]) {
      is_scrubbing = true;
      seeker_el.classList.add('scrubbing');
      const t = do_scrub(e.touches[0].clientX);
      real_aud.currentTime = t;
    }
  }, { passive: true });

  window.addEventListener('touchmove', e => {
    if (!is_scrubbing || !e.touches || !e.touches[0]) return;
    const t = do_scrub(e.touches[0].clientX);
    real_aud.currentTime = t;
  }, { passive: true });

  window.addEventListener('touchend', e => {
    if (!is_scrubbing) return;
    is_scrubbing = false;
    seeker_el.classList.remove('scrubbing');
  });

  return { play_flip };
}
