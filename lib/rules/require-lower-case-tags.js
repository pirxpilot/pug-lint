// # requireLowerCaseTags: `true`
//
// All tags must be written in lower case. Files with `doctype xml` are ignored.
//
// ```pug
// //- Invalid
// Div(class='class')
//
// //- Valid
// div(class='class')
// ```

const utils = require('../utils.js');

module.exports = Rule;

function Rule() {}

Rule.prototype = {
  name: 'requireLowerCaseTags',

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
      file.addErrorForAllTokensByFilter(
        token => token.type === 'tag' && token.val !== token.val.toLowerCase(),
        errors,
        'All tags must be written in lower case'
      );
    }
  }
};
