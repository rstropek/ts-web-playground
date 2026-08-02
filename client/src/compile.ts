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

function getP5TypeDef(fileName: string): string | undefined {
  let normalizedFileName = fileName;
  if (normalizedFileName.startsWith("./")) {
    normalizedFileName = normalizedFileName.substring(2);
  } else if (normalizedFileName.startsWith("/")) {
    normalizedFileName = normalizedFileName.substring(1);
  }

  const prefixes = ["p5/", "node_modules/p5/types/"];
  for (const prefix of prefixes) {
    if (normalizedFileName.startsWith(prefix)) {
      return p5TypeDefs[normalizedFileName.substring(prefix.length)];
    }
  }

  return undefined;
}

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
      console.debug("getSourceFile", fileName);

      const sourceText = files.getFile(fileName)?.model.getValue();
      if (!sourceText) {
        const p5TypeDef = getP5TypeDef(fileName);
        if (p5TypeDef !== undefined) {
          return ts.createSourceFile(fileName, p5TypeDef, languageVersion);
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
    fileExists: (fileName: any) =>
      files.getFile(fileName) !== undefined ||
      getP5TypeDef(fileName) !== undefined ||
      tsTypeDefs.hasOwnProperty(fileName),
    readFile: (fileName: any) => {
      return (
        files.getFile(fileName)?.model.getValue() ??
        getP5TypeDef(fileName) ??
        tsTypeDefs[fileName]
      );
    },
  };

  const program = ts.createProgram(
    [
      ...files.getFileNames().filter((fn) => fn.endsWith(".ts")),
      "./p5/global.d.ts",
    ],
    {
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
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
  // Inject a console object that sends messages to the parent window.
  topScripts += `
    <script>
      oldConsole = console;
      console = {
        ...oldConsole,
        info(...args) {
          window.parent.postMessage({ type: "console.info", data: args }, "*");
        },
        debug(...args) {
          window.parent.postMessage({ type: "console.debug", data: args }, "*");
        },
        log(...args) {
          window.parent.postMessage({ type: "console.log", data: args }, "*");
        },
        warn(...args) {
          window.parent.postMessage({ type: "console.warn", data: args }, "*");
        },
        error(...args) {
          window.parent.postMessage({ type: "console.error", data: args }, "*");
        }
      };
    </script>
    `;
  
  for (const [fileName, content] of fileContents) {
    if (fileName !== "index.js") {
      topScripts += `<script>${content}</script>`;
    }
  }
  const bodyScripts = `<script>${fileContents.get("index.js")}</script>`;

  const p5Source = `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' : ''}${window.location.port}/libs/p5.min.js`;
  const blob = new Blob(
    [
      files
        .getFile("index.html")!
        .content.replace("{{topScripts}}", topScripts)
        .replace("{{bodyScripts}}", bodyScripts)
        .replace("{{p5Source}}", p5Source),
    ],
    { type: "text/html" }
  );
  const blobUrl = URL.createObjectURL(blob);

  lastBlobUrl = blobUrl;
  lastErrorOutput = errorOutput;
  return { blobUrl, errorOutput };
}
