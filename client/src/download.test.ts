import { describe, expect, it } from "vitest";
import { strFromU8, unzipSync } from "fflate";
import { buildDownload, toSafeFileName } from "./download";

describe("buildDownload", () => {
  it("returns nothing when there are no files", () => {
    expect(buildDownload([], "House")).toBeUndefined();
  });

  it("downloads a single file as it is", async () => {
    const download = buildDownload([{ fileName: "index.ts", content: "let x = 1;\n" }], "House");

    expect(download?.fileName).toBe("index.ts");
    expect(await download?.blob.text()).toBe("let x = 1;\n");
  });

  it("bundles multiple files into a zip named after the exercise", async () => {
    const download = buildDownload(
      [
        { fileName: "index.ts", content: "import { a } from './snowman';\n" },
        { fileName: "snowman.ts", content: "export const a = 'Schneemann ☃';\n" },
      ],
      "Melting Snowman (2)"
    );

    expect(download?.fileName).toBe("Melting Snowman (2).zip");
    expect(download?.blob.type).toBe("application/zip");

    const entries = unzipSync(new Uint8Array(await download!.blob.arrayBuffer()));
    expect(Object.keys(entries).sort()).toEqual(["index.ts", "snowman.ts"]);
    expect(strFromU8(entries["snowman.ts"])).toBe("export const a = 'Schneemann ☃';\n");
  });
});

describe("toSafeFileName", () => {
  it("removes characters that are invalid in file names", () => {
    expect(toSafeFileName('A/B\\C: "D"? <E>|*')).toBe("ABC D E");
  });

  it("falls back to a default name", () => {
    expect(toSafeFileName("  ...  ")).toBe("exercise");
    expect(toSafeFileName("")).toBe("exercise");
  });
});
