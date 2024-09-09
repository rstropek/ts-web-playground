import ts from "typescript";
import { Files } from "./files";
import tsTypeDefs from "./ts-dts";
import p5TypeDefs from "./p5-dts";

export type CompileResult = {
  blobUrl: string;
  errorOutput: string;
};

let lastBlobUrl: string | undefined;
let lastErrorOutput: string | undefined;
let lastHash: Uint8Array | undefined;

function areEqual(a1: Uint8Array, a2: Uint8Array): boolean {
  if (a1.length !== a2.length) {
    return false;
  }

  for (let i = 0; i < a1.length; i++) {
    if (a1[i] !== a2[i]) {
      return false;
    }
  }

  return true;
}

export async function compile(files: Files): Promise<CompileResult> {
  // If the content of the files has not changed, return the last result.
  // this is important to enable debugging. Only if the blob url remains
  // unchanged, breakpoints will be hit.
  const newHash = await files.getHash();
  if (lastHash && areEqual(lastHash, newHash)) {
    return { blobUrl: lastBlobUrl!, errorOutput: lastErrorOutput! };
  }

  lastHash = newHash;

  if (lastBlobUrl) {
    // Destroy the last blob url to make sure it can be garbage collected.
    URL.revokeObjectURL(lastBlobUrl);
  }

  let fileContents = new Map<string, string>();

  const compilerHost: ts.CompilerHost = {
    getSourceFile: (fileName: any, languageVersion: any) => {
      const sourceText = files.getFile(fileName)?.model.getValue();
      if (!sourceText) {
        if (fileName.startsWith("p5/")) {
          return ts.createSourceFile(
            fileName,
            p5TypeDefs[fileName.substring(3)],
            languageVersion
          );
        } else if (fileName.startsWith("node_modules/@types/p5/")) {
          return ts.createSourceFile(
            fileName,
            p5TypeDefs[fileName.substring(23)],
            languageVersion
          );
        } else if (tsTypeDefs.hasOwnProperty(fileName)) {
          return ts.createSourceFile(
            fileName,
            tsTypeDefs[fileName],
            languageVersion
          );
        }
      }

      return sourceText !== undefined
        ? ts.createSourceFile(fileName, sourceText, languageVersion)
        : undefined;
    },
    writeFile: (fileName: any, data: any) => {
      fileContents.set(fileName, data);
    },
    getDefaultLibFileName: (_options: any) => `lib.esnext.d.ts`,
    useCaseSensitiveFileNames: () => true,
    getCanonicalFileName: (fileName: any) => fileName,
    getCurrentDirectory: () => "",
    getNewLine: () => "\n",
    fileExists: (fileName: any) => files.getFile(fileName) !== undefined,
    readFile: (fileName: any) => {
      return files.getFile(fileName)?.model.getValue();
    },
  };

  const program = ts.createProgram(
    [
      ...files.getFileNames().filter((fn) => fn.endsWith(".ts")),
      "./p5/global.d.ts",
    ],
    {
      module: ts.ModuleKind.None,
      target: ts.ScriptTarget.ESNext,
      sourceMap: false,
      skipLibCheck: true,
      lib: ["lib.esnext.d.ts", "lib.dom.d.ts"],
    },
    compilerHost
  );
  const emitResult = program.emit();
  let allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  let errorOutput = "";
  allDiagnostics.forEach((diagnostic) => {
    if (diagnostic.file) {
      let { line, character } = ts.getLineAndCharacterOfPosition(
        diagnostic.file,
        diagnostic.start!
      );
      let message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n"
      );
      errorOutput += `${diagnostic.file.fileName} (${line + 1},${
        character + 1
      }): ${message}\n`;
    } else {
      errorOutput += ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n"
      );
    }
  });

  let topScripts = ``;
  for (const [fileName, content] of fileContents) {
    if (fileName !== "index.js") {
      topScripts += `<script>${content}</script>`;
    }
  }
  const bodyScripts = `<script>${fileContents.get("index.js")}</script>`;

  const blob = new Blob(
    [
      files
        .getFile("index.html")!
        .content.replace("{{topScripts}}", topScripts)
        .replace("{{bodyScripts}}", bodyScripts),
    ],
    { type: "text/html" }
  );
  const blobUrl = URL.createObjectURL(blob);

  lastBlobUrl = blobUrl;
  lastErrorOutput = errorOutput;
  return { blobUrl, errorOutput };
}
