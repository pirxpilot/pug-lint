// # requireLineFeedAtFileEnd: `true`
//
// All files must end with a line feed.

const utils = require('../utils.js');

module.exports = Rule;

function Rule() {}

Rule.prototype = {
  name: 'requireLineFeedAtFileEnd',

  schema: {
    enum: [null, true]
  },

  configure(options) {
    utils.validateTrueOptions(this.name, options);
  },

  lint(file, errors) {
    const src = file.getSource();
    const lineBreaks = ['\r', '\n', '\r\n'];
    let hasFinalLineFeed;

    lineBreaks.forEach(lineBreak => {
      const match = src.match(`${lineBreak}$`);
      if (match !== null && !hasFinalLineFeed) {
        hasFinalLineFeed = match[0] === lineBreak;
      }
    });

    if (!hasFinalLineFeed) {
      errors.add('Missing line feed at file end', file.getLines().length);
    }
  }
};
