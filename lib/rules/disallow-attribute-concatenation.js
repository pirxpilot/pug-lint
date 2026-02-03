// # disallowAttributeConcatenation: `true`
//
// Pug must not contain any attribute concatenation.
//
// ```pug
// //- Invalid
// a(href='text ' + title) Link
// //- Invalid under `'aggressive'`
// a(href=text + title) Link
// a(href=num1 + num2) Link
// ```

const assert = require('node:assert');

module.exports = Rule;

function Rule() {}

Rule.prototype = {
  name: 'disallowAttributeConcatenation',

  schema: {
    enum: [null, true]
  },

  configure(options) {
    assert(
      options === true || options === 'aggressive',
      `${this.name} option requires either a true value or "aggressive". Otherwise it should be removed`
    );
    this._aggressive = options === 'aggressive';
  },

  lint(file, errors) {
    file.iterateTokensByType('attribute', token => {
      file.addErrorForConcatenation(token, errors, 'Attribute concatenation must not be used', this._aggressive);
    });
  }
};
