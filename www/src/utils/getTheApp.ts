const BASE_URL = 'https://iheart.onelink.me/Ff5B/GetTheApp';

const navigateSafariCompatible: (url: string) => void = (url: string) => {
  // go to correct app download page - timeout is a workaround for a safari bug
  setTimeout(() => {
    window.open(url, 'new_tab');
  }, 0);
};

export default function getTheApp(): void {
  return navigateSafariCompatible(BASE_URL);
}
