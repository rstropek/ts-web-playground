// Writes the package version into dist/version.json so a deployment
// can be verified via GET /playground/version.json.
const fs = require("fs");
const path = require("path");

const pkg = require(path.join(__dirname, "..", "package.json"));
const outFile = path.join(__dirname, "..", "dist", "version.json");
fs.writeFileSync(outFile, JSON.stringify({ version: pkg.version }));
console.log(`${outFile} has been generated (version ${pkg.version}).`);
