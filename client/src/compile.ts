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

export async function compile(files: Files): Promise<CompileResult> {
  const newHash = await files.getHash();
  if (lastHash) {
    let equal = true;
    if (newHash.length !== lastHash.length) {
      equal = false;
    } else {
      for (let i = 0; i < newHash.length; i++) {
        if (newHash[i] !== lastHash[i]) {
          equal = false;
          break;
        }
      }
    }

    if (equal) {
      return { blobUrl: lastBlobUrl!, errorOutput: lastErrorOutput! };
    }
  }

  lastHash = newHash;

  let fileContents = new Map<string, string>();

  const compilerHost: ts.CompilerHost = {
    getSourceFile: (fileName: any, languageVersion: any) => {
      console.log(`getSourceFile: ${fileName}`);
      const sourceText = files.getFile(fileName)?.model.getValue();
      //console.log(`getSourceFile: ${sourceText}`);
      if (!sourceText) {
        if (fileName.startsWith("p5/")) {
          console.log(`Found p5TypeDefs: ${fileName}`);
          return ts.createSourceFile(
            fileName,
            p5TypeDefs[fileName.substring(3)],
            languageVersion
          );
        } else if (fileName.startsWith("node_modules/@types/p5/")) {
          console.log(`Found p5TypeDefs: ${fileName}`);
          return ts.createSourceFile(
            fileName,
            p5TypeDefs[fileName.substring(23)],
            languageVersion
          );
        } else if (tsTypeDefs.hasOwnProperty(fileName)) {
          console.log(`Found tsTypeDefs: ${fileName}`);
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
      console.log(`writeFile: ${fileName}`);
      for (const line of data.split("\n")) {
        console.log(`${line}`);
      }

      fileContents.set(fileName, data);
    },
    getDefaultLibFileName: (_options: any) => `lib.esnext.d.ts`,
    useCaseSensitiveFileNames: () => true,
    getCanonicalFileName: (fileName: any) => fileName,
    getCurrentDirectory: () => "",
    getNewLine: () => "\n",
    fileExists: (fileName: any) => files.getFile(fileName) !== undefined,
    readFile: (fileName: any) => {
      console.log(`readFile: ${fileName}`);
      return files.getFile(fileName)?.model.getValue();
    },
  };

  //const _ = ts.preProcessFile(files.getFile("index.ts")!.model.getValue(), true, true);

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

  // const jsCode = ts.transpile(editor.innerText);

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
