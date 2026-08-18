import type * as monaco from "monaco-editor";
import type { Tool } from "@ag-ui/client";
import type { Files } from "../files";

export const AGENT_TOOL_DEFINITIONS: Tool[] = [
  {
    name: "list_files",
    description: "List every file in the current exercise, including read-only files.",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "read_file",
    description: "Read a 1-based inclusive line range from the current unsaved contents of an exercise file. A range reaching past the end of the file is clamped to the last line; the response reports the actual range and the file's line_count.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "Exact exercise filename." },
        start_line: { type: "integer", minimum: 1 },
        end_line: { type: "integer", minimum: 1 },
      },
      required: ["path", "start_line", "end_line"],
      additionalProperties: false,
    },
  },
  {
    name: "get_typescript_errors",
    description: "Get current Monaco error diagnostics for the exercise's TypeScript files.",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "get_exercise_spec",
    description: "Get the current exercise specification as its original Markdown.",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
];

export interface MonacoToolsApi {
  MarkerSeverity: { Error: number };
  editor: {
    getModelMarkers(filter?: { owner?: string; resource?: monaco.Uri }): monaco.editor.IMarker[];
  };
}

export interface AgentToolSet {
  definitions: Tool[];
  execute(name: string, args: unknown): Promise<string>;
}

export function createAgentTools(
  files: Files,
  monacoApi: MonacoToolsApi,
  exerciseSpecMarkdown: string,
): AgentToolSet {
  return {
    definitions: AGENT_TOOL_DEFINITIONS,
    async execute(name, args) {
      switch (name) {
        case "list_files":
          expectNoArguments(args, name);
          return JSON.stringify(listFiles(files), null, 2);
        case "read_file":
          return JSON.stringify(readFile(files, args), null, 2);
        case "get_typescript_errors":
          expectNoArguments(args, name);
          return JSON.stringify(getTypescriptErrors(files, monacoApi), null, 2);
        case "get_exercise_spec":
          expectNoArguments(args, name);
          return exerciseSpecMarkdown;
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    },
  };
}

export function listFiles(files: Files) {
  return files.getFileNames().sort().map((fileName) => {
    const file = files.getFile(fileName)!;
    return {
      filename: file.fileName,
      language: file.language,
      editable: file.isEditable,
      line_count: file.model.getLineCount(),
    };
  });
}

export function readFile(files: Files, args: unknown) {
  const input = expectObject(args, "read_file");
  const path = input.path;
  const startLine = input.start_line;
  const endLine = input.end_line;

  if (typeof path !== "string" || !path) {
    throw new Error("read_file.path must be a non-empty string.");
  }
  if (!Number.isInteger(startLine) || !Number.isInteger(endLine)) {
    throw new Error("read_file line numbers must be integers.");
  }

  const file = files.getFile(path);
  if (!file) {
    throw new Error(`Unknown exercise file: ${path}`);
  }
  const lineCount = file.model.getLineCount();
  if ((startLine as number) < 1 || (endLine as number) < 1) {
    throw new Error("read_file line numbers are 1-based and must be positive.");
  }
  if ((startLine as number) > (endLine as number)) {
    throw new Error("read_file.start_line must not be greater than end_line.");
  }

  const lastLine = Math.min(endLine as number, lineCount);
  const content: string[] = [];
  for (let line = startLine as number; line <= lastLine; line++) {
    content.push(file.model.getLineContent(line));
  }
  return {
    path,
    start_line: startLine,
    end_line: lastLine,
    line_count: lineCount,
    content: content.join("\n"),
  };
}

export function getTypescriptErrors(files: Files, monacoApi: MonacoToolsApi) {
  const typeScriptFiles = files.getFileNames()
    .map((fileName) => files.getFile(fileName)!)
    .filter((file) => file.language === "typescript");
  const exerciseModels = new Map(typeScriptFiles.map((file) => [file.model.uri.toString(), file.fileName]));

  return monacoApi.editor.getModelMarkers({})
    .filter((marker) => marker.severity === monacoApi.MarkerSeverity.Error)
    .flatMap((marker) => {
      const filename = exerciseModels.get(marker.resource.toString());
      if (!filename) return [];
      return [{
        filename,
        ...(marker.code === undefined ? {} : { code: markerCode(marker.code) }),
        ...(marker.source === undefined ? {} : { source: marker.source }),
        message: marker.message,
        start: { line: marker.startLineNumber, column: marker.startColumn },
        end: { line: marker.endLineNumber, column: marker.endColumn },
      }];
    })
    .sort((a, b) =>
      a.filename.localeCompare(b.filename) ||
      a.start.line - b.start.line ||
      a.start.column - b.start.column ||
      a.end.line - b.end.line ||
      a.end.column - b.end.column ||
      a.message.localeCompare(b.message));
}

function markerCode(code: string | { value: string }): string {
  return typeof code === "string" ? code : code.value;
}

function expectObject(args: unknown, toolName: string): Record<string, unknown> {
  if (typeof args !== "object" || args === null || Array.isArray(args)) {
    throw new Error(`${toolName} arguments must be an object.`);
  }
  return args as Record<string, unknown>;
}

function expectNoArguments(args: unknown, toolName: string) {
  const input = expectObject(args, toolName);
  if (Object.keys(input).length) {
    throw new Error(`${toolName} does not accept arguments.`);
  }
}
