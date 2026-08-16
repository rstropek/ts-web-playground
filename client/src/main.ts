import "./style.css";
import * as monaco from "monaco-editor";
import "./editor";
import { fetchExerciseResource, getExerciseUrlFromQueryString, loadExercise, normalizeSampleSolution } from "./exercise";
import { Files } from "./files";
import Split from "split.js";
import { compile } from "./compile";
import purify from "dompurify";
import { renderMarkdownToHtml } from "./markdown";
import { mountAgentView } from "./agent/view";
import { initThemes } from "./theme";
import { getEditorFontSize, mountSettingsDialog, onEditorFontSizeChange } from "./settings";

const editor = document.getElementById("editor")! as HTMLDivElement;
const run = document.getElementById("run")! as HTMLButtonElement;
const save = document.getElementById("save")! as HTMLButtonElement;
const backButton = document.getElementById("back")! as HTMLButtonElement;
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
const agentSelector = document.getElementById(
  "agent-selector"
)! as HTMLDivElement;
const spec = document.getElementById("spec")! as HTMLDivElement;
const title = document.getElementById("title")! as HTMLDivElement;
const message = document.getElementById("message")! as HTMLDialogElement;
const clearButton = document.getElementById("output-clear")! as HTMLButtonElement;
const localSaves = document.getElementById("localSaves")! as HTMLButtonElement;
const appContainer = document.getElementById("app-container")! as HTMLDivElement;
const codeViewButton = document.getElementById(
  "code-view-button"
)! as HTMLButtonElement;
const resultViewButton = document.getElementById(
  "result-view-button"
)! as HTMLButtonElement;
const specViewButton = document.getElementById(
  "spec-view-button"
)! as HTMLButtonElement;
const agentViewButton = document.getElementById(
  "agent-view-button"
)! as HTMLButtonElement;

const debugEnviroment = false;

let monacoEditor: monaco.editor.IStandaloneCodeEditor;

type ActiveView = "code" | "result" | "spec" | "agent";

const narrowScreen = window.matchMedia("(max-width: 767px)");
let activeView: ActiveView = narrowScreen.matches ? "code" : "result";

function requestEditorLayout() {
  requestAnimationFrame(() => {
    monacoEditor?.layout();
  });
}

function setActiveView(view: ActiveView) {
  activeView = view;
  appContainer.dataset.activeView = activeView;

  codeViewButton.setAttribute("aria-pressed", String(view === "code"));
  resultViewButton.setAttribute("aria-pressed", String(view === "result"));
  specViewButton.setAttribute("aria-pressed", String(view === "spec"));
  agentViewButton.setAttribute("aria-pressed", String(view === "agent"));

  // Code is only a separate view on narrow screens. On desktop, the right
  // pane continues to show Result until Spec is selected.
  resultSelector.classList.toggle("selected", view === "result" || view === "code");
  specSelector.classList.toggle("selected", view === "spec");
  agentSelector.classList.toggle("selected", view === "agent");

  if (view === "code") {
    requestEditorLayout();
  }
}

codeViewButton.addEventListener("click", () => setActiveView("code"));
resultViewButton.addEventListener("click", () => setActiveView("result"));
specViewButton.addEventListener("click", () => setActiveView("spec"));
agentViewButton.addEventListener("click", () => setActiveView("agent"));

narrowScreen.addEventListener("change", requestEditorLayout);
setActiveView(activeView);

resultSelector.addEventListener("click", () => {
  setActiveView("result");
});
specSelector.addEventListener("click", () => {
  setActiveView("spec");
});
agentSelector.addEventListener("click", () => {
  setActiveView("agent");
});

// The activity code form is part of the initial markup, but its real submit
// handler is only attached once the exercise has been loaded (mountAgentView).
// Without this guard, submitting earlier would do a native GET and leak the
// activity code into the URL, the browser history, and the server logs.
document.getElementById("agent-code-form")!.addEventListener("submit", (event) => {
  event.preventDefault();
});
backButton.addEventListener("click", () => {
  window.location.href = `/main`;
});
clearButton.addEventListener("click", clearOutput);

