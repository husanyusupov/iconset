import fs from "fs";
import path from "path";
import chalk from "chalk";

const longArgs = arg => {
  arg = arg.slice(2);

  if (!arg) {
    return {};
  }

  const index = arg.indexOf('=');

  if (index > -1) {
    return { [arg.slice(0, index)] : arg.slice(index + 1) || true}
  }

  return { [arg]: true }
};

const flags = arg => [...arg.slice(1)].reduce((acc, f) => ({ ...acc, [f]: true }), {});

export const getArgs = (args) =>
    args.reduce((acc, arg) => ({
      ...acc,
      ...((arg.startsWith('--') && longArgs(arg)) || (arg[0] === '-' && flags(arg)))
    }), {});

export function filesInDirectory (dir, recursive = true, acc = []) {
  try {
    const files = fs.readdirSync(dir);
    for (const i in files) {
      const name = [dir, files[i]].join(path.sep);
      if (fs.statSync(name).isDirectory()) {
        if (recursive) {
          filesInDirectory(name, recursive, acc);
        }
      } else {
        acc.push(name);
      }
    }
    return acc
  } catch (e) {
    console.log(chalk.red(e));
    return acc
  }
}

export function getAttr(str, name) {
  const reg = new RegExp(`${name}="[^"]+"`);
  const match = str.match(reg);

  if (match) {
    return match[0];
  }

  return '';
}

export function useCurrentColor(str) {
  return str.replace(/(stroke|fill)="([^"]+)"/g, (attr, name, value) => {
    if (value === 'none' || value === 'transparent' || value.startsWith('url') || value.startsWith('context')) {
      return attr;
    }
    return `${name}="currentColor"`;
  })
}
