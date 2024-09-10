import "./style.css";
import * as monaco from "monaco-editor";
import "./editor";
import { getExerciseUrlFromQueryString, loadExercise } from "./exercise";
import { Files } from "./files";
import Split from "split.js";
import { compile } from "./compile";
import purify from "dompurify";
import { marked } from "marked";

const editor = document.getElementById("editor")! as HTMLDivElement;
const run = document.getElementById("run")! as HTMLButtonElement;
const iframe = document.getElementById("result-frame")! as HTMLIFrameElement;
const fileNames = document.getElementById("fileNames")! as HTMLSelectElement;
const output = document.getElementById("output-content")! as HTMLPreElement;
const userName = document.getElementById("userName")! as HTMLPreElement;
const resultSelector = document.getElementById(
  "result-selector"
)! as HTMLDivElement;
const specSelector = document.getElementById(
  "spec-selector"
)! as HTMLDivElement;
const spec = document.getElementById("spec")! as HTMLDivElement;
const title = document.getElementById("title")! as HTMLDivElement;

spec.style.display = "none";
resultSelector.addEventListener("click", () => {
  resultSelector.classList.add("selected");
  specSelector.classList.remove("selected");
  spec.style.display = "none";
  iframe.style.display = "";
});
specSelector.addEventListener("click", () => {
  resultSelector.classList.remove("selected");
  specSelector.classList.add("selected");
  spec.style.display = "";
  iframe.style.display = "none";
});

const exerciseUrl = getExerciseUrlFromQueryString();

if (!exerciseUrl) {
  throw new Error("No exercise URL found in query string");
}

loadExercise(exerciseUrl).then((ex1) => {
  const files = new Files(ex1);
  title.innerText = purify.sanitize(ex1.title);
  spec.innerHTML = purify.sanitize(marked.parse(ex1.descriptionMd) as string);

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    allowSyntheticDefaultImports: true,
    //moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.None,
  });

  fetch("/me").then(async (response) => {
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

  Split(["#editor", "#result-area"], { direction: "horizontal" });
  Split(["#result", "#output"], {
    direction: "vertical",
    minSize: [10, 10],
    sizes: [80, 20],
  });
});
