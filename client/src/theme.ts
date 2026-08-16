import * as monaco from "monaco-editor";
import { getThemeId, setThemeId } from "./settings";

// The Monaco color themes offered in the settings dialog. The matching JSON
// files are served from client/public/themes/<friendlyName>.json.
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
    id: theme.toLowerCase().replaceAll(/[^0-9a-z-]/g, "-"),
    friendlyName: theme,
    themeData: {}
  };
});

async function loadTheme(theme: Theme) {
  theme.themeData = await fetch(`/playground/themes/${theme.friendlyName}.json`).then(m => m.json());
  monaco.editor.defineTheme(theme.id, theme.themeData as monaco.editor.IStandaloneThemeData);
}

// The panels around the editor (spec, console, agent) follow the editor colors
// via these custom properties; style.css mixes the surfaces it needs from them.
function applyThemeColors(themeData: monaco.editor.IStandaloneThemeData) {
  const colors = themeData.colors ?? {};
  const root = document.documentElement;
  const set = (name: string, value: string | undefined) => {
    if (value) {
      root.style.setProperty(name, value);
    }
  };

  set("--editor-bg-color", colors["editor.background"]);
  set("--editor-fg-color", colors["editor.foreground"]);
  set("--editor-selection-bg-color", colors["editor.selectionBackground"]);
}

export function initThemes() {
  // Start loading themes in the background
  (async () => {
    for (const theme of themes) {
      try {
        await loadTheme(theme);
      } catch (e) {
        console.error(e);
      }
    }
  })();

  const themeSelect = document.getElementById("theme") as HTMLSelectElement;
  for (const theme of themes) {
    const option = document.createElement("option");
    option.value = theme.id;
    option.textContent = theme.friendlyName;
    themeSelect.appendChild(option);
  }

  themeSelect.addEventListener("change", async function () {
    const themeName = themeSelect.value;
    let themeData = themes.find(t => t.id === themeName)!.themeData as monaco.editor.IStandaloneThemeData;

    if (Object.keys(themeData).length === 0) {
      await loadTheme(themes.find(t => t.id === themeName)!);
      themeData = themes.find(t => t.id === themeName)!.themeData as monaco.editor.IStandaloneThemeData;
    }

    monaco.editor.setTheme(themeName);

    setThemeId(themeName);
    applyThemeColors(themeData);

    // The result iframe is a document of its own, so the custom properties do
    // not reach it.
    const iframe = document.getElementById("result-frame")! as HTMLIFrameElement;
    iframe.contentDocument!.body.style.backgroundColor = themeData.colors["editor.background"];
  });

  themeSelect.value = getThemeId();
  themeSelect.dispatchEvent(new Event("change"));
}
