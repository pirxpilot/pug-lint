module.exports = parseDocsFromRules;

const fs = require('node:fs');
const path = require('node:path');
const docco = require('docco');

function parseDocsFromRules(pliers) {
  const rulesPattern = path.join(__dirname, '../lib/rules/*.js');
  const docs = [];

  fs.globSync(rulesPattern).forEach(file => {
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
