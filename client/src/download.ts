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

/** Let the browser save the download. */
export function saveDownload(download: Download): void {
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
