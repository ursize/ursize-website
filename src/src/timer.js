export function init_timer() {
  const fkk = x => document.getElementById(x);

  function timer_tick() {
    const tgt = new Date('2027-01-01T00:00:00Z').getTime();
    const diff = Math.max(0, tgt - Date.now());

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    const elD = fkk('c-d');
    const elH = fkk('c-h');
    const elM = fkk('c-m');
    const elS = fkk('c-s');

    if (elD) elD.textContent = d;
    if (elH) elH.textContent = h.toString().padStart(2, '0');
    if (elM) elM.textContent = m.toString().padStart(2, '0');
    if (elS) elS.textContent = s.toString().padStart(2, '0');
  }

  timer_tick();
  setInterval(timer_tick, 1000);
}
