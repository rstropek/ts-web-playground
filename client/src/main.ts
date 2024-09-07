import "./style.css";
import tsTypeDefs from "./ts-dts";
import p5TypeDefs from "./p5-dts";
import ts from "typescript";
import * as monaco from "monaco-editor";
import "./editor";
import { exercise1 } from "./exercise";
import { Files } from "./files";
import Split from "split.js";

const files = new Files(exercise1);
monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
  exercise1.compilerOptions
);

const editor = document.getElementById("editor")! as HTMLDivElement;
const run = document.getElementById("run")! as HTMLButtonElement;
const iframe = document.getElementById("result-frame")! as HTMLIFrameElement;
const fileNames = document.getElementById("fileNames")! as HTMLSelectElement;
const output = document.getElementById("output-content")! as HTMLPreElement;
const userName = document.getElementById("userName")! as HTMLPreElement;

fetch("http://localhost:8080/me").then(async (response) => {
  if (response.status === /* forbidden */ 403) {
    userName.innerText = `Not signed in`;
  } else if (response.ok) {
    const data = await response.json();
    if (data.firstName) {
      userName.innerText = data.firstName;
    }
  }
});

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
  let fileContents = new Map<string, string>();

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
    [...files.getFileNames(), './p5/global.d.ts'],
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

  output.innerText = "";
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
      output.innerText += `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}\n`;
    } else {
      output.innerText += ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
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

  // let indexCode = fileContents.get("index.js")!;

  // // With regex, find all occurences of " from "./<something>.js"
  // const imports = indexCode.match(/ from "\.\/\w+\.js"/g);
  // if (imports) {
  //   for (const imp of imports) {
  //     const fileName = imp.substring(9, imp.length - 1);
  //     const fileContent = fileContents.get(fileName)!;
  //     indexCode = indexCode.replace(imp, ` from "data:text/javascript;base64,${btoa(fileContent)}"`);
  //   }
  // }

  // const jsBlob = new Blob([indexCode], { type: "application/javascript" });
  // const jsUrl = URL.createObjectURL(jsBlob);

  const blob = new Blob(
    [
      `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.10.0/p5.js"></script>
    ${topScripts}
    </head>
  <body>
    ${bodyScripts}
  </body>
</html>
`,
    ],
    { type: "text/html" }
  );
  const url = URL.createObjectURL(blob);
  iframe.src = url;
}

document.addEventListener("DOMContentLoaded", function () {
  Split(["#editor", "#result-area"], { direction: "horizontal" });
  Split(["#result", "#output"], {
    direction: "vertical",
    minSize: [10, 10],
    sizes: [80, 20],
  })
});
