import p5TypeDefs from "./p5-dts";
import * as monaco from "monaco-editor";

import monacoJsonWorker from "monaco-editor/languages/features/json/json.worker?worker";
import monacoCssWorker from "monaco-editor/languages/features/css/css.worker?worker";
import monacoHtmlWorker from "monaco-editor/languages/features/html/html.worker?worker";
import monacoTsWorker from "monaco-editor/languages/features/typescript/ts.worker?worker";
import monacoEditorWorker from "monaco-editor/editor/editor.worker?worker";

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
  console.log(`file:///node_modules/p5/types/${dts}`);
  monaco.typescript.typescriptDefaults.addExtraLib(
    p5TypeDefs[dts],
    `file:///node_modules/p5/types/${dts}`
  );
}

monaco.typescript.javascriptDefaults.setEagerModelSync(true);
monaco.typescript.typescriptDefaults.setEagerModelSync(true);
