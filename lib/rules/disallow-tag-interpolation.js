// # disallowTagInterpolation: `true`
//
// Pug must not contain any tag interpolation operators.
//
// ```pug
// //- Invalid
// | #[strong html] text
// p #[strong html] text
// ```

const utils = require('../utils.js');

module.exports = Rule;

function Rule() {}

Rule.prototype = {
  name: 'disallowTagInterpolation',

  schema: {
    enum: [null, true]
  },

  configure(options) {
    utils.validateTrueOptions(this.name, options);
  },

  lint(file, errors) {
    file.addErrorForAllTokensByType('start-pug-interpolation', errors, 'Tag interpolation operators must not be used');
  }
};
