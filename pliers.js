module.exports = tasks;

const path = require('node:path');
const { globSync } = require('node:fs');

function tasks(pliers) {
  globSync(path.join(__dirname, '/pliers/*.js')).forEach(file => {
    require(file)(pliers);
  });
}
