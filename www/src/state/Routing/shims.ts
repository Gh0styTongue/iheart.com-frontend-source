export function updateUrl(path: string) {
  window.history.replaceState({}, '', path);
}
