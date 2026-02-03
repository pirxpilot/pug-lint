module.exports = parseDocsFromRules;

const fs = require('node:fs');
const path = require('node:path');
const docco = require('docco');
const glob = require('glob');

function parseDocsFromRules(pliers) {
  const rulesPattern = path.join(__dirname, '../lib/rules/*.js');
  const docs = [];

  glob.sync(rulesPattern).forEach(file => {
    const source = fs.readFileSync(file, 'utf8');
    let hasDocs;

    docco.parse(file, source).map(section => {
      if (!hasDocs && section.docsText) {
        docs.push({
          file,
          text: section.docsText
        });
        hasDocs = true;
      }

      return true;
    });

    if (!hasDocs) {
      pliers.logger.error('Missing docs for rule:');
      throw file;
    }
  });

  return docs;
}
