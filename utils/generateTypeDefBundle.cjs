const fs = require('fs');
const path = require('path');

const inputFolder = process.argv[2];
const outputFileName = process.argv[3] || 'output.ts';

if (!inputFolder) {
  console.error('Please provide a folder name as an argument.');
  process.exit(1);
}

const result = {};

function findFiles(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findFiles(fullPath);
    } else if (file.endsWith('.d.ts')) {
      const relativePath = path.relative(inputFolder, fullPath);
      const content = fs.readFileSync(fullPath, 'utf-8');
      result[relativePath] = content;
    }
  });
}

findFiles(inputFolder);

const outputContent = `const p5TypeDefs: { [key: string]: string } = ${JSON.stringify(result, null, 2)};\n\nexport default p5TypeDefs;\n`;

fs.writeFileSync(outputFileName, outputContent);

console.log(`${outputFileName} has been generated.`);