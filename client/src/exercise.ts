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
    "index.html": {
      content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="http://localhost:8080/libs/p5.js"></script>
    {{topScripts}}
    </head>
  <body>
    {{bodyScripts}}
  </body>
</html>`,
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
