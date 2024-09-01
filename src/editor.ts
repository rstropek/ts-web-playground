import p5TypeDefs from "./p5-dts";
import * as monaco from "monaco-editor";

// @ts-ignore
import monacoJsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
// @ts-ignore
import monacoCssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
// @ts-ignore
import monacoHtmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
// @ts-ignore
import monacoTsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
// @ts-ignore
import monacoEditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";

self.MonacoEnvironment = {
  getWorker: function (workerId, label) {
    console.debug(
      `* lazy imported Monaco Editor worker id '${workerId}', label '${label}'`
    );
    switch (label) {
      case "json":
        return new monacoJsonWorker();
      case "css":
      case "scss":
      case "less":
        return new monacoCssWorker();
      case "html":
      case "handlebars":
      case "razor":
        return new monacoHtmlWorker();
      case "typescript":
      case "javascript":
        return new monacoTsWorker();
      default:
        return new monacoEditorWorker();
    }
  },
};

for (const dts in p5TypeDefs) {
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    p5TypeDefs[dts],
    `file:///node_modules/@types/p5/${dts}`
  );
}

monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
