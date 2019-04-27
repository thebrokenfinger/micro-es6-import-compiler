const cliHighlight = require('cli-highlight');
const chalk = require('chalk');
const compile = require('./compiler').compiler;

function print(code) {
  console.log(cliHighlight.highlight(code, { language: 'js' }));
}

// write your es6 import statements (to be compiled) below
const es6 = `import 
                        mod from 
  "./local-module"
  import chalk from "chalk"`;
console.log(chalk.black.bgWhite.bold('es6 input:\n'));
print(es6);
console.log('\n\n');

// compile es6 -> js
const js = compile(es6);
console.log(chalk.black.bgWhite.bold('js output:\n'));
print(js);
