module.exports = tasks;

const path = require('node:path');
const glob = require('glob');

function tasks(pliers) {
  glob.sync(path.join(__dirname, '/pliers/*.js')).forEach(file => {
    require(file)(pliers);
  });
}
