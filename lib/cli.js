#!/usr/bin/env node
const program = require('commander');
const packageDetails = require('../package.json');
const configFile = require('./config-file.js');
const Linter = require('./linter.js');

function run(args) {
  program
    .version(packageDetails.version)
    .description(packageDetails.description)
    .usage('[options] <file ...>')
    .option('-c, --config <path>', 'configuration file path')
    .option('-r, --reporter <reporter>', 'error reporter; console - default, inline', 'console')
    .parse(args);

  const linter = new Linter();
  let errors = [];

  if (!program.args.length) {
    program.help();
  }

  const config = configFile.load(program.config);
  const reporter = configFile.getReporter(program.reporter);

  if (!reporter.writer) {
    console.error(`Reporter "${program.reporter}" does not exist`);
    process.exit(1);
  }

  linter.configure(config);

  program.args.forEach(arg => {
    errors = errors.concat(linter.checkPath(arg));
  });

  if (errors.length) {
    reporter.writer(errors);
    process.exit(2);
  } else {
    process.exit(0);
  }
}

module.exports = run;
