// # disallowIdLiterals: `true`
//
// Pug must not contain any ID literals.
//
// ```pug
// //- Invalid
// #id
//
// //- Valid
// div(id='id')
// ```

const utils = require('../utils.js');

module.exports = Rule;

function Rule() {}

Rule.prototype = {
  name: 'disallowIdLiterals',

  schema: {
    enum: [null, true]
  },

  configure(options) {
    utils.validateTrueOptions(this.name, options);
  },

  lint(file, errors) {
    file.addErrorForAllTokensByType('id', errors, 'ID literals must not be used');
  }
};
