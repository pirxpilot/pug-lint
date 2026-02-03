// # disallowMultipleLineBreaks: `true`
//
// Pug must not contain multiple blank lines in a row.
//
// ```pug
// //- Invalid
// div
//
//
// div
//
// //- Valid
// div
//
// div
// ```

const utils = require('../utils.js');

module.exports = Rule;

function Rule() {}

Rule.prototype = {
  name: 'disallowMultipleLineBreaks',

  schema: {
    enum: [null, true]
  },

  configure(options) {
    utils.validateTrueOptions(this.name, options);
  },

  lint(file, errors) {
    let blankLines = 0;

    file.getLines().forEach((line, index) => {
      if (line.trim().length === 0) {
        blankLines++;

        if (blankLines > 1) {
          errors.add('Must not have multiple blank lines in a row', index + 1);
        }
      } else {
        blankLines = 0;
      }
    });
  }
};
