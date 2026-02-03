const { describe } = require('node:test');
const Linter = require('../lib/linter.js');
const { globSync } = require('node:fs');

describe('reporters', () => {
  const linter = new Linter();

  linter.configure({
    disallowBlockExpansion: true,
    disallowMultipleLineBreaks: true
  });

  const tests = globSync('reporters/*.test.js', {
    cwd: __dirname
  }).map(file => require(`./${file}`));

  tests.forEach(test => {
    test(linter);
  });
});
