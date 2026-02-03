// # requireLowerCaseAttributes: `true`
//
// All attributes must be written in lower case. Files with `doctype xml` are ignored.
//
// ```pug
// //- Invalid
// div(Class='class')
//
// //- Valid
// div(class='class')
// ```

const utils = require('../utils.js');

module.exports = Rule;

function Rule() {}

Rule.prototype = {
  name: 'requireLowerCaseAttributes',

  schema: {
    enum: [null, true]
  },

  configure(options) {
    utils.validateTrueOptions(this.name, options);
  },

  lint(file, errors) {
    let isXml;

    file.iterateTokensByType('doctype', token => {
      isXml = token.val === 'xml';
    });

    if (!isXml) {
      file.iterateTokensByType('attribute', token => {
        if (token.name !== token.name.toLowerCase()) {
          errors.add('All attributes must be written in lower case', token.line, token.col);
        }
      });
    }
  }
};
