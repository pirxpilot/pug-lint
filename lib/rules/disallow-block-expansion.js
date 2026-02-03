// # disallowBlockExpansion: `true`
//
// Pug must not contain any block expansion operators.
//
// ```pug
// //- Invalid
// p: strong text
// table: tr: td text
// ```

const utils = require('../utils.js');

module.exports = Rule;

function Rule() {}

Rule.prototype = {
  name: 'disallowBlockExpansion',

  schema: {
    enum: [null, true]
  },

  configure(options) {
    utils.validateTrueOptions(this.name, options);
  },

  lint(file, errors) {
    file.addErrorForAllTokensByType(':', errors, 'Block expansion operators must not be used');
  }
};
