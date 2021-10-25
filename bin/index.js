#!/usr/bin/env node

const chalk = require('chalk');
const utils = require('../lib/utils.js');
const run = require('../lib/run.js');

const args = utils.getArgs(process.argv.slice(2));
const calledEmpty = Object.keys(args).length === 0;
const wrongArguments = !args.dir || args.dir === true || !args.out || args.out === true;

if (calledEmpty || wrongArguments || args.help) {
  showHelp();
  process.exit();
}

const options = {
  dir: args.dir || './icons',
  out: args.out || './icons-result',
};

run(options);

function showHelp() {
  console.log(`
    ${chalk.bold("Usage: iconset --dir='svg files directory' --out='destination directory'")}
    
    --dir   Svg files directory
    --out   Destination directory
    --help  Show help
  `);
}
