import './style.css'
import ts from 'typescript';
import * as monaco from 'monaco-editor';
import p5TypeDefs from './p5-dts';

// @ts-ignore
import monacoJsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
// @ts-ignore
import monacoCssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
// @ts-ignore
import monacoHtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
// @ts-ignore
import monacoTsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
// @ts-ignore
import monacoEditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'

self.MonacoEnvironment = {
  getWorker: function (workerId, label) {
    console.debug(`* lazy imported Monaco Editor worker id '${workerId}', label '${label}'`)
    switch (label) {
      case 'json':
        return new monacoJsonWorker()
      case 'css':
      case 'scss':
      case 'less':
        return new monacoCssWorker()
      case 'html':
      case 'handlebars':
      case 'razor':
        return new monacoHtmlWorker()
      case 'typescript':
      case 'javascript':
        return new monacoTsWorker()
      default:
        return new monacoEditorWorker()
    }
  }
}

const editor = document.getElementById('editor')! as HTMLDivElement;
const run = document.getElementById('run')! as HTMLButtonElement;
const iframe = document.getElementById('resultFrame')! as HTMLIFrameElement;

run.addEventListener('click', runCode);

const uri = monaco.Uri.parse('file:///index.ts');
monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  target: monaco.languages.typescript.ScriptTarget.ESNext,
  allowSyntheticDefaultImports: true,
  moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
});
for (const dts in p5TypeDefs) {
  console.log(`file:///node_modules/@types/p5/${dts}`);
  
  monaco.languages.typescript.typescriptDefaults.addExtraLib(p5TypeDefs[dts], `file:///node_modules/@types/p5/${dts}`);
}
const model = monaco.editor.createModel(`
  /// <reference types="p5/global" />
  // import p5 from 'p5'; 

  // let p: p5;
  // new p5((p5: p5) => {
  //   p = p5;
  //   p.setup = setup;
  // });

function setup() {
  createCanvas(400, 401);
}

function draw() {
  background(220);
}
  `, "typescript", uri);
monaco.editor.create(editor, {
  model,
  language: 'typescript',
  });

function runCode() {
  const files: { [key: string]: string } = {
    'index.ts': editor.innerText,
  };

  let jsCode: string = '';
  const compilerHost = {
    getSourceFile: (fileName: any, languageVersion: any) => {
        console.log(`getSourceFile: ${fileName}`);
        const sourceText = files[fileName];
        return sourceText !== undefined ? ts.createSourceFile(fileName, sourceText, languageVersion) : undefined;
    },
    writeFile: (fileName: any, data: any ) => {
        jsCode = data;
    },
    getDefaultLibFileName: (options: any) => `https://cdnjs.cloudflare.com/ajax/libs/typescript/4.9.5/lib/lib.d.ts`,
    useCaseSensitiveFileNames: () => true,
    getCanonicalFileName: (fileName: any) => fileName,
    getCurrentDirectory: () => '',
    getNewLine: () => '\n',
    fileExists: (fileName: any) => files[fileName] !== undefined,
    readFile: (fileName: any) => files[fileName]
};

const program = ts.createProgram(['index.ts'], { module: ts.ModuleKind.CommonJS, moduleResolution: ts.ModuleResolutionKind.NodeNext }, compilerHost);
program.emit();

  // const jsCode = ts.transpile(editor.innerText);

  const jsBlob = new Blob([jsCode], { type: 'application/javascript' });
  const jsUrl = URL.createObjectURL(jsBlob);

  const blob = new Blob([`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.10.0/p5.min.js"></script>
    </head>
  <body>
    <script src="mycode.js"></script>
  </body>
</html>
`.replace('mycode.js', jsUrl)], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
    iframe.src = url;
}
