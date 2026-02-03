// # disallowClassLiterals: `true`
//
// Pug must not contain any class literals.
//
// ```pug
// //- Invalid
// .class
//
// //- Valid
// div(class='class')
// ```

const utils = require('../utils.js');

module.exports = Rule;

function Rule() {}

Rule.prototype = {
  name: 'disallowClassLiterals',

  schema: {
    enum: [null, true]
  },

  configure(options) {
    utils.validateTrueOptions(this.name, options);
  },

  lint(file, errors) {
    file.addErrorForAllTokensByType('class', errors, 'Class literals must not be used');
  }
};
