export type File = {
  content: string;
  isEditable: boolean;
};

export type Exercise = {
  title: string;
  descriptionMd: string;
  files: { [key: string]: File };
};

export const exercise1: Exercise = {
  title: "Exercise 1",
  descriptionMd: `# Exercise 1

In this exercise, you will create a simple **p5js** sketch that displays a red background.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
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
};
