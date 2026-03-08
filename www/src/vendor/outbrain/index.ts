function init(obId: string): string {
  return `
    !function(_window, _document) {
        if (_window.obApi) {const toArray = function(object) {return Object.prototype.toString.call(object) === '[object Array]' ? object : [object];};
        _window.obApi.marketerId = toArray(_window.obApi.marketerId).concat(toArray("${obId}"));return;}
        var api = _window.obApi = function() {
            api.dispatch ? api.dispatch.apply(api, arguments) : api.queue.push(arguments);
        };
        api.version = '1.1';api.loaded = true;
        api.marketerId = "${obId}";api.queue = [];
        const tag = _document.createElement('script');tag.async = true;tag.src = '//amplify.outbrain.com/cp/obtp.js';tag.type = 'text/javascript';
        const script = _document.getElementsByTagName('script')[0];script.parentNode.insertBefore(tag, script);}(window, document);
    `;
  }

export default init;
