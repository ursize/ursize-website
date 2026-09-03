const { kv } = require('@vercel/kv');
const crypto = require('crypto');

const prod = process.env.NODE_ENV === 'production';
const domain = process.env.SITE_DOMAIN;
const salt = process.env.IP_SALT || '';
const bots = ['bot','crawl','spider','scrape','curl','wget','python','java','go-http','httpclient','okhttp','libwww'];

const ok_origin = o => !prod || !domain || o === `https://${domain}` || o === `https://www.${domain}`;
const ok_ref = r => !prod || !domain || !r || r.startsWith(`https://${domain}`) || r.startsWith(`https://www.${domain}`);
const is_bot = ua => bots.some(b => ua.toLowerCase().includes(b));
const h = s => crypto.createHash('sha256').update(s + salt).digest('hex').slice(0, 32);

async function rl(key, max, win) {
  const slot = Math.floor(Date.now() / 1000 / win);
  const k = `rl:${key}:${slot}`;
  const n = await kv.incr(k);
  if (n === 1) await kv.expire(k, win * 2);
  return n <= max;
}

module.exports = async (req, res) => {
  const origin = req.headers['origin'] || '';
  if (!ok_origin(origin)) return res.status(403).end();

  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).end();

  const ua = req.headers['user-agent'] || '';
  const ref = req.headers['referer'] || '';

  if (is_bot(ua)) {
    const [v, u] = await Promise.all([kv.get('pv:total'), kv.get('pv:unique')]);
    return res.json({ views: v || 0, unique: u || 0 });
  }

  if (!ok_ref(ref)) return res.status(403).end();

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.headers['x-real-ip'] || 'anon';
  const ih = h(ip);

  if (!await rl('g', 120, 60)) return res.status(429).end();
  if (!await rl(ih, 3, 60)) return res.status(429).end();

  const sk = `pv:s:${ih}`;
  const fresh = !(await kv.exists(sk));

  if (fresh) {
    await kv.set(sk, 1, { ex: 86400 });
    const day = new Date().toISOString().slice(0, 10);
    await Promise.all([
      kv.incr('pv:unique'),
      kv.incr(`pv:d:${day}`).then(() => kv.expire(`pv:d:${day}`, 86400 * 90)),
    ]);
  }

  const total = fresh ? await kv.incr('pv:total') : await kv.get('pv:total') || 0;
  const unique = (await kv.get('pv:unique')) || 0;

  res.json({ views: total, unique });
};
