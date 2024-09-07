import { Exercise } from "./exercise";
import * as monaco from "monaco-editor";

export class EditorFile {
  public uri: monaco.Uri;
  public model: monaco.editor.ITextModel;

  constructor(
    public fileName: string,
    public content: string,
    public isEditable = true
  ) {
    this.uri = monaco.Uri.parse(`file:///${fileName}`);
    let language: string;
    switch (fileName.split(".").pop()) {
      case "ts":
        language = "typescript";
        break;
      case "js":
        language = "javascript";
        break;
      case "html":
        language = "html";
        break;
      case "css":
        language = "css";
        break;
      default:
        language = "plaintext";
    }
    this.model = monaco.editor.createModel(content, language, this.uri);
  }
}

export class Files {
  private fileContent = new Map<string, EditorFile>();

  constructor(exercise: Exercise) {
    for (const fileName in exercise.files) {
      const ef = new EditorFile(
        fileName,
        exercise.files[fileName].content,
        exercise.files[fileName].isEditable
      );
      this.fileContent.set(fileName, ef);
    }
  }

  getFile(fileName: string): EditorFile | undefined {
    return this.fileContent.get(fileName);
  }

  getFileNames(): string[] {
    return Array.from(this.fileContent.keys());
  }

  clear(): void {
    this.fileContent.clear();
  }

  async getHash(): Promise<Uint8Array> {
    // Calculate hash over all file contents
    let concatenatedContent = "";
    for (const file of this.fileContent.values()) {
      concatenatedContent += file.model.getValue();
    }

    return new Uint8Array(await this.calculateHash(concatenatedContent));
  }

  private async calculateHash(str: string): Promise<ArrayBuffer> {
    // Convert string to ArrayBuffer
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
  
    // Calculate hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
    return hashBuffer;
  }
}