// Burger menu: on narrow viewports (< 1280px) the collapsible top-bar controls
// live inside #burger-menu, toggled by the burger button.
const burger = document.getElementById("burger")! as HTMLButtonElement;
const burgerMenu = document.getElementById("burger-menu")! as HTMLDivElement;

function setBurgerMenuOpen(open: boolean) {
  burgerMenu.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", String(open));
}

burger.addEventListener("click", (event) => {
  event.stopPropagation();
  setBurgerMenuOpen(!burgerMenu.classList.contains("open"));
});

// Close after activating a menu button.
burgerMenu.addEventListener("click", (event) => {
  if ((event.target as HTMLElement).closest("button")) {
    setBurgerMenuOpen(false);
  }
});

// Close on outside click and on Escape.
document.addEventListener("click", (event) => {
  const target = event.target as Node;
  if (!burgerMenu.contains(target) && target !== burger) {
    setBurgerMenuOpen(false);
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setBurgerMenuOpen(false);
  }
});

// Settings (theme, editor font size, ...) - independent of the exercise load.
mountSettingsDialog();
initThemes();

localSaves.addEventListener("click", () => {
  const dialog = document.getElementById("saveDialog")! as HTMLDialogElement;
  const localSaveSelect = document.getElementById("localSaveSelect")! as HTMLSelectElement;
  const loadLocalSave = document.getElementById("loadLocalSave")! as HTMLButtonElement;
  const deleteLocalSave = document.getElementById("deleteLocalSave")! as HTMLButtonElement;
  const localSaveName = document.getElementById("localSaveName")! as HTMLInputElement;
  const saveLocalSave = document.getElementById("saveLocalSave")! as HTMLButtonElement;
  const cancelSave = document.getElementById("cancelSave")! as HTMLButtonElement;

  dialog.showModal();

  // Load all local saves
  localSaveSelect.innerHTML = "";
  for (let i = 0; i < localStorage.length; i++) {
    if (localStorage.key(i)?.startsWith("code_")) {
      const key = localStorage.key(i)?.substring(5)!;
      const option = document.createElement("option");
      option.value = key;
      option.text = key;
      localSaveSelect.appendChild(option);
    }
  }

  loadLocalSave.addEventListener("click", () => {
    const key = localSaveSelect.value;
    if (key) {
      loadCode("code_" + key);
    }
  });

  deleteLocalSave.addEventListener("click", () => {
    const key = localSaveSelect.value;
    if (key) {
      localStorage.removeItem("code_" + key);
      localSaveSelect.innerHTML = "";
      for (let i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i)?.startsWith("code_")) {
          const key = localStorage.key(i)?.substring(5)!;
          const option = document.createElement("option");
          option.value = key;
          option.text = key;
          localSaveSelect.appendChild(option);
        }
      }
    }
  });

  saveLocalSave.addEventListener("click", () => {
    const key = localSaveName.value;
    if (key) {
      saveCode("code_" + key);
      localSaveSelect.innerHTML = "";
      for (let i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i)?.startsWith("code_")) {
          const key = localStorage.key(i)?.substring(5)!;
          const option = document.createElement("option");
          option.value = key;
          option.text = key;
          localSaveSelect.appendChild(option);
        }
      }
    }
  });

  cancelSave.addEventListener("click", () => {
    dialog.close();
  });
});

// saveLocalButton.addEventListener("click", () => {
//   const loading: boolean = confirm("Do you want to save or load code from local storage?\nClick 'OK' to save, 'Cancel' to load");
//   if (loading) {
//     if (promptSaveCode()) {
//       message.querySelector('p')!.innerText = `Code saved successfully`;
//       message.showModal();
//     } else {
//       message.querySelector('p')!.innerText = `Error saving code`;
//       message.showModal();
//     }
//   } else {
//     if (promptLoadCode()) {
//       message.querySelector('p')!.innerText = `Code loaded successfully`;
//       message.showModal();
//     } else {
//       message.querySelector('p')!.innerText = `Error loading code`;
//       message.showModal();
//     }
//   }

