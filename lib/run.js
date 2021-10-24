import fs from 'fs';
import chalk from 'chalk';
import path from "path";
import {filesInDirectory} from "./utils.js";
import boxen from "boxen";

export default function run(options) {
  const ext = '.svg';
  const dir = path.resolve(process.cwd(), options.dir);
  const out = path.resolve(process.cwd(), options.out);
  const allFiles = filesInDirectory(dir);
  const svgFiles = allFiles.filter((src) => path.extname(src) === ext);

  if (svgFiles.length) {

    if (!fs.existsSync(out)) {
      fs.mkdirSync(out);
    }

    const svgPath = path.resolve(out, 'icons.svg');
    const typePath = path.resolve(out, 'icons.ts');

    const svgFile = fs.createWriteStream(svgPath, {flags: 'w'});
    const typeFile = fs.createWriteStream(typePath, {flags: 'w'});

    svgFile.on('error', (e) => console.log('svg stream error:', e));
    typeFile.on('error', (e) => console.log('type stream error', e));

    svgFile.write('<svg xmlns="http://www.w3.org/2000/svg">');
    typeFile.write('type Icon = ');

    svgFiles.forEach((file, index) => {
      const relativePath = file.slice(dir.length);
      const id = relativePath.slice(1, -1 * ext.length).replaceAll('/', '-');
      const [content, viewBox] = getSvgContent(file);

      if (content && viewBox) {
        const formatted = content.trimEnd().replaceAll('\n', '\n\t\t');

        svgFile.write(`\n\t<symbol id="${id}" viewBox="${viewBox}">${formatted}\n\t</symbol>`);
        typeFile.write(`${index > 0 ? '|' : ''}\n"${id}"`);

        console.log(`${chalk.green(relativePath)} -> ${id}`);
      } else {
        console.log(chalk.red(relativePath));
      }
    });

    svgFile.end('\n</svg>');
    typeFile.end(';\n\nexport default Icon;\n');

    const finishText = chalk.green(`The files (icons.svg, icons.ts) has been generated at ${options.out}`);

    console.log(boxen(finishText, { padding: 1, borderColor: "green"}));

  }
}

function getViewBox(str) {
  const match = str.match(/viewBox="([0-9\s]+)"/);

  if (match) {
    return match[1];
  }

  return '';
}

function getSvgContent(file) {
  try {
    const data = fs.readFileSync(file, 'utf-8');
    const match = data.match(/<svg([^>]+)>((?:.|\n)*)<\/svg>/);
    let viewBox, content;

    if (match) {
      content = match[2];
      viewBox = getViewBox(match[1]);
    }

    if (content && viewBox) {
      return [content, viewBox];
    }

    throw Error('Failed on ' + file);
  } catch (err) {
    console.log(err);
    return [];
  }
}