import { afterEach, describe, expect, it, vi } from "vitest";
import { adoptApiKeyFromUrl, clearStoredApiKey, getStoredApiKey, setStoredApiKey } from "./key-storage";

describe("key storage", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("round-trips a key and forgets it on request", () => {
    stubStorage();

    expect(getStoredApiKey()).toBeUndefined();
    setStoredApiKey("nvk-key");
    expect(getStoredApiKey()).toBe("nvk-key");

    clearStoredApiKey();
    expect(getStoredApiKey()).toBeUndefined();
  });

  it("treats a blank stored value as no key", () => {
    stubStorage({ noveduApiKey: "   " });
    expect(getStoredApiKey()).toBeUndefined();
  });

  // Private-browsing modes and locked-down school profiles throw on access.
  // Losing the convenience is fine; taking the agent down with it is not.
  it("degrades to no key when local storage is unusable", () => {
    vi.stubGlobal("localStorage", {
      getItem() { throw new Error("denied"); },
      setItem() { throw new Error("denied"); },
      removeItem() { throw new Error("denied"); },
    });

    expect(() => setStoredApiKey("nvk-key")).not.toThrow();
    expect(() => clearStoredApiKey()).not.toThrow();
    expect(getStoredApiKey()).toBeUndefined();
  });
});

describe("key from the URL", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("stores the key and removes it from the address bar", () => {
    stubStorage({ noveduApiKey: "nvk-old" });
    const replaceState = stubLocation("?exerciseUrl=x", "#noveduApiKey=nvk-workshop");

    adoptApiKeyFromUrl();

    expect(getStoredApiKey()).toBe("nvk-workshop");
    expect(replaceState).toHaveBeenCalledWith(null, "", "/playground/?exerciseUrl=x");
  });

  it("keeps other fragment parameters", () => {
    stubStorage();
    const replaceState = stubLocation("", "#a=1&noveduApiKey=nvk-workshop");

    adoptApiKeyFromUrl();

    expect(replaceState).toHaveBeenCalledWith(null, "", "/playground/#a=1");
  });

  it("leaves the stored key and the URL alone without a key in the URL", () => {
    stubStorage({ noveduApiKey: "nvk-old" });
    const replaceState = stubLocation("?exerciseUrl=x", "");

    adoptApiKeyFromUrl();

    expect(getStoredApiKey()).toBe("nvk-old");
    expect(replaceState).not.toHaveBeenCalled();
  });

  it("does not overwrite the stored key with a blank one", () => {
    stubStorage({ noveduApiKey: "nvk-old" });
    stubLocation("", "#noveduApiKey=");

    adoptApiKeyFromUrl();

    expect(getStoredApiKey()).toBe("nvk-old");
  });
});

function stubLocation(search: string, hash: string) {
  const replaceState = vi.fn();
  vi.stubGlobal("window", { location: { pathname: "/playground/", search, hash } });
  vi.stubGlobal("history", { state: null, replaceState });
  return replaceState;
}

function stubStorage(initial: Record<string, string> = {}) {
  const entries = new Map(Object.entries(initial));
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => { entries.set(key, value); },
    removeItem: (key: string) => { entries.delete(key); },
  });
}
