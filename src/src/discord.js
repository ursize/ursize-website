export function init_discord() {
  const fkk = x => document.getElementById(x);
  const DUID = '367024971412799489';

  function fill_dc(d) {
    if (!d) return;
    const u = d.discord_user;
    if (u) {
      fkk('dc-name').textContent = u.global_name || u.display_name || u.username;
      fkk('dc-tag').textContent = `@${u.username}`;
      if (u.avatar) {
        const ext = u.avatar.startsWith('a_') ? 'gif' : 'png';
        fkk('dc-img').src = `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${ext}?size=256`;
      }
      if (u.banner) {
        const b_ext = u.banner.startsWith('a_') ? 'gif' : 'png';
        const b_el = fkk('dc-banner-img');
        if (b_el) b_el.src = `https://cdn.discordapp.com/banners/${u.id}/${u.banner}.${b_ext}?size=600`;
      }
      if (u.avatar_decoration_data && u.avatar_decoration_data.asset) {
        const dec = fkk('dc-dec');
        if (dec) {
          dec.src = `https://cdn.discordapp.com/avatar-decoration-presets/${u.avatar_decoration_data.asset}.png?size=160`;
          dec.classList.remove('hidden');
        }
      }
    }

    const s = d.discord_status || 'dnd';
    const cdict = {
      online: '#22c55e',
      idle: '#f59e0b',
      dnd: '#ed4245',
      offline: '#58586a'
    };
    const dot = fkk('dc-dot');
    dot.style.background = cdict[s] || '#ed4245';
    dot.style.boxShadow = s !== 'offline' ? `0 0 10px ${cdict[s]}` : 'none';
    if (s === 'dnd') dot.classList.add('status-dnd');
    else dot.classList.remove('status-dnd');

    const bio = document.querySelector('.dpc-bio-body');
    if (d.activities && d.activities.length) {
      const custom = d.activities.find(x => x.type === 4);
      if (custom && custom.state && bio) {
        bio.textContent = custom.state;
      }
    }

    const act_box = fkk('dc-activity-box');
    const act_icon = fkk('act-icon');
    const act_type = fkk('act-type');
    const act_name = fkk('act-name');
    const act_det = fkk('act-details');
    const act_st = fkk('act-state');
    const act_img = fkk('act-img');

    if (act_box) {
      if (d.listening_to_spotify && d.spotify) {
        act_box.classList.remove('hidden');
        act_box.className = 'dpc-activity glass-card act-spotify';
        act_type.textContent = 'LISTENING TO SPOTIFY';
        act_icon.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="#1db954"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10A10 10 0 0 0 12 2zm4.586 14.424a.625.625 0 0 1-.861.206c-2.357-1.44-5.324-1.765-8.818-.967a.624.624 0 1 1-.278-1.218c3.824-.875 7.103-.509 9.75 1.117a.625.625 0 0 1 .207.862zm1.226-2.724a.782.782 0 0 1-1.077.257c-2.698-1.658-6.81-2.14-9.998-1.171a.782.782 0 1 1-.453-1.497c3.64-1.104 8.19-.567 11.27 1.332a.782.782 0 0 1 .258 1.079zm.105-2.835C14.692 8.95 8.08 8.73 4.708 9.754a.937.937 0 1 1-.543-1.794c3.938-1.194 11.246-.938 15.19 1.404a.937.937 0 1 1-.963 1.606z"/></svg>`;
        act_name.textContent = d.spotify.song;
        act_det.textContent = `by ${d.spotify.artist}`;
        act_st.textContent = d.spotify.album || '';
        if (d.spotify.album_art_url) {
          act_img.src = d.spotify.album_art_url;
          act_img.classList.remove('hidden');
        } else {
          act_img.classList.add('hidden');
        }
      } else {
        const rich = (d.activities || []).find(x => x.type !== 4);
        if (rich) {
          act_box.classList.remove('hidden');
          act_box.className = 'dpc-activity glass-card act-game';
          if (rich.type === 0) act_type.textContent = 'PLAYING A GAME';
          else if (rich.type === 1) act_type.textContent = 'STREAMING';
          else if (rich.type === 2) act_type.textContent = 'LISTENING';
          else if (rich.type === 3) act_type.textContent = 'WATCHING';
          else act_type.textContent = 'ACTIVE';

          act_icon.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5865f2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
          act_name.textContent = rich.name;
          act_det.textContent = rich.details || '';
          act_st.textContent = rich.state || '';

          if (rich.assets && rich.assets.large_image) {
            if (rich.assets.large_image.startsWith('mp:external/')) {
              const extUrl = rich.assets.large_image.replace(new RegExp('mp:external/[^/]+/https/'), 'https://');
              act_img.src = extUrl;
            } else {
              act_img.src = `https://cdn.discordapp.com/app-assets/${rich.application_id}/${rich.assets.large_image}.png`;
            }
            act_img.classList.remove('hidden');
          } else {
            act_img.classList.add('hidden');
          }
        } else {
          act_box.classList.add('hidden');
        }
      }
    }
  }

  const init_dc_data = {
    discord_user: {
      avatar: 'd69ed1c31c03b1e8dca2af26243ba824',
      avatar_decoration_data: { asset: 'a_98c7600d304b86ca3b18272e1da05559' },
      id: DUID,
      username: 'ursize',
      global_name: 'ursize'
    },
    activities: [
      { id: 'custom', name: 'Custom Status', state: '/ursize', type: 4 }
    ],
    discord_status: 'dnd'
  };
  fill_dc(init_dc_data);

  fetch('/config.json').then(r=>r.json()).then(c=>{
    const b = c?.profile?.badges;
    const dk = fkk('dc-badges-dock');
    if (b && dk) {
      dk.innerHTML = b.map(x=>`<span class="badge-icon" title="${x.name}"><img src="${x.icon}" alt="${x.name}" width="19" height="19"></span>`).join('');
    }
  }).catch(()=>{});

  function dc_hook() {
    const ws = new WebSocket('wss://api.lanyard.rest/socket');
    let hb = null;

    ws.onopen = () => {
      ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: DUID } }));
    };

    ws.onmessage = ev => {
      try {
        const d = JSON.parse(ev.data);
        if (d.op === 1) {
          hb = setInterval(() => ws.send(JSON.stringify({ op: 3 })), d.d.heartbeat_interval);
        }
        if (d.t === 'INIT_STATE' || d.t === 'PRESENCE_UPDATE') {
          fill_dc(d.d);
        }
      } catch (_) {}
    };

    ws.onerror = () => {
      fetch(`https://api.lanyard.rest/v1/users/${DUID}`)
        .then(r => r.json())
        .then(r => { if (r.data) fill_dc(r.data); })
        .catch(() => {});
    };

    ws.onclose = () => {
      if (hb) clearInterval(hb);
      setTimeout(dc_hook, 10000);
    };
  }
  dc_hook();

  const cid_btn = fkk('btn-copy-id');
  if (cid_btn) {
    cid_btn.addEventListener('click', () => {
      navigator.clipboard.writeText(DUID).then(() => {
        const toast = fkk('toast');
        if (toast) {
          toast.textContent = `Copied Discord ID: ${DUID}`;
          toast.classList.remove('hidden');
          setTimeout(() => toast.classList.add('hidden'), 2200);
        }
      });
    });
  }
}
