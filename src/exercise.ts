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
      content: `/// <reference types="p5/global.d.ts" />
import { getColor } from "./color.js";

function setup() {
  createCanvas(400, 401);
}

function draw() {
  background(getColor());
}`,
      isEditable: true,
    },
    "color.ts": {
      content: `export function getColor() { return 220; }`,
      isEditable: false,
    },
  },
  compilerOptions: {
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    allowSyntheticDefaultImports: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
  },
};
