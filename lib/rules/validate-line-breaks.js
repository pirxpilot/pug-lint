// # validateLineBreaks: `"CR"` | `"LF"` | `"CRLF"`
//
// ## e.g.: `"LF"`
//
// All line break characters must match.
//
// ```pug
// //- Invalid
// div(class='class')<CRLF>
// .button
//
// //- Valid
// div(class='class')<LF>
// .button
// ```

const assert = require('node:assert');

module.exports = Rule;

function Rule() {}

Rule.prototype = {
  name: 'validateLineBreaks',

  schema: {
    enum: [null, 'CR', 'LF', 'CRLF']
  },

  configure(options) {
    assert(
      options === 'CR' || options === 'LF' || options === 'CRLF',
      `${this.name} option requires "CR", "LF", or "CRLF"`
    );

    const lineBreaks = {
      CR: '\r',
      LF: '\n',
      CRLF: '\r\n'
    };

    this._lineBreak = lineBreaks[options];
  },

  lint(file, errors) {
    const lines = file.getLines();

    if (lines.length < 2) {
      return;
    }

    file.getLineBreaks().some(function (lineBreak, i) {
      if (lineBreak !== this._lineBreak) {
        errors.add('Invalid line break', i + 1, lines[i].length);
      }
      return lineBreak;
    }, this);
  }
};
