/* En vivo RD: Dominican channels as a grid of logos, always in the same order.
   OK opens the channel's live broadcast on YouTube, or its last one when it is not live.
   Every time it opens (and every 3 minutes) it checks again which channels are live.
   ES5 only: Samsung Tizen 4 runs a Chromium from 2017. */
(function () {
  'use strict';

  var API = 'https://canales-rd.monitor-portafolio.workers.dev/yt/live.json';
  var REFRESH_MS = 3 * 60 * 1000;
  var COLS = 5;
  var KEY = { left: 37, up: 38, right: 39, down: 40, ok: 13, back: 10009 };
  var STREMIO_APPS = ['SLiteTizen.StremioLite'];
  // Inside TizenBrew the page has no `tizen` object: the module's service (service.js) opens apps.
  var SERVICE = 'http://127.0.0.1:8091';

  var $ = function (id) { return document.getElementById(id); };
  var tiles = [], focus = 0, toastTimer = null;

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function hourText(d) {
    var h = d.getHours(), m = d.getMinutes(), ampm = h < 12 ? 'a. m.' : 'p. m.';
    h = h % 12; if (h === 0) h = 12;
    return h + ':' + pad(m) + ' ' + ampm;
  }
  function tickClock() { $('clock').textContent = hourText(new Date()); }

  function toast(msg) {
    var t = $('toast');
    t.textContent = msg; t.className = 'toast show';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.className = "toast"; }, 12000);
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]; });
  }

  function load() {
    $('checked').textContent = 'Revisando canales…';
    var x = new XMLHttpRequest();
    x.open('GET', API + '?t=' + Date.now(), true);
    x.timeout = 30000;
    x.onload = function () {
      try {
        var j = JSON.parse(x.responseText);
        $('checked').textContent = 'Revisado a las ' + hourText(new Date(j.updated || Date.now()));
        render(j.channels || []);
      } catch (e) { failed(); }
    };
    x.onerror = x.ontimeout = failed;
    x.send();
  }
  function failed() {
    $('checked').textContent = 'Sin conexión. Reintentando…';
    setTimeout(load, 30000);
  }

  function render(channels) {
    var html = [], i, c;
    tiles = [];
    for (i = 0; i < channels.length; i++) {
      c = channels[i];
      if (!c.live && !(c.recorded && c.recorded.videoId)) continue;   // nothing to open
      tiles.push(c);
    }
    tiles.push({ more: true });
    var first = !render.done;
    for (i = 0; i < tiles.length; i++) {
      c = tiles[i];
      var cls = 'tile' + (i % COLS === COLS - 1 ? ' c5' : '') + (first ? ' enter' : '');
      var delay = first ? ' style="-webkit-animation-delay:' + (i * 35) + 'ms;animation-delay:' + (i * 35) + 'ms"' : '';
      if (c.more) {
        html.push('<div class="' + cls + ' more" id="t' + i + '"' + delay + '><span class="glyph">24</span><p class="name">Canales 24 horas</p></div>');
      } else {
        html.push('<div class="' + cls + (c.live ? ' is-live' : '') + '" id="t' + i + '"' + delay + '><span class="live">En vivo</span>' +
          '<img class="logo" src="' + esc(c.avatar || '') + '" alt=""><p class="name">' + esc(c.short || c.name) + '</p></div>');
      }
    }
    html.push('<div class="ring" id="ring"></div>');
    $('grid').innerHTML = html.join('');
    render.done = true;
    if (focus >= tiles.length) focus = tiles.length - 1;
    paintFocus();
  }

  // Tile pitch: 304 + 45 across, 278 + 36 down (see style.css).
  function paintFocus() {
    for (var i = 0; i < tiles.length; i++) {
      var el = $('t' + i);
      if (el) el.className = el.className.replace(/\s*focus/g, '') + (i === focus ? ' focus' : '');
    }
    var ring = $('ring');
    if (ring) {
      var t = 'translate3d(' + (focus % COLS) * 349 + 'px,' + Math.floor(focus / COLS) * 314 + 'px,0)';
      ring.style.webkitTransform = ring.style.transform = t;
    }
  }

  function askService(path, body, onFail) {
    var x = new XMLHttpRequest();
    x.open('POST', SERVICE + path, true);
    x.setRequestHeader('Content-Type', 'application/json');
    x.timeout = 15000;
    x.onload = function () { if (x.status !== 200) onFail(); };
    x.onerror = x.ontimeout = onFail;
    x.send(JSON.stringify(body));
  }



  // TizenTube (ad-free YouTube) reads its app control data as JSON {"args": "..."} and appends
  // those args to youtube.com/tv, so "v=<id>" opens that exact video (see its standalone/index.html).
  var TIZENTUBE = 'xvvl3S1TT1.TizenTubeStandalone';
  function openInTizenTube(videoId, onFail) {
    if (!window.tizen || !window.tizen.application) {
      // As a TizenBrew module the page has no `tizen`: its service (service.js) launches TizenTube.
      if (/^http:\/\/127\.0\.0\.1:8081\//.test(window.location.href)) askService('/tizentube', { videoId: videoId }, onFail);
      else onFail();
      return;
    }
    try {
      var data = [new window.tizen.ApplicationControlData('PAYLOAD', [JSON.stringify({ args: 'v=' + videoId })])];
      var ctl = new window.tizen.ApplicationControl('http://tizen.org/appcontrol/operation/default', null, null, null, data);
      window.tizen.application.launchAppControl(ctl, TIZENTUBE, function () {}, onFail);
    } catch (e) { onFail(); }
  }

  // Only TizenTube: no official YouTube app in between (Roberto's call), so it is always ad-free.
  function openVideo(name, videoId) {
    toast('Abriendo ' + name + ' en TizenTube…');
    openInTizenTube(videoId, function () {
      toast('No se pudo abrir TizenTube. Revisa que esté instalado y vuelve a intentar.');
    });
  }


  function openStremio() {
    var fail = function () { toast('Abre Stremio desde el menú de apps.'); };
    if (!window.tizen || !window.tizen.application) { askService('/launch', { id: STREMIO_APPS[0] }, fail); return; }
    try { window.tizen.application.launch(STREMIO_APPS[0], function () {}, fail); } catch (e) { fail(); }
  }

  function activate() {
    var c = tiles[focus];
    if (!c) return;
    if (c.more) { openStremio(); return; }
    openVideo(c.short || c.name, c.live ? c.videoId : c.recorded.videoId);
  }

  document.addEventListener('keydown', function (e) {
    var k = e.keyCode, n = tiles.length;
    if (k === KEY.left) { if (focus % COLS > 0) focus--; }
    else if (k === KEY.right) { if (focus % COLS < COLS - 1 && focus < n - 1) focus++; }
    else if (k === KEY.up) { if (focus - COLS >= 0) focus -= COLS; }
    else if (k === KEY.down) { focus = Math.min(n - 1, focus + COLS); }
    else if (k === KEY.ok) { activate(); return; }
    else if (k === KEY.back) {
      try { window.tizen.application.getCurrentApplication().exit(); } catch (err) {}
      return;
    } else { return; }
    e.preventDefault();
    paintFocus();
  });

  // Coming back to the app (after watching) checks again right away.
  document.addEventListener('visibilitychange', function () { if (!document.hidden) load(); });
  tickClock(); setInterval(tickClock, 15000);
  load(); setInterval(load, REFRESH_MS);
})();
