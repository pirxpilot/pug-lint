// # validateExtensions: `true`
//
// Pug template must use proper file extensions with inclusion and inheritance
// (`.pug`).
//
// ```pug
// //- Invalid
// include a
// include a.jade
// extends a
// extends a.txt
// extends a.jade
//
// //- Valid
// include a.txt
// include a.pug
// extends a.pug
// ```

const path = require('node:path');
const utils = require('../utils.js');

module.exports = Rule;

function Rule() {}

Rule.prototype = {
  name: 'validateExtensions',

  schema: {
    enum: [null, true]
  },

  configure(options) {
    utils.validateTrueOptions(this.name, options);
  },

  lint(file, errors) {
    const tokens = file.getTokensByFilter(
      token => token.type === 'include' || token.type === 'extends' || token.type === 'path'
    );

    tokens.forEach((token, i) => {
      const next = tokens[i + 1];

      if (!next || next.type !== 'path') {
        return;
      }

      if (token.type === 'include') {
        if (path.basename(next.val).indexOf('.') === -1) {
          errors.add('Included file path must have a file extension', next.line, next.col);
        } else if (path.extname(next.val) === '.jade') {
          errors.add('Included Pug file must end in .pug', next.line, next.col);
        }
      } /* istanbul ignore else */ else if (token.type === 'extends') {
        if (path.extname(next.val) !== '.pug') {
          errors.add('Extended Pug file must end in .pug', next.line, next.col);
        }
      }
    });
  }
};
