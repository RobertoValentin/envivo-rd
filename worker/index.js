// Canales RD: static Stremio addon (assets) + /yt/live.json, which says which official
// YouTube channels of Dominican TV stations are live right now.

const CHANNELS = [
  { id: 'UCAVnMMAcnwZ67RS6SQtvPOA', avatar: 'https://yt3.googleusercontent.com/RmvfY7dc1Qi42jhMPv5TTDTHF4cKNUQEntzHdPmG0y943F36eCFjuznjomtNEI65PXjpMjglUg=s900-c-k-c0x00ffffff-no-rj', name: 'Telemicro', short: 'Telemicro' },
  { id: 'UCbBIwG4LJfQyM4ZdoiujBxg', avatar: 'https://yt3.googleusercontent.com/QAn8Thy8s7I9Waxrt3LyiJzXlYVj8v1vAQgD5L1Fs6LxwAjND8_jv8z2rwkOr-utJZzu79e8xg=s900-c-k-c0x00ffffff-no-rj', name: 'Noticias SIN', short: 'SIN' },
  { id: 'UCiDATmLMS6XfkB7mh8pmeHg', avatar: 'https://yt3.googleusercontent.com/T6ktf2FksEz0XMQgjCrw4HmUQdZ30W59_nwhgJHNF6OtGB1p5F0MELGLJKfuc57JZDZxKYpkQQ=s900-c-k-c0x00ffffff-no-rj', name: 'Color Visión', short: 'Color Visión' },
  { id: 'UCpFfLf9o4wJr-yr7dG8gYug', avatar: 'https://yt3.googleusercontent.com/0FQ-r39VKswlIaVDhGRoEhD1d6bT_vBHEc0x4jL3OolANVzwKLLtrdJHPYxXdN2ACy8ZsBPcMQ=s900-c-k-c0x00ffffff-no-rj', name: 'CDN 37', short: 'CDN' },
  { id: 'UCHg6FA7FVA66FvMFPvZLadw', avatar: 'https://yt3.googleusercontent.com/ir3ugfk8ZYoP93WP2hcDNyxWMCSCRHnhsz4LMUYZTY1bHFGx5KUGdurT7OE0RaYlyZSBzJ2HmA=s900-c-k-c0x00ffffff-no-rj', name: 'Telenoticias (Telesistema)', short: 'Telesistema' },
  { id: 'UCKd3RqAWndTIflbZGmIoYKw', avatar: 'https://yt3.googleusercontent.com/ytc/AIdro_mPxnOEjBWP7DLcwOl-rjaHCm9L6aWWx0ABUMflOaOF2cc=s900-c-k-c0x00ffffff-no-rj', name: 'Telecentro', short: 'Telecentro' },
  { id: 'UCRJRt0AkX6aX5Yrzzmw-VMQ', avatar: 'https://yt3.googleusercontent.com/qgUQPNHcmHDEiLSa-aCvyjaLgFxVe6Zv9FeAWRJBdmecikGetIt406NJpse4ErMxNJ6_b_cLdw=s900-c-k-c0x00ffffff-no-rj', name: 'Central Noticias (Canal 4)', short: 'Canal 4' },
  { id: 'UCRrCjAmN5K77Z9-i4THFP8A', avatar: 'https://yt3.googleusercontent.com/6Q9bIh7Qe39s7ipfCVAUQWYgaeBFrXhzToKZDpj7cmD69cY2_GEA5GDABb47fsN1w040DqyDu3A=s900-c-k-c0x00ffffff-no-rj', name: 'Antena 7', short: 'Antena 7' },
  { id: 'UC1O-UKWzi4AlRDlo_O7bZOw', avatar: 'https://yt3.googleusercontent.com/52LsCg3CSiX3Vlw4yVHWKFNMEchbADL6dbiY4LXSaqBWp0PgAs7eYJjLYTidPYwuRWg2Fh-p3g=s900-c-k-c0x00ffffff-no-rj', name: 'Digital 15', short: 'Digital 15' },
  { id: 'UCyxOdXhuAzWx4n9YEXmszfg', avatar: 'https://yt3.googleusercontent.com/3Nda9PLUByFYt0W9PVnV9IqfEoJ2XdtKWqxbpf5f8u02oXsJyAapz9XmiI7UYxIh5urQcVSI=s900-c-k-c0x00ffffff-no-rj', name: 'Super Canal 33', short: 'Super Canal' },
  { id: 'UCs_TIwA6miRLEOPxLdnRA_w', avatar: 'https://yt3.googleusercontent.com/W22Np_myxIr3k456cH1wNg9aSG94NvvJ6McOjQjnACpkHRygHINrC4jH459OtptPd3c3uBg83A=s900-c-k-c0x00ffffff-no-rj', name: 'Teleantillas', short: 'Teleantillas' },
  { id: 'UCwBmdNPY3-jrPBBuerh5ikw', avatar: 'https://yt3.googleusercontent.com/jZoB8Wb3neJINQ4e4oeQGdG2zLvhZIzcslwp1K9MnVOwrpJQKjS6i7rF-iBB-kRuG_4-7cSfjHE=s900-c-k-c0x00ffffff-no-rj', name: 'El Nuevo Diario TV', short: 'Nuevo Diario' },
  { id: 'UCv51KVxpI4X2A3UGCdOMt6w', avatar: 'https://yt3.googleusercontent.com/UXfYaH6k52GtHtKQ3ajcZqfQpv6dkO0HwEV4U_rNxuW4fMPfZ38894BY6AkL1qexVVzIElpfYQ=s900-c-k-c0x00ffffff-no-rj', name: 'RTVD 4', short: 'RTVD' },
];

