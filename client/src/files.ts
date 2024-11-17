import { Exercise } from "./exercise";
import * as monaco from "monaco-editor";

export class EditorFile {
  public uri: monaco.Uri;
  public language: string;
  public model: monaco.editor.ITextModel;

  constructor(
    public fileName: string,
    public content: string,
    public isEditable = true
  ) {
    this.uri = monaco.Uri.parse(`file:///${fileName}`);
    switch (fileName.split(".").pop()) {
      case "ts":
        this.language = "typescript";
        break;
      case "js":
        this.language = "javascript";
        break;
      case "html":
        this.language = "html";
        break;
      case "css":
        this.language = "css";
        break;
      default:
        this.language = "plaintext";
    }
    this.model = monaco.editor.createModel(content, this.language, this.uri);
  }

  public replaceContent(content: string): void {
    this.model.setValue(content);
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
