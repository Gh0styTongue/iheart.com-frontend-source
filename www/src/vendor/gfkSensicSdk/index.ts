function init(name: string, script: string, isDev: boolean): string{
  return `
  var gfkS2sConf = {
    media: '${name}',
    url: '${script}',
    type: 'WEB',
    optin: true,
    ${isDev ? "logLevel: 'debug'," : ''}
  };
  (function (w, d, c, s, id, v) {
    
    if (d.getElementById(id)) {
        return;
    }
  
    w.gfkS2sConf = c;
    w[id] = {};
    w[id].agents = [];
    var api = ["playStreamLive", "playStreamOnDemand", "stop", "skip", "screen", "volume", "impression"];
    w.gfks = (function () {
        function f(sA, e, cb) {
            return function () {
                sA.p = cb();
                sA.queue.push({f: e, a: arguments});
            };
        }
        function s(c, pId, cb) {
            var sA = {queue: [], config: c, cb: cb, pId: pId};
            for (var i = 0; i < api.length; i++) {
                var e = api[i];
                sA[e] = f(sA, e, cb);
            }
            return sA;
        }
        return s;
    }());
    w[id].getAgent = function (cb, pId) {
        var a = {
            a: new w.gfks(c, pId || "", cb || function () {
                return 0;
            })
        };
        function g(a, e) {
            return function () {
                return a.a[e].apply(a.a, arguments);
            }
        }
        for (var i = 0; i < api.length; i++) {
            var e = api[i];
            a[e] = g(a, e);
        }
        w[id].agents.push(a);
        return a;
    };
  
    var lJS = function (eId, url) {
        var tag = d.createElement(s);
        var el = d.getElementsByTagName(s)[0];
        tag.id = eId;
        tag.async = true;
        tag.type = 'text/javascript';
        tag.src = url;
        el.parentNode.insertBefore(tag, el);
    };
  
    if (c.hasOwnProperty(v)) {lJS(id + v, c[v]);}
    lJS(id, c.url);
})(window, document, gfkS2sConf, 'script', 'gfkS2s', 'visUrl');`
}

export default init;
