#!/usr/bin/env node

import chalk from 'chalk';
import {getArgs} from '../lib/utils.js';
import run from '../lib/run.js';

const args = getArgs(process.argv.slice(2));
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
