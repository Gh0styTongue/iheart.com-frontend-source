const botUsers = ['Googlebot', 'facebookexternalhit'];
export default () =>
  __CLIENT__ &&
  botUsers.reduce((isBot, agent) => {
    if (window.navigator.userAgent.includes(agent)) return true;
    return isBot;
  }, false);
