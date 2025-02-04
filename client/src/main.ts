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
const spec = document.getElementById("spec")! as HTMLDivElement;
const title = document.getElementById("title")! as HTMLDivElement;
const message = document.getElementById("message")! as HTMLDialogElement;
const clearButton = document.getElementById("output-clear")! as HTMLButtonElement;
const localSaves = document.getElementById("localSaves")! as HTMLButtonElement;

const debugEnviroment = false;

let monacoEditor: monaco.editor.IStandaloneCodeEditor;

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
backButton.addEventListener("click", () => {
  window.location.href = `/main`;
});
clearButton.addEventListener("click", clearOutput);

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
  monacoEditor = monaco.editor.create(editor, {
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


// Themes
const themeNames: string[] = [
  "Active4D",
  "All Hallows Eve",
  "Amy",
  "Birds of Paradise",
  "Blackboard",
  "Brilliance Black",
  "Brilliance Dull",
  "Chrome DevTools",
  "Clouds",
  "Clouds Midnight",
  "Cobalt2",
  "Cobalt",
  "Dawn",
  "Dominion Day",
  "Dracula",
  "Dreamweaver",
  "Eiffel",
  "Espresso Libre",
  "GitHub Dark",
  "GitHub",
  "GitHub Light",
  "idleFingers",
  "IDLE",
  "iPlastic",
  "Katzenmilch",
  "krTheme",
  "Kuroir Theme",
  "LAZY",
  "MagicWB (Amiga)",
  "Merbivore",
  "Merbivore Soft",
  "monoindustrial",
  "Monokai Bright",
  "Monokai",
  "Night Owl",
  "Nord",
  "Oceanic Next",
  "Pastels on Dark",
  "Slush and Poppies",
  "Solarized-dark",
  "Solarized-light",
  "SpaceCadet",
  "Sunburst",
  "Textmate (Mac Classic)",
  "Tomorrow",
  "Tomorrow-Night-Blue",
  "Tomorrow-Night-Bright",
  "Tomorrow-Night-Eighties",
  "Tomorrow-Night",
  "Twilight",
  "Upstream Sunburst",
  "Vibrant Ink",
  "Xcode_default",
  "Zenburnesque"
];

type Theme = {
  id: string;
  friendlyName: string;
  themeData: monaco.editor.IStandaloneThemeData | {};
}

const themes: Theme[] = themeNames.map((theme) => {
  return {
    id: theme.toLowerCase().replaceAll(" ", "-"),
    friendlyName: theme,
    themeData: {}
  };
});

// Start loading themes in the background
(async () => {
  for (const theme of themes) {
    try {
      theme.themeData = await fetch(`/playground/themes/${theme.friendlyName}.json`).then(m => m.json());
    } catch (e) {
      console.error(e);
    }
  }
})();

const themeSelect = document.getElementById("theme") as HTMLSelectElement;
for (const theme of themeNames) {
  const option = document.createElement("option");
  option.value = theme.toLowerCase().replaceAll(" ", "-");
  option.textContent = theme;
  themeSelect.appendChild(option);
}

themeSelect.addEventListener("change", async function () {
  const themeName = themeSelect.value;
  const themeData = themes.find(t => t.id === themeName)!.themeData as monaco.editor.IStandaloneThemeData;
  monaco.editor.defineTheme('monokai', themeData);
  monaco.editor.setTheme('monokai');

  localStorage.setItem("theme", themeName);
  // change the theme of the output iframe
  const iframe = document.getElementById("result-frame")! as HTMLIFrameElement;
  const iframeDocument = iframe.contentDocument!;
  // Set the theme (get background color of the monaco editor)
  const backgroundColor = themeData.colors["editor.background"];
  iframeDocument.body.style.backgroundColor = backgroundColor;
  const outputWindow = document.getElementById("output")!;
  outputWindow.style.backgroundColor = backgroundColor;
  const resultContainer = document.getElementById("result")!;
  resultContainer.style.backgroundColor = backgroundColor;
  // Set the text color for the output
  const textColor = themeData.colors["editor.foreground"];
  //  add style rule "#output-content .log { color: #${textColor}; }"
  const style = document.createElement("style");
  style.textContent =
    `
    #output-content .log,
    #spec {
      color: ${textColor};
    }`;
  document.head.appendChild(style);
});

const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  themeSelect.value = savedTheme;
  themeSelect.dispatchEvent(new Event("change"));
} else {
  themeSelect.value = "github";
  themeSelect.dispatchEvent(new Event("change"));
}

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

  if (code && monacoEditor.getOption(monaco.editor.EditorOption.readOnly)) {
    monacoEditor.setValue(code);
    return true;
  } else {
    return false;
  }
}
