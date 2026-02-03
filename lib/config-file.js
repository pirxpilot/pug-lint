const fs = require('node:fs');
const path = require('node:path');
const { default: stripJSONComments } = require('strip-json-comments');

const configs = [
  '.pug-lintrc',
  '.pug-lintrc.js',
  '.pug-lintrc.json',
  '.pug-lint.json',
  '.jade-lintrc',
  '.jade-lint.json',
  'package.json'
];

exports.getContent = function (config, directory) {
  if (!config) {
    return;
  }

  const configPath = path.resolve(directory, config);
  const content = this.loadFromFile(configPath);

  config = path.basename(config);

  return content && config === 'package.json' ? content.pugLintConfig || content.jadeLintConfig : content;
};

exports.getReporter = reporter => {
  let writerPath;
  let writer;

  if (reporter) {
    reporter = reporter.toString();
    writerPath = path.resolve(process.cwd(), reporter);

    if (!fs.existsSync(writerPath)) {
      writerPath = path.resolve(__dirname, `./reporters/${reporter}`);
    }
  }

  try {
    writer = require(writerPath);
  } catch {
    writer = null;
  }

  if (!writer) {
    try {
      writer = require(reporter);
    } catch {}
  }

  return { path: writerPath, writer };
};

exports.load = function (config, cwd) {
  let content;
  const directory = cwd || process.cwd();

  if (config) {
    return this.getContent(config, directory);
  }

  content = this.getContent(
    findup(
      configs,
      { nocase: true, cwd: directory },
      function (configPath) {
        if (path.basename(configPath) === 'package.json') {
          return Boolean(this.getContent(configPath));
        }

        return true;
      }.bind(this)
    )
  );

  if (content) {
    return content;
  }

  return this.loadFromHomeDirectory();
};

exports.loadFromFile = configPath => {
  let content;
  let ext;

  if (fs.existsSync(configPath)) {
    ext = path.extname(configPath);

    if (ext === '.js') {
      content = require(configPath);
    } else {
      content = JSON.parse(stripJSONComments(fs.readFileSync(configPath, 'utf8')));
    }

    content.configPath = configPath;
  }

  return content;
};

exports.loadFromHomeDirectory = function () {
  let content;
  const directoryArr = [process.env.USERPROFILE, process.env.HOMEPATH, process.env.HOME];
  let i;
  let dirLen;
  let j;
  let len;

  for (i = 0, dirLen = directoryArr.length; i < dirLen; i++) {
    /* istanbul ignore if */
    if (!directoryArr[i]) {
      continue;
    }

    for (j = 0, len = configs.length; j < len; j++) {
      content = this.getContent(configs[j], directoryArr[i]);

      /* istanbul ignore if */
      if (content) {
        return content;
      }
    }
  }
};

function findup(patterns, options, fn) {
  let lastpath;
  let file;

  options = Object.create(options);
  options.cwd = path.resolve(options.cwd);

  do {
    file = patterns.filter(filterPatterns)[0];

    if (file) {
      return path.join(options.cwd, file);
    }

    lastpath = options.cwd;
    options.cwd = path.resolve(options.cwd, '..');
  } while (options.cwd !== lastpath);

  function filterPatterns(pattern) {
    const configPath = fs.globSync(pattern, options)[0];

    if (configPath) {
      return fn(path.join(options.cwd, configPath));
    }
  }
}
