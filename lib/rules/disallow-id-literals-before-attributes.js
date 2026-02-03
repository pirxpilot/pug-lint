// # disallowIdLiteralsBeforeAttributes: `true`
//
// All attribute blocks must be written before any ID literals.
//
// ```pug
// //- Invalid
// input#id(type='text')
//
// //- Valid
// input(type='text')#id
// ```

const utils = require('../utils.js');

module.exports = Rule;

function Rule() {}

Rule.prototype = {
  name: 'disallowIdLiteralsBeforeAttributes',

  schema: {
    enum: [null, true]
  },

  contradictions: ['requireIdLiteralsBeforeAttributes'],

  configure(options) {
    utils.validateTrueOptions(this.name, options);
  },

  lint(file, errors) {
    file.addErrorForIncorrectTokenTypeOrder(
      'start-attributes',
      'id',
      utils.htmlTagBoundaryTypes,
      errors,
      'All ID literals must be written after any attribute blocks'
    );
  }
};
