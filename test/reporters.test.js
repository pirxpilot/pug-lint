const { describe } = require('node:test');
const path = require('node:path');
const glob = require('glob');
const Linter = require('../lib/linter.js');

describe('reporters', () => {
  const linter = new Linter();
  const tests = [];

  linter.configure({
    disallowBlockExpansion: true,
    disallowMultipleLineBreaks: true
  });

  glob.sync(path.join(__dirname, 'reporters/*.test.js')).forEach(file => {
    tests.push(require(file));
  });

  tests.forEach(test => {
    test(linter);
  });
});
