import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const imagesDir = path.join(root, "assets", "images");

const iconSvgPath = path.join(imagesDir, "icon-source.svg");
const adaptiveSvgPath = path.join(imagesDir, "adaptive-foreground-source.svg");

const iconPngPath = path.join(imagesDir, "icon.png");
const adaptivePngPath = path.join(imagesDir, "adaptive-icon-foreground.png");

if (!fs.existsSync(iconSvgPath)) {
  throw new Error(`Missing ${iconSvgPath}`);
}
if (!fs.existsSync(adaptiveSvgPath)) {
  throw new Error(`Missing ${adaptiveSvgPath}`);
}

const renderPng = async (inputPath, outputPath, size) => {
  const svg = fs.readFileSync(inputPath);
  await sharp(svg, { density: 300 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
};

await renderPng(iconSvgPath, iconPngPath, 1024);
await renderPng(adaptiveSvgPath, adaptivePngPath, 1024);

console.log("Generated:");
console.log(`- ${path.relative(root, iconPngPath)}`);
console.log(`- ${path.relative(root, adaptivePngPath)}`);
