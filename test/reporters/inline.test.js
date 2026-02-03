const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const reporter = require('../../lib/reporters/inline.js');

module.exports = createTest;

function createTest(linter) {
  describe('inline', () => {
    beforeEach(t => {
      t.mock.method(console, 'error', () => {});
    });

    it('should report no errors for valid string', () => {
      reporter(linter.checkString('span Text'));

      assert.equal(console.error.mock.callCount(), 0);
    });

    it('should report errors for valid string', () => {
      reporter(linter.checkString('div: span Text'));

      assert.equal(
        console.error.mock.calls[0].arguments[0].indexOf('Block expansion operators must not be used') > -1,
        true,
        console.error.mock.calls[0].arguments[0]
      );
      assert.equal(console.error.mock.callCount(), 1);
    });

    it('should report multiple errors for valid string', () => {
      reporter(linter.checkString('div: span Text\r\r\r\ndiv: span Text'));

      assert.equal(
        console.error.mock.calls[0].arguments[0].indexOf('Block expansion operators must not be used') > -1,
        true,
        console.error.mock.calls[0].arguments[0]
      );
      assert.equal(console.error.mock.callCount(), 3);
    });
  });
}