const UA = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36',
  'Accept-Language': 'es-DO,es;q=0.9',
  Cookie: 'CONSENT=YES+1',
};

function pick(re, text) {
  const m = re.exec(text);
  return m ? m[1] : null;
}

function unescapeJson(s) {
  try { return JSON.parse('"' + s + '"'); } catch (e) { return s; }
}

async function status(ch) {
  const out = { id: ch.id, name: ch.name, short: ch.short, avatar: ch.avatar, live: false };
  try {
    const page = await fetch('https://www.youtube.com/channel/' + ch.id + '/live', { headers: UA });
    const t = await page.text();
    const vid = pick(/"videoDetails":\{"videoId":"([^"]+)"/, t);
    if (!vid) { out.recorded = await lastBroadcast(ch.id); return out; }
    const nowLive = /"liveBroadcastDetails":\{[^}]*"isLiveNow":true/.test(t);
    const title = pick(/"videoDetails":\{[^}]*?"title":"((?:[^"\\]|\\.)*)"/, t);
    if (nowLive) {
      out.live = true;
      out.videoId = vid;
      out.title = title ? unescapeJson(title) : ch.name;
      out.since = pick(/"startTimestamp":"([^"]+)"/, t);
      out.viewers = pick(/"viewCount":"(\d+)"/, t);
    } else if (/"isUpcoming":true/.test(t)) {
      const at = pick(/"scheduledStartTime":"(\d+)"/, t);
      if (at) out.next = { at: Number(at) * 1000, title: title ? unescapeJson(title) : '' };
    }
    if (!out.live) out.recorded = await lastBroadcast(ch.id);
  } catch (e) {
    out.error = true;
  }
  return out;
}

// The channel's most recent finished live broadcast (its "Transmisiones" tab), as a fallback
// when it is not live: a newscast that already aired, which always plays.
async function lastBroadcast(channelId) {
  // Text search instead of parsing the 1 MB page: Workers have little CPU time.
  try {
    const t = await (await fetch('https://www.youtube.com/channel/' + channelId + '/streams', { headers: UA })).text();
    // In this page each video's title and "Transmitido hace…" come BEFORE its contentId.
    const re = /"contentId":"([\w-]{11})"/g;
    let m, prev = 0;
    while ((m = re.exec(t))) {
      const chunk = t.slice(Math.max(prev, m.index - 16000), m.index);
      prev = m.index;
      const ago = /"content":"((?:Transmitido|Streamed)[^"]*)"/.exec(chunk);
      if (!ago) continue;
      const titles = chunk.match(/"lockupMetadataViewModel":\{"title":\{"content":"((?:[^"\\]|\\.)*)"/g) || [];
      const last = titles.length ? /"content":"((?:[^"\\]|\\.)*)"/.exec(titles[titles.length - 1])[1] : '';
      return { videoId: m[1], title: unescapeJson(last), ago: ago[1].replace(/^(Transmitido|Streamed) /, '') };
    }
  } catch (e) {}
  // Fallback: the newest upload from the channel's feed (always playable).
  try {
    const x = await (await fetch('https://www.youtube.com/feeds/videos.xml?channel_id=' + channelId)).text();
    const e = /<entry>[\s\S]*?<yt:videoId>([^<]+)<[\s\S]*?<title>([^<]*)<[\s\S]*?<published>([^<]+)</.exec(x);
    if (e) return { videoId: e[1], title: e[2].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'"), published: e[3] };
  } catch (e) {}
  return null;
}

async function liveJson(ctx) {
  const cache = caches.default;
  const key = new Request('https://cache.canales-rd/yt-live-v9');
  const hit = await cache.match(key);
  if (hit) return hit;
  const list = await Promise.all(CHANNELS.map(status));
  const body = JSON.stringify({ updated: Date.now(), channels: list });
  const res = new Response(body, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=60',
    },
  });
  ctx.waitUntil(cache.put(key, res.clone()));
  return res;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/yt/live.json') return liveJson(ctx);
    return env.ASSETS.fetch(request);
  },
};
