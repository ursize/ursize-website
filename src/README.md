## ursize.xyz

portfolio. html/css/js, no framework, vercel.

edit `config.json` for anything profile related — links, music, crypto, bubbles toggle (true/false), all that.

after touching anything in `src/`:
```sh
node build.js
```

---

**deploy**

push to github, import on vercel, add a kv store from the storage tab, then:

```sh
vercel env add SITE_DOMAIN   # just the domain, no https
vercel env add IP_SALT       # any random string
```

---

**view counter** — `/api/views`

ips get hashed before storage, bots get ignored, same ip only counts once per 24h. rate limited. daily stats kept 90 days.
