function init(lotameClientId: number){
  return `! function() {
    var lotameClientId = '${lotameClientId}';
    var lotameTagInput = {
        data: {},
        config: {
          clientId: Number(lotameClientId),
          audienceLocalStorage: true,
        }
    };

    // Lotame initialization
    var lotameConfig = lotameTagInput.config || {};
    var namespace = window['lotame_' + lotameConfig.clientId] = {};
    namespace.config = lotameConfig;
    namespace.data = lotameTagInput.data || {};
    namespace.cmd = namespace.cmd || [];
  } ()`;
}

export default init;
