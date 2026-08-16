// User preferences, persisted in local storage and edited in the settings dialog.
// Adding another setting means: a getter/setter pair here, a row in the dialog
// markup, and (if it has to reach the editor) a listener like the font size one.

const KEY_THEME = "theme"; // unchanged - students already have this key
const KEY_FONT_SIZE = "editorFontSize";

export const DEFAULT_THEME = "github";
export const DEFAULT_FONT_SIZE = 17;
export const MIN_FONT_SIZE = 8;
export const MAX_FONT_SIZE = 40;

export function getThemeId(): string {
  return localStorage.getItem(KEY_THEME) ?? DEFAULT_THEME;
}

export function setThemeId(id: string) {
  localStorage.setItem(KEY_THEME, id);
}

export function clampFontSize(size: number): number {
  return Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, Math.round(size)));
}

export function getEditorFontSize(): number {
  const stored = Number(localStorage.getItem(KEY_FONT_SIZE));
  return Number.isFinite(stored) && stored > 0 ? clampFontSize(stored) : DEFAULT_FONT_SIZE;
}

const fontSizeListeners: ((size: number) => void)[] = [];

export function setEditorFontSize(size: number) {
  const clamped = clampFontSize(size);
  localStorage.setItem(KEY_FONT_SIZE, String(clamped));
  for (const listener of fontSizeListeners) {
    listener(clamped);
  }
}

// The Monaco editor is only created once the exercise has loaded, so settings
// cannot reach it directly. Listeners registered here are called on every change;
// changes made before the editor exists are simply persisted and picked up when
// it is created.
export function onEditorFontSizeChange(listener: (size: number) => void) {
  fontSizeListeners.push(listener);
}

export function mountSettingsDialog() {
  const settingsButton = document.getElementById("settings")! as HTMLButtonElement;
  const dialog = document.getElementById("settingsDialog")! as HTMLDialogElement;
  const fontSize = document.getElementById("editorFontSize")! as HTMLInputElement;

  fontSize.value = String(getEditorFontSize());

  settingsButton.addEventListener("click", () => dialog.showModal());

  // Live apply while typing, but ignore an empty or half-typed value so the
  // field can be cleared without the editor jumping to the minimum size.
  fontSize.addEventListener("input", () => {
    const value = Number(fontSize.value);
    if (fontSize.value === "" || !Number.isFinite(value) || value <= 0) {
      return;
    }
    setEditorFontSize(value);
  });

  // Once the field loses focus, show the value that was actually applied.
  fontSize.addEventListener("change", () => {
    fontSize.value = String(getEditorFontSize());
  });
}
