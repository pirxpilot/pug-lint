const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const reporter = require('../../lib/reporters/console.js');

module.exports = createTest;

function createTest(linter) {
  describe('console', () => {
    beforeEach(t => {
      t.mock.method(console, 'error', () => {});
    });

    afterEach(() => {
      console.error.restore();
    });

    it('should report no errors for valid string', () => {
      reporter(linter.checkString('span Text'));

      assert.equal(console.error.called, false);
    });

    it('should report errors for valid string', () => {
      reporter(linter.checkString('div: span Text'));

      assert.equal(
        console.error.getCall(0).args[0].indexOf('Block expansion operators must not be used') > -1,
        true,
        console.error.getCall(0).args[0]
      );
      assert.equal(console.error.called, true);
    });

    it('should report multiple errors for valid string', () => {
      reporter(linter.checkString('div: span Text\r\r\r\ndiv: span Text'));

      assert.equal(
        console.error.getCall(0).args[0].indexOf('Block expansion operators must not be used') > -1,
        true,
        console.error.getCall(0).args[0]
      );
      assert.equal(console.error.called, true);
    });
  });
}
