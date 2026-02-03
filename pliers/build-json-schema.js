module.exports = createTask;

const fs = require('node:fs');
const path = require('node:path');
const parseDocsFromRules = require('./parse-docs-from-rules.js');

function createTask(pliers) {
  pliers('buildJsonSchema', done => {
    const fullSchema = require('../schemas/_template-schema.json');
    const props = fullSchema.properties;
    const docs = parseDocsFromRules(pliers);

    docs.forEach(doc => {
      const rule = require(doc.file).prototype;
      const schema = rule.schema || {};
      schema.description = doc.text.match(/\n\n(?:## .*?\n\n)?([\s\S]*?)\n(?:\n|$)/)[1];
      schema.documentation = doc.text;
      props[rule.name] = schema;
    });

    fs.writeFile(
      path.join(__dirname, '../schemas/pug-lintrc-schema.json'),
      JSON.stringify(fullSchema, null, '    '),
      'utf8',
      error => {
        if (error) {
          pliers.logger.error('Failed to build JSON schema');
          return done(error);
        }

        done();
      }
    );
  });
}
