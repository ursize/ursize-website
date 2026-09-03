export function init_timezone() {
  const fkk = x => document.getElementById(x);

  function nl_clock() {
    const t_el = fkk('nl-tz-time');
    const d_el = fkk('nl-tz-diff');
    if (!t_el || !d_el) return;

    const now = new Date();
    const f = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Amsterdam',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    t_el.textContent = `${f.format(now)} CET`;

    try {
      const nl_str = now.toLocaleString('en-US', { timeZone: 'Europe/Amsterdam' });
      const loc_str = now.toLocaleString('en-US');
      const nl_ms = new Date(nl_str).getTime();
      const loc_ms = new Date(loc_str).getTime();
      const diff_h = Math.round((nl_ms - loc_ms) / (1000 * 60 * 60));

      if (diff_h === 0) {
        d_el.textContent = '(same time)';
      } else if (diff_h > 0) {
        d_el.textContent = `(+${diff_h}h ahead)`;
      } else {
        d_el.textContent = `(${diff_h}h behind)`;
      }
    } catch (_) {
      d_el.textContent = '';
    }
  }

  nl_clock();
  setInterval(nl_clock, 1000);
}
