import "./style.css";
import * as monaco from "monaco-editor";
import "./editor";
import { exercise1 } from "./exercise";
import { Files } from "./files";
import Split from "split.js";
import { compile } from "./compile";

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
    userName.innerText = `Anonymous`;
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

async function runCode() {
  const { blobUrl, errorOutput } = await compile(files);
  output.innerText = errorOutput;
  iframe.src = blobUrl;
}

document.addEventListener("DOMContentLoaded", function () {
  Split(["#editor", "#result-area"], { direction: "horizontal" });
  Split(["#result", "#output"], {
    direction: "vertical",
    minSize: [10, 10],
    sizes: [80, 20],
  })
});
