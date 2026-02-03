const { describe } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const glob = require('glob');
const Linter = require('../lib/linter.js');

describe('rules', () => {
  const linter = new Linter();
  const tests = [];
  const fixturesPath = path.join(__dirname, 'fixtures/rules/');

  glob.sync(path.join(__dirname, 'rules/*.test.js')).forEach(file => {
    tests.push(require(file));
  });

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
