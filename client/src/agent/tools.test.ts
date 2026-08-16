import { describe, expect, it } from "vitest";
import type { editor, Uri } from "monaco-editor";
import type { Files } from "../files";
import {
  AGENT_TOOL_DEFINITIONS,
  createAgentTools,
  getTypescriptErrors,
  readFile,
  type MonacoToolsApi,
} from "./tools";

describe("agent file tools", () => {
  it("lists editable and read-only files and reads current unsaved model content", async () => {
    let unsaved = "const answer = 41;\nconsole.log(answer);";
    const files = fakeFiles([
      fakeFile("index.ts", "typescript", true, () => unsaved),
      fakeFile("styles.css", "css", false, () => "body {}"),
    ]);
    const spec = "# Draw a house\n\nUse loops where appropriate.";
    const tools = createAgentTools(files, fakeMonaco([]), spec);

    expect(JSON.parse(await tools.execute("list_files", {}))).toEqual([
      { filename: "index.ts", language: "typescript", editable: true, line_count: 2 },
      { filename: "styles.css", language: "css", editable: false, line_count: 1 },
    ]);

    unsaved = "const answer = 42;\nconsole.log(answer);";
    expect(JSON.parse(await tools.execute("read_file", {
      path: "index.ts",
      start_line: 1,
      end_line: 2,
    }))).toMatchObject({ content: unsaved });
    expect(await tools.execute("get_exercise_spec", {})).toBe(spec);
  });

  it.each([
    [{ path: "missing.ts", start_line: 1, end_line: 1 }, "Unknown exercise file"],
    [{ path: "index.ts", start_line: 1.5, end_line: 2 }, "must be integers"],
    [{ path: "index.ts", start_line: 2, end_line: 1 }, "must not be greater"],
    [{ path: "index.ts", start_line: 0, end_line: 1 }, "1-based"],
    [{ path: "index.ts", start_line: 1, end_line: 3 }, "exceeds"],
  ])("rejects invalid read ranges %#", (args, message) => {
    const files = fakeFiles([fakeFile("index.ts", "typescript", true, () => "one\ntwo")]);
    expect(() => readFile(files, args)).toThrow(message);
  });

  it("filters live markers to exercise TypeScript errors in deterministic order", () => {
    const tsFile = fakeFile("z.ts", "typescript", true, () => "bad");
    const otherTs = fakeFile("a.ts", "typescript", false, () => "bad");
    const cssFile = fakeFile("styles.css", "css", true, () => "bad");
    const files = fakeFiles([tsFile, otherTs, cssFile]);
    const markers = [
      marker(tsFile.model.uri, 8, "later", 2, 3, "2322", "ts"),
      marker(cssFile.model.uri, 8, "css error", 1, 1),
      marker(otherTs.model.uri, 4, "warning", 1, 1),
      marker(otherTs.model.uri, 8, "first", 1, 2, { value: "1000", target: otherTs.model.uri }),
      marker({ toString: () => "file:///outside.ts" } as Uri, 8, "outside", 1, 1),
      marker(otherTs.model.uri, 8, "earlier column", 1, 1),
    ];

    expect(getTypescriptErrors(files, fakeMonaco(markers))).toEqual([
      {
        filename: "a.ts",
        message: "earlier column",
        start: { line: 1, column: 1 },
        end: { line: 1, column: 2 },
      },
      {
        filename: "a.ts",
        code: "1000",
        message: "first",
        start: { line: 1, column: 2 },
        end: { line: 1, column: 3 },
      },
      {
        filename: "z.ts",
        code: "2322",
        source: "ts",
        message: "later",
        start: { line: 2, column: 3 },
        end: { line: 2, column: 4 },
      },
    ]);
  });

  it("registers exactly the four read-only tools", () => {
    expect(AGENT_TOOL_DEFINITIONS.map((tool) => tool.name)).toEqual([
      "list_files",
      "read_file",
      "get_typescript_errors",
      "get_exercise_spec",
    ]);
    expect(AGENT_TOOL_DEFINITIONS.map((tool) => tool.name).join(" ")).not.toMatch(/edit|write|insert|patch|save|run|fetch|terminal/);
  });
});

interface FakeFile {
  fileName: string;
  language: string;
  isEditable: boolean;
  model: {
    uri: Uri;
    getLineCount(): number;
    getLineContent(line: number): string;
  };
}

function fakeFile(fileName: string, language: string, isEditable: boolean, content: () => string): FakeFile {
  return {
    fileName,
    language,
    isEditable,
    model: {
      uri: { toString: () => `file:///${fileName}` } as Uri,
      getLineCount: () => content().split("\n").length,
      getLineContent: (line) => content().split("\n")[line - 1] ?? "",
    },
  };
}

function fakeFiles(files: FakeFile[]): Files {
  const byName = new Map(files.map((file) => [file.fileName, file]));
  return {
    getFileNames: () => [...byName.keys()],
    getFile: (fileName: string) => byName.get(fileName),
  } as unknown as Files;
}

function fakeMonaco(markers: editor.IMarker[]): MonacoToolsApi {
  return {
    MarkerSeverity: { Error: 8 },
    editor: { getModelMarkers: () => markers },
  };
}

function marker(
  resource: Uri,
  severity: number,
  message: string,
  line: number,
  column: number,
  code?: string | { value: string; target: Uri },
  source?: string,
): editor.IMarker {
  return {
    owner: "typescript",
    resource,
    severity,
    message,
    startLineNumber: line,
    startColumn: column,
    endLineNumber: line,
    endColumn: column + 1,
    ...(code === undefined ? {} : { code }),
    ...(source === undefined ? {} : { source }),
  };
}
