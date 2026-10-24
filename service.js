// En vivo RD: helper that TizenBrew runs beside the page when the module opens.
// The page TizenBrew hosts has no `tizen` object; this service does, so the page asks it to
// open YouTube on a video (or Stremio). ES5 / Node 4 compatible. Loopback only.
(function () {
  'use strict';
  var http = require('http');
  var PORT = 8091;
  var ALLOWED_ORIGIN = 'http://127.0.0.1:8081';
  var YOUTUBE_APPS = ['111299001912', '9Ur5IzDKqV.TizenYouTube', 'xvvl3S1TT1.TizenTubeStandalone'];
  var VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
  var APP_ID = /^[A-Za-z0-9._-]{1,128}$/;

  function openVideo(videoId, done, fail) {
    var url = 'https://www.youtube.com/watch?v=' + videoId;
    var k = 0;
    (function next(lastError) {
      if (k >= YOUTUBE_APPS.length) { fail(lastError || 'No YouTube app answered'); return; }
      var id = YOUTUBE_APPS[k++];
      try {
        var data = [new tizen.ApplicationControlData('PAYLOAD', ['#play=' + videoId])];
        var ctl = new tizen.ApplicationControl('http://tizen.org/appcontrol/operation/view', url, null, null, data);
        tizen.application.launchAppControl(ctl, id, function () { done(id); }, function (e) { next(e && e.message); });
      } catch (e) { next(e && e.message); }
    })();
  }

  var server = http.createServer(function (req, res) {
    function reply(status, obj) {
      var body = JSON.stringify(obj);
      res.writeHead(status, {
        'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body),
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type', 'Cache-Control': 'no-store'
      });
      res.end(body);
    }
    if (req.method === 'OPTIONS') return reply(204, {});
    if (req.method === 'GET' && req.url === '/health') {
      return reply(200, { ok: true, tizen: typeof tizen !== 'undefined' });
    }
    if (req.method !== 'POST') return reply(404, { ok: false });
    var body = '';
    req.on('data', function (c) { body += c; if (body.length > 2048) req.destroy(); });
    req.on('end', function () {
      var data;
      try { data = JSON.parse(body); } catch (e) { return reply(400, { ok: false, error: 'Bad JSON' }); }
      if (typeof tizen === 'undefined') return reply(501, { ok: false, error: 'No tizen API in the service' });
      if (req.url === '/tizentube') {
        if (!VIDEO_ID.test(data.videoId || '')) return reply(400, { ok: false, error: 'Bad video id' });
        try {
          // TizenTube appends JSON {"args": "..."} from its app control data to youtube.com/tv.
          var payload = [new tizen.ApplicationControlData('PAYLOAD', [JSON.stringify({ args: 'v=' + data.videoId })])];
          var ctl = new tizen.ApplicationControl('http://tizen.org/appcontrol/operation/default', null, null, null, payload);
          return tizen.application.launchAppControl(ctl, 'xvvl3S1TT1.TizenTubeStandalone',
            function () { reply(200, { ok: true }); }, function (e) { reply(500, { ok: false, error: String(e && e.message) }); });
        } catch (e) { return reply(500, { ok: false, error: String(e && e.message) }); }
      }
      if (req.url === '/youtube') {
        if (!VIDEO_ID.test(data.videoId || '')) return reply(400, { ok: false, error: 'Bad video id' });
        return openVideo(data.videoId, function (app) { reply(200, { ok: true, app: app }); },
          function (err) { reply(500, { ok: false, error: String(err) }); });
      }
      if (req.url === '/launch') {
        if (!APP_ID.test(data.id || '')) return reply(400, { ok: false, error: 'Bad app id' });
        try {
          return tizen.application.launch(data.id, function () { reply(200, { ok: true }); },
            function (e) { reply(500, { ok: false, error: String(e && e.message) }); });
        } catch (e) { return reply(500, { ok: false, error: String(e && e.message) }); }
      }
      reply(404, { ok: false });
    });
    req.on('error', function () {});
  });
  server.on('error', function (e) { console.log('[envivo-rd] service: ' + e.code); });
  server.listen(PORT, '127.0.0.1');
})();
