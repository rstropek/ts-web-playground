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
const save = document.getElementById("save")! as HTMLButtonElement;
const loadSolution = document.getElementById("loadSolution")! as HTMLButtonElement;
const iframe = document.getElementById("result-frame")! as HTMLIFrameElement;
const fileNames = document.getElementById("fileNames")! as HTMLSelectElement;
const output = document.getElementById("output-content")! as HTMLPreElement;
const userName = document.getElementById("userName")! as HTMLDivElement;
const resultSelector = document.getElementById(
  "result-selector"
)! as HTMLDivElement;
const specSelector = document.getElementById(
  "spec-selector"
)! as HTMLDivElement;
const spec = document.getElementById("spec")! as HTMLDivElement;
const title = document.getElementById("title")! as HTMLDivElement;
const message = document.getElementById("message")! as HTMLDialogElement;

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
  message.querySelector('p')!.innerText = `Exercise URL missing in query string`;
  (message.querySelector('#ok')! as HTMLButtonElement).style.display = "none";
  message.showModal();
  throw new Error("No exercise URL found in query string");
}

loadExercise(exerciseUrl).then((ex1) => {
  if (!ex1.sampleSolution) {
    loadSolution.style.display = "none";
  }

  loadSolution.addEventListener("click", async () => {
    // ask user with an alert if they want to load the sample solution
    if (ex1.sampleSolution && confirm("Are you sure you want to load the sample solution? This will replace all your changes.\n\nTry your very best to solve the exercise yourself before using the sample solution!")) {
      let response = await fetch(`/github/exercise/proxy?exerciseUrl=${encodeURIComponent(ex1.sampleSolution)}`, { redirect: "manual" });
      if (!response.ok) {
        // Try to load it directly
        response = await fetch(ex1.sampleSolution);
      }
    
      const content = await response.text();
      files.getFile("index.ts")?.replaceContent(content);
    }
  });
  

  const files = new Files(ex1);
  title.innerText = purify.sanitize(ex1.title);
  let specContent = purify.sanitize(marked.parse(ex1.descriptionMd) as string);

  specContent = specContent.replace(
    /<img\s+[^>]*src="(https:\/\/[^"]*)"[^>]*>/g,
    (match, originalUrl) => {
      return match.replace(
        originalUrl,
        `/github/exercise/image-proxy?imageUrl=${encodeURIComponent(originalUrl)}`
      );
    }
  );

  spec.innerHTML = specContent;

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    allowSyntheticDefaultImports: true,
    //moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.ESNext,
  });

  fetch("/me").then(async (response) => {
    if (response.status === /* forbidden */ 403 || response.status === /* not found */ 404) {
      userName.innerText = `Anonymous`;
      save.style.display = "none";
    } else if (response.ok) {
      save.style.display = "";
      const data: { firstName: string, repository: string } = await response.json();
      if (data.firstName) {
        if (data.repository) {
          userName.innerHTML = `<a target="_blank" href="https://github.com/Teaching-HTL-Leonding/${data.repository}">${data.firstName}</a>`;
        } else {
          userName.innerText = data.firstName;
        }
      }
    }
  });

  run.addEventListener("click", runCode);

  save.addEventListener("click", async () => {
    let success = true;
    for (const fileName of files.getFileNames()) {
      const file = files.getFile(fileName);
      if (!file?.isEditable) {
        continue;
      }

      const result = await fetch("/github/exercise/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: ex1.title,
          fileName,
          content: file.model.getValue(),
        }),
      });
      if (!result.ok) {
        success = false; 
        break;
      }
    }
    if (!success) {
      message.querySelector('p')!.innerText = `Error saving files`;
    } else {
      message.querySelector('p')!.innerText = `Files saved successfully`;
    }
    (message.querySelector('#ok')! as HTMLButtonElement).addEventListener("click", () => message.close());
    message.showModal();
  });

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