//   // ok button closes the dialog
//   (message.querySelector('#ok')! as HTMLButtonElement).addEventListener("click", () => message.close());
// });

const exerciseUrl = getExerciseUrlFromQueryString();

if (!exerciseUrl) {
  message.querySelector('p')!.innerText = `Exercise URL missing in query string`;
  (message.querySelector('#ok')! as HTMLButtonElement).style.display = "none";
  (message.querySelector('#openDefault') as HTMLButtonElement).style.display = "initial";
  (message.querySelector('#openDefault') as HTMLButtonElement).addEventListener("click", () => {
    (message.querySelector('#openDefault') as HTMLButtonElement).style.display = "none";
    window.location.href = `${window.location.href}?exerciseUrl=https://raw.githubusercontent.com/rstropek/ts-web-playground/main/exercises/emptyPlayground.yaml`;
  });
  message.showModal();
  throw new Error("No exercise URL found in query string");
}

loadExercise(exerciseUrl).then((ex1) => {
  const sampleSolution = normalizeSampleSolution(ex1.sampleSolution);
  if (Object.keys(sampleSolution).length === 0) {
    loadSolution.style.display = "none";
  }

  loadSolution.addEventListener("click", async () => {
    // ask user with an alert if they want to load the sample solution
    if (!confirm("Are you sure you want to load the sample solution? This will replace all your changes.\n\nTry your very best to solve the exercise yourself before using the sample solution!")) {
      return;
    }

    // Fetch every file of the solution before replacing anything. Otherwise a single
    // broken URL would leave the exercise with a half-loaded solution.
    let solutionContent: [string, string][];
    try {
      solutionContent = await Promise.all(
        Object.entries(sampleSolution).map(async ([fileName, url]) => {
          if (!files.getFile(fileName)) {
            throw new Error(`The sample solution refers to the unknown file ${fileName}.`);
          }

          const response = await fetchExerciseResource(url);
          if (!response.ok) {
            throw new Error(`Could not load the sample solution for ${fileName} (status ${response.status}).`);
          }

          return [fileName, await response.text()] as [string, string];
        })
      );
    } catch (error) {
      showMessage(`Error loading sample solution: ${error instanceof Error ? error.message : error}`);
      return;
    }

    for (const [fileName, content] of solutionContent) {
      files.getFile(fileName)!.replaceContent(content);
    }
  });


  const files = new Files(ex1);
  title.innerText = purify.sanitize(ex1.title);
  spec.innerHTML = renderMarkdownToHtml(ex1.descriptionMd);

  monaco.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.typescript.ScriptTarget.ESNext,
    allowSyntheticDefaultImports: true,
    //moduleResolution: monaco.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.typescript.ModuleKind.ESNext,
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
    showMessage(success ? `Files saved successfully` : `Error saving files`);
  });

  for (const fileName of files.getFileNames()) {
    const option = document.createElement("option");
    option.value = fileName;
    option.text = fileName;
    fileNames.appendChild(option);
  }

  const initialFile = files.getFile("index.ts");
  monacoEditor = monaco.editor.create(editor, {
    model: initialFile!.model,
    language: "typescript",
    fontSize: getEditorFontSize(),
    automaticLayout: true,
    readOnly: !initialFile?.isEditable,
  });
  onEditorFontSizeChange((fontSize) => monacoEditor.updateOptions({ fontSize }));
  mountAgentView(files, monaco, ex1.descriptionMd);

  fileNames.addEventListener("change", function () {
    const fileName = fileNames.value;
    const model = files.getFile(fileName)!.model;
    monacoEditor.setModel(model);
    monacoEditor.updateOptions({
      readOnly: !files.getFile(fileName)!.isEditable,
    });
  });

  // Add custom monaco editor commands
  monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
    if (userName.innerText != `Anonymous`) {
      save.click();
    } else {
      localSaves.click();
    }
  });

  monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR, () => {
    run.click();
  });

  async function runCode() {
    const { blobUrl, errorOutput } = await compile(files);
    compilerError(errorOutput);
    iframe.src = blobUrl;
    setActiveView("result");
  }

  Split(["#editor", "#result-area"], { direction: "horizontal" });
  Split(["#result", "#output"], {
    direction: "vertical",
    minSize: [10, 10],
    sizes: [80, 20],
  });
});

