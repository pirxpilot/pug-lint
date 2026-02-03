const { describe } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { globSync } = require('node:fs');
const Linter = require('../lib/linter.js');

describe('rules', () => {
  const linter = new Linter();
  const fixturesPath = path.join(__dirname, 'fixtures/rules/');

  const tests = globSync('rules/*.test.js', {
    cwd: __dirname
  }).map(file => require(`./${file}`));

  tests.forEach(test => {
    test(linter, fixturesPath, testSingle);
  });

  function testSingle(source, line, column) {
    const results = linter.checkString(source);
    assert.equal(results.length, line ? 1 : 0);
    if (line) {
      assert.equal(results[0].line, line);
      assert.equal(results[0].column, column);
    }
  }
});
