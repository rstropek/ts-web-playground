// The student's Novedu API key, remembered across page loads so that moving to
// the next exercise (a full page load - the playground has no client routing)
// does not mean pasting the key again.
//
// Every access is guarded: private-browsing modes and locked-down school
// profiles make localStorage throw rather than simply return nothing, and a
// missing key only costs a re-paste, so failing quietly is the right call.

const KEY_API_KEY = "noveduApiKey";

export function getStoredApiKey(): string | undefined {
  try {
    return localStorage.getItem(KEY_API_KEY)?.trim() || undefined;
  } catch {
    return undefined;
  }
}

export function setStoredApiKey(apiKey: string) {
  try {
    localStorage.setItem(KEY_API_KEY, apiKey);
  } catch {
    // The agent still works for this page load, it just will not be remembered.
  }
}

// Workshop links can carry a key as `#noveduApiKey=nvk-…`. The fragment never
// leaves the browser, so the key stays out of server logs and Referer headers.
// It is stored like a pasted key - the startup check still decides whether it
// works - and removed from the address bar at once, so it does not linger on a
// projected screen or in the history.
export function adoptApiKeyFromUrl() {
  const params = new URLSearchParams(window.location.hash.slice(1));
  if (!params.has(KEY_API_KEY)) return;

  const apiKey = params.get(KEY_API_KEY)?.trim();
  if (apiKey) setStoredApiKey(apiKey);
  params.delete(KEY_API_KEY);
  const rest = params.toString();
  history.replaceState(history.state, "", `${window.location.pathname}${window.location.search}${rest ? `#${rest}` : ""}`);
}

export function clearStoredApiKey() {
  try {
    localStorage.removeItem(KEY_API_KEY);
  } catch {
    // Nothing to do - there is no way to forget what we cannot reach.
  }
}
