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
    this.model = monaco.editor.createModel(content, "typescript", this.uri);
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
}
