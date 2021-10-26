const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const utils = require('../lib/utils.js');

function run(options) {
  const ext = '.svg';
  const dir = path.resolve(process.cwd(), options.dir);
  const out = path.resolve(process.cwd(), options.out);
  const allFiles = utils.filesInDirectory(dir);
  const svgFiles = allFiles.filter((src) => path.extname(src) === ext);

  if (svgFiles.length) {

    if (!fs.existsSync(out)) {
      fs.mkdirSync(out);
    }

    const svgPath = path.resolve(out, 'icons.svg');
    const typePath = path.resolve(out, 'types.ts');

    const svgFile = fs.createWriteStream(svgPath, {flags: 'w'});
    const typeFile = fs.createWriteStream(typePath, {flags: 'w'});

    svgFile.on('error', (e) => console.log('svg stream error:', e));
    typeFile.on('error', (e) => console.log('type stream error', e));

    svgFile.write('<svg xmlns="http://www.w3.org/2000/svg">');
    typeFile.write('type TIcon =');

    svgFiles.forEach((file) => {
      const relativePath = file.slice(dir.length);
      const id = relativePath.slice(1, -1 * ext.length).replace(/[\/\s]/g, '-');
      const [content, viewBox, fill] = getSvgContent(file);

      if (!/^[a-z][a-z0-9-_]*$/.test(id)) {
        console.log(chalk.red(relativePath + ' -> Wrong id: ' + id));
        return;
      }

      if (content) {
        const formatted = '\n\t\t' + content.replace(/\n/g, '\n\t\t');

        svgFile.write(`\n\t<symbol id="${id}" ${viewBox} ${fill}>${formatted}\n\t</symbol>`);
        typeFile.write(`\n  | '${id}'`);

        console.log(`${chalk.green(relativePath)} -> ${id}`);
      } else {
        console.log(chalk.red(relativePath));
      }
    });

    svgFile.end('\n</svg>');
    typeFile.end(';\n\nexport default TIcon;\n');

    const finishText = chalk.green(`The files (icons.svg, types.ts) has been generated at ${options.out}`);
    const border = chalk.green('-'.repeat(finishText.length));

    console.log('');
    console.log(border);
    console.log(finishText);
    console.log(border);

  }
}

function getSvgContent(file) {
  try {
    const data = fs.readFileSync(file, 'utf-8');
    const match = data.match(/<svg([^>]*)>((?:.|\n)*)<\/svg>/);
    let content, viewBox, fill;

    if (match) {
      content = utils.useCurrentColor(match[2].trim());
      viewBox = utils.getAttr(match[1], 'viewBox');
      fill = utils.getAttr(match[1], 'fill');
    }

    return [content, viewBox, fill];
  } catch (err) {
    console.log(err);
    return [];
  }
}

module.exports = run;
