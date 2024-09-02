import * as monaco from "monaco-editor";

export type File = {
  content: string;
  isEditable: boolean;
};

export type Exercise = {
  files: { [key: string]: File };
  compilerOptions: monaco.languages.typescript.CompilerOptions;
};

export const exercise1: Exercise = {
  files: {
    "index.ts": {
      content: `function setup() {
  createCanvas(200, 200);
  console.log('Setup is done');
}

function draw() {
  background(getColor());
}
`,
      isEditable: true,
    },
    "color.ts": {
      content: `function getColor() { return 'red'; }`,
      isEditable: false,
    },
  },
  compilerOptions: {
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    allowSyntheticDefaultImports: true,
    //moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.None,
  },
};
