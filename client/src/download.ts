import { strToU8, zipSync } from "fflate";

export type DownloadableFile = {
  fileName: string;
  content: string;
};

export type Download = {
  fileName: string;
  blob: Blob;
};

/**
 * Build the download for the student's code.
 *
 * A single file is downloaded as it is. Multiple files are bundled into a zip
 * archive named after the exercise. Returns _undefined_ if there is nothing to
 * download.
 */
export function buildDownload(files: DownloadableFile[], exerciseTitle: string): Download | undefined {
  if (files.length === 0) {
    return undefined;
  }

  if (files.length === 1) {
    const [file] = files;
    return {
      fileName: file.fileName,
      blob: new Blob([file.content], { type: "text/plain;charset=utf-8" }),
    };
  }

  const archive = zipSync(
    Object.fromEntries(files.map((file) => [file.fileName, strToU8(file.content)]))
  );
  return {
    fileName: `${toSafeFileName(exerciseTitle)}.zip`,
    blob: new Blob([archive], { type: "application/zip" }),
  };
}

/** Turn an exercise title into a name that is valid on Windows, macOS and Linux. */
export function toSafeFileName(title: string): string {
  const safe = title
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\.+$/, "");
  return safe || "exercise";
}

type SaveFilePickerOptions = {
  id?: string;
  suggestedName?: string;
  types?: { description?: string; accept: Record<string, string[]> }[];
};

/** _showSaveFilePicker_ is only available in Chromium-based browsers and not yet part of lib.dom. */
type WindowWithSaveFilePicker = Window & {
  showSaveFilePicker?: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>;
};

/**
 * Let the student choose where to save the download.
 *
 * Uses the browser's "Save as" dialog where available (Chrome, Edge) and
 * falls back to a regular download (Firefox, Safari). Must be called directly
 * from a user interaction (e.g. a click), otherwise the browser refuses to
 * open the dialog.
 */
export async function saveDownload(download: Download): Promise<void> {
  const pickerWindow = window as WindowWithSaveFilePicker;
  if (pickerWindow.showSaveFilePicker) {
    let handle: FileSystemFileHandle | undefined;
    try {
      handle = await pickerWindow.showSaveFilePicker({
        // Lets the browser reopen the dialog in the folder used last time.
        id: "ts-playground-download",
        suggestedName: download.fileName,
        types: fileTypesFor(download),
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return; // The student closed the dialog.
      }
      // Any other problem with the dialog: use a regular download instead.
    }

    if (handle) {
      const writable = await handle.createWritable();
      await writable.write(download.blob);
      await writable.close();
      return;
    }
  }

  saveWithLink(download);
}

function fileTypesFor(download: Download): SaveFilePickerOptions["types"] {
  const extension = download.fileName.match(/\.[a-z0-9]+$/i)?.[0];
  if (!extension) {
    return undefined;
  }

  const isZip = extension.toLowerCase() === ".zip";
  return [{
    description: isZip ? "Zip archive" : `${extension.substring(1).toUpperCase()} file`,
    accept: { [isZip ? "application/zip" : "text/plain"]: [extension] },
  }];
}

function saveWithLink(download: Download): void {
  const url = URL.createObjectURL(download.blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = download.fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoking right away can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
