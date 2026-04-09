const PARAM_KEY = "bouquet";

export function encodeBouquetState(state) {
  const json = JSON.stringify(state);
  return btoa(unescape(encodeURIComponent(json)));
}

export function decodeBouquetState(value) {
  try {
    const json = decodeURIComponent(escape(atob(value)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getSharedBouquet() {
  const url = new URL(window.location.href);
  const encoded = url.searchParams.get(PARAM_KEY);
  return encoded ? decodeBouquetState(encoded) : null;
}

export function buildShareUrl(state) {
  const url = new URL(window.location.href);
  url.searchParams.set(PARAM_KEY, encodeBouquetState(state));
  return url.toString();
}

export function clearShareParam() {
  const url = new URL(window.location.href);
  url.searchParams.delete(PARAM_KEY);
  window.history.replaceState({}, "", url);
}
