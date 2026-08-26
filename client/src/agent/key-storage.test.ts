import { afterEach, describe, expect, it, vi } from "vitest";
import { clearStoredApiKey, getStoredApiKey, setStoredApiKey } from "./key-storage";

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

function stubStorage(initial: Record<string, string> = {}) {
  const entries = new Map(Object.entries(initial));
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => { entries.set(key, value); },
    removeItem: (key: string) => { entries.delete(key); },
  });
}
