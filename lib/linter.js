const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const glob = require('glob');
const isAbsolutePath = require('path-is-absolute');
const minimatch = require('minimatch');
const resolve = require('resolve');
const ConfigFile = require('./config-file.js');
const Errors = require('./errors.js');
const File = require('./pug-file.js');
const utils = require('./utils.js');

const Linter = function () {
  this._basePath = '.';
  this._excludedFileMasks = ['node_modules/**'];
  this._excludedFileMatchers = [];
  this._fileExtensions = ['.pug', '.jade'];
};

Linter.prototype = {
  checkDirectory(directoryPath) {
    let errors = [];

    if (this._isFileExcluded(directoryPath)) {
      return [];
    }

    fs.readdirSync(directoryPath).forEach(function (file) {
      const filePath = `${directoryPath}/${file}`;
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        errors = errors.concat(this.checkDirectory(filePath));
      } else if (this._fileExtensions.indexOf(path.extname(filePath)) !== -1) {
        errors = errors.concat(this.checkFile(filePath));
      }
    }, this);

    return errors;
  },

  checkFile(filePath) {
    /* istanbul ignore if */
    if (this._isFileExcluded(filePath)) {
      return [];
    }

    return this.checkString(fs.readFileSync(filePath, 'utf8'), filePath);
  },

  checkPath(filePath) {
    filePath = filePath.replace(/\/$/, '');

    if (!fs.existsSync(filePath)) {
      throw new Error(`Path ${filePath} was not found`);
    }

    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      return this.checkDirectory(filePath);
    }

    return this.checkFile(filePath);
  },

  checkString(source, filename) {
    filename = filename || 'input';

    const file = this._createFile(filename, source);

    return this._checkFile(file);
  },

  configure(options) {
    this._configuredRules = [];
    this._ruleMasks = [path.join(__dirname, 'rules/*.js')];

    if (options) {
      this._extendConfiguration(options);

      if (Object.hasOwn(options, 'preset')) {
        throw new Error('Presets have been deprecated. See: https://github.com/pugjs/pug-lint#preset-deprecated');
      }

      if (Object.hasOwn(options, 'excludeFiles')) {
        assert(Array.isArray(options.excludeFiles), '"excludeFiles" option requires array value');

        this._excludedFileMasks = options.excludeFiles;
      }

      if (Object.hasOwn(options, 'additionalRules')) {
        assert(Array.isArray(options.additionalRules), '"additionalRules" option requires array value');

        this._ruleMasks = this._ruleMasks.concat(options.additionalRules);
      }

      this._loadExcludedFiles();

      this._ruleMasks.forEach(function (mask) {
        glob.sync(mask).forEach(function (file) {
          const Rule = require(path.resolve(file));
          const rule = new Rule();
          const name = rule.name;

          if (Object.hasOwn(options, name) && options[name] !== null) {
            if (rule.contradictions) {
              rule.contradictions.forEach(contradiction => {
                if (Object.hasOwn(options, contradiction) && options[contradiction] !== null) {
                  options[contradiction] = null;
                }
              });
            }

            rule.configure(options[name]);

            this._configuredRules.push(rule);
          }
        }, this);
      }, this);
    }
  },

  getConfiguredRules() {
    return this._configuredRules;
  },

  _checkFile(file) {
    const errors = new Errors(file);

    file.getParseErrors().forEach(parseError => {
      errors.addParseError(parseError);
    });

    const firstToken = file.getFirstToken();

    if (!firstToken || (firstToken && firstToken.type === 'eos')) {
      return errors.getErrors();
    }

    this.getConfiguredRules().forEach(rule => {
      errors.setCurrentRule(rule.name);

      rule.lint(file, errors);
    });

    return errors.getErrors();
  },

  _createFile: (filename, source) => new File(filename, source),

  _extendConfiguration(options) {
    if (Object.hasOwn(options, 'extends')) {
      const configPath = this._resolveExtendsFile(options.extends);
      const configOptions = ConfigFile.loadFromFile(configPath);

      Object.keys(configOptions).forEach(key => {
        if (!Object.hasOwn(options, key)) {
          options[key] = configOptions[key];
        }
      });
    }

    return options;
  },

  _isFileExcluded(filePath) {
    filePath = path.resolve(filePath);

    return this._excludedFileMatchers.some(matcher => matcher.match(filePath));
  },

  _loadExcludedFiles() {
    this._excludedFileMatchers = this._excludedFileMasks.map(function (fileMask) {
      return new minimatch.Minimatch(path.resolve(this._basePath, fileMask), {
        dot: true
      });
    }, this);
  },

  _resolveExtendsFile(filePath) {
    if (isAbsolutePath(filePath) || !/\w|@/.test(filePath.charAt(0))) {
      filePath = path.resolve(this._basePath, filePath);

      if (!fs.existsSync(filePath)) {
        throw new Error(`Cannot find configuration file "${filePath}" to extend`);
      }
    } else {
      const packageName = utils.normalizePackageName(filePath, 'pug-lint-config');

      try {
        filePath = resolve.sync(packageName);
      } catch {
        throw new Error(`Cannot find module "${packageName}" to extend`);
      }
    }

    return filePath;
  }
};

module.exports = Linter;
