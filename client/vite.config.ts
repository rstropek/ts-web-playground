const prefix = `monaco-editor/esm/vs`

const optimizeDeps = {
    base: '/playground',
    include: [
      `${prefix}/language/json/json.worker`,
      `${prefix}/language/css/css.worker`,
      `${prefix}/language/html/html.worker`,
      `${prefix}/language/typescript/ts.worker`,
      `${prefix}/editor/editor.worker`
    ]
  }

  export default optimizeDeps;