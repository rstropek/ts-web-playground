import "./style.css";
import tsTypeDefs from "./ts-dts";
import p5TypeDefs from "./p5-dts";
import ts, { getConfigFileParsingDiagnostics } from "typescript";
import * as monaco from "monaco-editor";
import "./editor";
import { exercise1 } from "./exercise";
import { Files } from "./files";

const files = new Files(exercise1);
monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
  exercise1.compilerOptions
);

const editor = document.getElementById("editor")! as HTMLDivElement;
const run = document.getElementById("run")! as HTMLButtonElement;
const iframe = document.getElementById("resultFrame")! as HTMLIFrameElement;
const fileNames = document.getElementById("fileNames")! as HTMLSelectElement;

run.addEventListener("click", runCode);

for (const fileName of files.getFileNames()) {
  const option = document.createElement("option");
  option.value = fileName;
  option.text = fileName;
  fileNames.appendChild(option);
}

const initialFile = files.getFile("index.ts");
const monacoEditor = monaco.editor.create(editor, {
  model: initialFile!.model,
  language: "typescript",
  automaticLayout: true,
  readOnly: !initialFile?.isEditable,
});

fileNames.addEventListener("change", function () {
  const fileName = fileNames.value;
  const model = files.getFile(fileName)!.model;
  monacoEditor.setModel(model);
  monacoEditor.updateOptions({
    readOnly: !files.getFile(fileName)!.isEditable,
  });
});

function runCode() {
  let jsCode: string = "";
  const compilerHost = {
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

      jsCode = data;
    },
    getDefaultLibFileName: (options: any) => `lib.esnext.d.ts`,
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

  const ppfr = ts.preProcessFile(files.getFile("index.ts")!.model.getValue(), true, true);

  const program = ts.createProgram(
    [...files.getFileNames(), './p5/global.d.ts'],
    {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ESNext,
      sourceMap: false,
      skipLibCheck: true,
    },
    compilerHost
  );
  const emitResult = program.emit();
  let allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

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
      console.log(
        `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
      );
    } else {
      console.log(
        ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
      );
    }
  });

  // const jsCode = ts.transpile(editor.innerText);

  const jsBlob = new Blob([jsCode], { type: "application/javascript" });
  const jsUrl = URL.createObjectURL(jsBlob);

  const blob = new Blob(
    [
      `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.10.0/p5.min.js"></script>
    </head>
  <body>
    <script src="mycode.js"></script>
  </body>
</html>
`.replace("mycode.js", jsUrl),
    ],
    { type: "text/html" }
  );
  const url = URL.createObjectURL(blob);
  iframe.src = url;
}

document.addEventListener("DOMContentLoaded", function () {
  const divider = document.getElementById("divider")!;
  const leftPane = document.getElementById("editor")!;
  const rightPane = document.getElementById("resultFrame")!;

  let isDragging = false;

  divider.addEventListener("mousedown", function () {
    isDragging = true;
    document.body.style.cursor = "col-resize";
    rightPane.hidden = true;
  });

  document.addEventListener("mousemove", function (e) {
    if (!isDragging) return;

    const containerOffsetLeft = leftPane.parentElement!.offsetLeft;
    const pointerRelativeXpos = e.clientX - containerOffsetLeft;
    const parentWidth = leftPane.parentElement!.offsetWidth;
    const leftPaneWidth = pointerRelativeXpos;
    const rightPaneWidth = parentWidth - leftPaneWidth;

    leftPane.style.width = `${leftPaneWidth}px`;
    rightPane.style.width = `${rightPaneWidth}px`;
  });

  document.addEventListener("mouseup", function () {
    isDragging = false;
    document.body.style.cursor = "default";
    rightPane.hidden = false;
  });
});
