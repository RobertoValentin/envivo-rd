/* En vivo RD: Dominican channels on YouTube. The live one big on top; below, what is live
   and then each channel's last finished broadcast, which always plays.
   Every time it opens (and every 3 minutes) it asks again which channels are live.
   ES5 only: Samsung Tizen 4 runs a Chromium from 2017. */
(function () {
  'use strict';

  var API = 'https://canales-rd.monitor-portafolio.workers.dev/yt/live.json';
  var REFRESH_MS = 3 * 60 * 1000;
  var KEY = { left: 37, up: 38, right: 39, down: 40, ok: 13, back: 10009 };
  // Apps we can hand a video to, tried in this order.
  var YOUTUBE_APPS = ['111299001912', '9Ur5IzDKqV.TizenYouTube', 'xvvl3S1TT1.TizenTubeStandalone'];
  var STREMIO_APPS = ['SLiteTizen.StremioLite'];

  var $ = function (id) { return document.getElementById(id); };
  var data = [], hero = null, tiles = [], focus = { area: 'row', index: 0 }, touched = false, toastTimer = null;

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function hourText(d) {
    var h = d.getHours(), m = d.getMinutes(), ampm = h < 12 ? 'a. m.' : 'p. m.';
    h = h % 12; if (h === 0) h = 12;
    return h + ':' + pad(m) + ' ' + ampm;
  }
  function whenText(ms) {
    var d = new Date(ms), now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    if (d >= today) return 'hoy a las ' + hourText(d);
    if (d >= yesterday) return 'ayer a las ' + hourText(d);
    var days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    return 'el ' + days[d.getDay()] + ' a las ' + hourText(d);
  }
  function tickClock() { $('clock').textContent = hourText(new Date()); }

  function toast(msg) {
    var t = $('toast');
    t.textContent = msg; t.className = 'toast show';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.className = 'toast'; }, 5000);
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]; });
  }

  function liveThumb(id) { return 'https://i.ytimg.com/vi/' + id + '/hqdefault_live.jpg'; }
  function thumb(id) { return 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg'; }

  // How long ago it aired: YouTube says "hace 17 h", "hace 3 m" (months)...
  function agoText(r) {
    if (r.ago) {
      return 'Hace ' + r.ago.replace(/^hace /i, '').replace(/(\d+) min$/, '$1 minutos').replace(/(\d+) h$/, '$1 horas')
        .replace(/^1 horas$/, '1 hora').replace(/(\d+) m$/, '$1 meses').replace(/^1 meses$/, '1 mes').replace(/(\d+) d$/, '$1 días');
    }
    return r.published ? 'Subido ' + whenText(Date.parse(r.published)) : 'Grabado';
  }
  // A recorded broadcast keeps its "EN VIVO" title from when it aired: drop that prefix.
  function cleanTitle(t) {
    return String(t || '').replace(/^\s*(?:🔴\s*)?#?EN ?VIVO\s*[:|\/\-]?\s*/i, '').replace(/^\s*[|:\/\-]\s*/, '');
  }
  function videoOf(c) { return c.live ? c.videoId : c.recorded.videoId; }
  function titleOf(c) { return c.live ? c.title : cleanTitle(c.recorded.title); }

  function load() {
    $('checked').textContent = 'Revisando canales…';
    var x = new XMLHttpRequest();
    x.open('GET', API + '?t=' + Date.now(), true);
    x.timeout = 30000;
    x.onload = function () {
      try {
        var j = JSON.parse(x.responseText);
        data = j.channels || [];
        $('checked').textContent = 'Revisado a las ' + hourText(new Date(j.updated || Date.now()));
        render();
      } catch (e) { failed(); }
    };
    x.onerror = x.ontimeout = failed;
    x.send();
  }
  function failed() {
    $('checked').textContent = 'Sin conexión';
    if (!data.length) {
      $('heroTitle').textContent = 'No se pudo cargar la lista de canales.';
      $('heroHint').textContent = 'Revisa que el TV tenga internet. Lo intento de nuevo en un momento.';
    }
    setTimeout(load, 30000);
  }

  function render() {
    var live = [], rec = [], i, c;
    for (i = 0; i < data.length; i++) {
      c = data[i];
      if (c.live) live.push(c);
      else if (c.recorded && c.recorded.videoId) rec.push(c);
    }
    hero = live.length ? live[0] : (rec.length ? rec[0] : null);
    renderHero(hero, live.length);
    tiles = live.slice(1).concat(live.length ? rec : rec.slice(1));
    tiles.push({ more: true });
    renderRow();
    if (hero && !touched) focus = { area: 'hero', index: 0 };
    if (!hero && focus.area === 'hero') focus = { area: 'row', index: 0 };
    if (focus.index >= tiles.length) focus.index = tiles.length - 1;
    paintFocus();
  }

  function renderHero(h, liveCount) {
    var box = $('hero');
    if (!h) {
      box.className = 'hero off';
      $('heroImg').style.visibility = 'hidden';
      $('heroChannel').textContent = 'Ahora mismo';
      $('heroTitle').textContent = 'No hay programas para mostrar.';
      $('heroHint').textContent = 'Baja hasta «Canales 24 horas» para ver TV.';
      return;
    }
    box.className = h.live ? 'hero' : 'hero recorded';
    $('heroImg').style.visibility = 'visible';
    $('heroImg').src = h.live ? liveThumb(h.videoId) : thumb(h.recorded.videoId);
    $('heroChannel').textContent = h.name;
    $('heroTitle').textContent = titleOf(h);
    $('heroHint').textContent = h.live ? 'Pulsa OK para verlo' : agoText(h.recorded) + '. Pulsa OK para verlo.';
    $('shelfTitle').textContent = h.live
      ? (liveCount > 1 ? 'También en vivo, y lo último de cada canal' : 'Lo último de cada canal')
      : 'Ahora ningún canal está en vivo en YouTube. Esto es lo último que transmitieron:';
  }

  function renderRow() {
    var html = [], i, c, pic;
    for (i = 0; i < tiles.length; i++) {
      c = tiles[i];
      if (c.more) {
        html.push('<div class="tile more" id="t' + i + '"><span class="glyph">24</span><p class="name">Canales 24 horas</p><p class="state">Siempre en vivo</p></div>');
        continue;
      }
      pic = c.live ? liveThumb(c.videoId) : 'https://i.ytimg.com/vi/' + c.recorded.videoId + '/mqdefault.jpg';
      html.push('<div class="tile' + (c.live ? ' is-live' : '') + '" id="t' + i + '">' +
        '<div class="pic"><img src="' + pic + '" alt="">' + (c.live ? '<span class="mini-live">En vivo</span>' : '') + '</div>' +
        '<p class="name"><img class="avatar" src="' + (c.avatar || '') + '" alt="">' + esc(c.short || c.name) + '</p>' +
        '<p class="state">' + esc(c.live ? titleOf(c) : agoText(c.recorded)) + '</p></div>');
    }
    $('row').innerHTML = html.join('');
  }

  function paintFocus() {
    var i, el;
    $('hero').className = $('hero').className.replace(/\s*focus/g, '') + (focus.area === 'hero' ? ' focus' : '');
    for (i = 0; i < tiles.length; i++) {
      el = $('t' + i);
      if (el) el.className = el.className.replace(/\s*focus/g, '') + (focus.area === 'row' && focus.index === i ? ' focus' : '');
    }
    // keep the focused tile in view: 440px per tile, 4 tiles fit
    var shift = focus.area === 'row' ? Math.max(0, focus.index - 2) * 440 : 0;
    $('row').style.webkitTransform = $('row').style.transform = 'translateX(' + (-shift) + 'px)';
  }

  function launchOne(ids, control, k, onFail) {
    if (k >= ids.length) { onFail(); return; }
    try {
      window.tizen.application.launchAppControl(control, ids[k], function () {}, function () { launchOne(ids, control, k + 1, onFail); });
    } catch (e) { launchOne(ids, control, k + 1, onFail); }
  }

  // Inside TizenBrew the page has no `tizen` object: the module's service (service.js) opens apps.
  var SERVICE = 'http://127.0.0.1:8091';
  function askService(path, body, onFail) {
    var x = new XMLHttpRequest();
    x.open('POST', SERVICE + path, true);
    x.setRequestHeader('Content-Type', 'application/json');
    x.timeout = 15000;
    x.onload = function () { if (x.status !== 200) onFail(); };
    x.onerror = x.ontimeout = onFail;
    x.send(JSON.stringify(body));
  }

  function openVideo(name, videoId) {
    var url = 'https://www.youtube.com/watch?v=' + videoId;
    var fail = function () { toast('No pude abrir YouTube. Abre la app de YouTube y busca ' + name + '.'); };
    if (!window.tizen || !window.tizen.application) {
      if (/^http:\/\/127\.0\.0\.1:8081\//.test(window.location.href)) {
        toast('Abriendo ' + name + ' en YouTube…');
        askService('/youtube', { videoId: videoId }, fail);
      } else { window.location.href = url; }
      return;
    }
    toast('Abriendo ' + name + ' en YouTube…');
    var payload = [new window.tizen.ApplicationControlData('PAYLOAD', ['#play=' + videoId])];
    var ctl = new window.tizen.ApplicationControl('http://tizen.org/appcontrol/operation/view', url, null, null, payload);
    launchOne(YOUTUBE_APPS, ctl, 0, function () {
      toast('No pude abrir YouTube. Abre la app de YouTube y busca ' + name + '.');
    });
  }

  function openStremio() {
    if (!window.tizen || !window.tizen.application) {
      askService('/launch', { id: STREMIO_APPS[0] }, function () { toast('Abre Stremio desde el menú de apps.'); });
      return;
    }
    var k = 0;
    (function next() {
      if (k >= STREMIO_APPS.length) { toast('Abre Stremio desde el menú de apps.'); return; }
      try { window.tizen.application.launch(STREMIO_APPS[k++], function () {}, next); } catch (e) { next(); }
    })();
  }

  function activate() {
    var c = focus.area === 'hero' ? hero : tiles[focus.index];
    if (!c) return;
    if (c.more) { openStremio(); return; }
    openVideo(c.name, videoOf(c));
  }

  document.addEventListener('keydown', function (e) {
    var k = e.keyCode;
    touched = true;
    if (k === KEY.left && focus.area === 'row') { focus.index = Math.max(0, focus.index - 1); }
    else if (k === KEY.right && focus.area === 'row') { focus.index = Math.min(tiles.length - 1, focus.index + 1); }
    else if (k === KEY.up && hero) { focus = { area: 'hero', index: focus.index }; }
    else if (k === KEY.down) { focus = { area: 'row', index: focus.area === 'hero' ? 0 : focus.index }; }
    else if (k === KEY.ok) { activate(); return; }
    else if (k === KEY.back) {
      try { window.tizen.application.getCurrentApplication().exit(); } catch (err) {}
      return;
    } else { return; }
    e.preventDefault();
    paintFocus();
  });

  // Coming back to the app (after watching a video) checks again right away.
  document.addEventListener('visibilitychange', function () { if (!document.hidden) load(); });
  tickClock(); setInterval(tickClock, 15000);
  load(); setInterval(load, REFRESH_MS);
})();