// Redirect console output to the output field 
// and the original console
const originalConsole = console;
console = {
  ...originalConsole,
  clear(): void {
    clearOutput();
    originalConsole.clear();
  },
  info(...data: any[]): void {
    output.innerHTML += `<div class="info">${data.join(" ")}</div>`;
    originalConsole.info(...data);
  },
  debug(...data: any[]): void {
    if (debugEnviroment || data[0] == "debugEnviromentOvveride") {
      data.shift(); // remove the debugEnviromentOvveride
      output.innerHTML += `<div class="debug">${data.join(" ")}</div>`;
    }
    originalConsole.debug(...data);
  },
  log(...data: any[]): void {
    output.innerHTML += `<div class="log">${data.join(" ")}</div>`;
    originalConsole.log(...data);
  },
  warn(...data: any[]): void {
    output.innerHTML += `<div class="warn">${data.join(" ")}</div>`;
    originalConsole.warn(...data);
  },
  error(...data: any[]): void {
    output.innerHTML += `<div class="error">${data.join(" ")}</div>`;
    originalConsole.error(...data);
  }
};

function compilerError(...data: any[]): void {
  output.innerHTML += `<div class="compiler-error">${data.join(" ")}</div>`;
}

function clearOutput() {
  output.innerHTML = "";
}

const messageOk = message.querySelector('#ok')! as HTMLButtonElement;
messageOk.addEventListener("click", () => message.close());

function showMessage(text: string) {
  message.querySelector('p')!.innerText = text;
  message.showModal();
}

// Listen for console messages from the iframe
window.addEventListener('message', (event) => {
  if (event.origin !== window.location.origin) {
    return;
  }
  if (event.data.type?.startsWith("console.") && event.data.data) {
    const type = event.data.type.split(".")[1];
    switch (type) {
      case "info":
        console.info(...event.data.data);
        break;
      case "debug":
        console.debug("debugEnviromentOvveride", ...event.data.data);
        break;
      case "log":
        console.log(...event.data.data);
        break;
      case "warn":
        console.warn(...event.data.data);
        break;
      case "error":
        console.error(...event.data.data);
        break;
    }
  }
});

// Tests
// console.info("Information message");
// console.debug("Debugging message");
// console.debug("debugEnviromentOvveride", "Debugging message with override");
// console.log("Regular log message");
// console.warn("Warning message");
// console.error("Error message");
// compilerError("Compiler error message");
// console.info("Information message from iframe");
// console.debug("Debugging message from iframe");
// console.log("Regular log message from iframe");
// console.warn("Warning message from iframe");
// console.error("Error message from iframe");

// Save current code to local storage
function saveCode(key: string): boolean {
  const code: string = monacoEditor.getValue();

  // Save the code to local storage
  localStorage.setItem(key, code);

  if (localStorage.getItem(key) === code) {
    return true;
  } else {
    return false;
  }
}

// Load code from local storage
function loadCode(key: string): boolean {
  const code: string | null = localStorage.getItem(key);

  if (code && !monacoEditor.getOption(monaco.editor.EditorOption.readOnly)) {
    monacoEditor.setValue(code);
    return true;
  } else {
    return false;
  }
}
