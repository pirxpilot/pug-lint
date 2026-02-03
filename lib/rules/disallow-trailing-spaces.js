// # disallowTrailingSpaces: `true`
//
// Lines in Pug file must not contain useless spaces at the end.

const utils = require('../utils.js');

module.exports = Rule;

function Rule() {}

Rule.prototype = {
  name: 'disallowTrailingSpaces',

  schema: {
    enum: [null, true]
  },

  configure(options) {
    utils.validateTrueOptions(this.name, options);
  },

  lint(file, errors) {
    file.getLines().forEach((line, index) => {
      let i = line.length - 1;
      while (i >= 0 && /\s/.test(line[i])) {
        i--;
      }

      if (i < line.length - 1) {
        errors.add('Trailing spaces are not allowed', index + 1, i + 2);
      }
    });
  }
};
