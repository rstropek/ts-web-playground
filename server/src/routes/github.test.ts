import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import { fetchProxiedUrl, validateProxyUrl } from "./github.js";

const servers: Server[] = [];

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise<void>((resolve) => server.close(() => resolve()))));
});

describe("proxy URL validation", () => {
  it.each([
    "https://raw.githubusercontent.com/rstropek/ts-web-playground/main/exercises/emptyPlayground.yaml",
    "HTTPS://raw.githubusercontent.com/some/exercise.yaml",
    "http://localhost:5173/exercise.yaml",
    "http://127.0.0.1:8000/exercise.yaml",
    "http://[::1]:8000/exercise.yaml",
  ])("accepts %s", (candidate) => {
    expect(validateProxyUrl(candidate)?.toString()).toBeDefined();
  });

  it.each([
    "http://example.com/exercise.yaml",
    "file:///etc/passwd",
    "data:text/plain,hello",
    "ftp://example.com/exercise.yaml",
    "not a url",
    "",
  ])("rejects %s", (candidate) => {
    expect(validateProxyUrl(candidate)).toBeUndefined();
  });
});

describe("proxied fetch", () => {
  it("returns the response of an allowed URL", async () => {
    const url = await startServer((req, res) => {
      res.writeHead(200, { "Content-Type": "text/yaml" }).end(`title: ${req.url}`);
    });

    const result = await fetchProxiedUrl(`${url}/exercise.yaml`);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.response.status).toBe(200);
    expect(await result.response.text()).toBe("title: /exercise.yaml");
  });

  it("follows a redirect that stays within the allowed schemes", async () => {
    const url = await startServer((req, res) => {
      if (req.url === "/exercise.yaml") {
        res.writeHead(302, { Location: "/moved/exercise.yaml" }).end();
        return;
      }
      res.writeHead(200, { "Content-Type": "text/yaml" }).end("title: moved");
    });

    const result = await fetchProxiedUrl(`${url}/exercise.yaml`);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(await result.response.text()).toBe("title: moved");
  });

  it("refuses a redirect that leaves the allowed schemes", async () => {
    const url = await startServer((_req, res) => {
      res.writeHead(302, { Location: "http://example.com/exercise.yaml" }).end();
    });

    const result = await fetchProxiedUrl(`${url}/exercise.yaml`);

    expect(result).toEqual({ ok: false, reason: "rejected-url" });
  });

  it("gives up on a redirect loop", async () => {
    let hops = 0;
    const url = await startServer((_req, res) => {
      hops++;
      res.writeHead(302, { Location: `/hop-${hops}` }).end();
    });

    const result = await fetchProxiedUrl(`${url}/exercise.yaml`);

    expect(result).toEqual({ ok: false, reason: "too-many-redirects" });
    expect(hops).toBe(6);
  });

  it("does not fetch a URL with a rejected scheme at all", async () => {
    expect(await fetchProxiedUrl("file:///etc/passwd")).toEqual({ ok: false, reason: "rejected-url" });
    expect(await fetchProxiedUrl("http://example.com/exercise.yaml")).toEqual({ ok: false, reason: "rejected-url" });
  });
});

async function startServer(handler: (req: IncomingMessage, res: ServerResponse) => void) {
  const server = createServer(handler);
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Could not start test server");
  return `http://127.0.0.1:${address.port}`;
}
