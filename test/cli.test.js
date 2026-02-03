const { describe, it } = require('node:test');
const assert = require('node:assert');
const bin = require.resolve('../bin/pug-lint');
const fs = require('node:fs');
const path = require('node:path');
const spawn = require('node:child_process').spawn;
const fixturesPath = path.join(__dirname, 'fixtures/');
const fixturesRelativePath = './test/fixtures/';
const packageDetails = require('../package.json');

describe('cli', () => {
  function run(args, cb) {
    const command = [bin].concat(args);
    let stdout = '';
    let stderr = '';
    const node = process.execPath;
    const child = spawn(node, command);

    if (child.stderr) {
      child.stderr.on('data', chunk => {
        stderr += chunk;
      });
    }

    if (child.stdout) {
      child.stdout.on('data', chunk => {
        stdout += chunk;
      });
    }

    child.on('error', cb);

    child.on('close', code => {
      cb(null, code, stdout, stderr);
    });

    return child;
  }

  it('should output the current version number', (_, done) => {
    const args = ['-V'];

    run(args, (err, code, stdout, stderr) => {
      assert.ifError(err);
      assert.equal(code, 0, code);
      assert.equal(stderr, '', stderr);
      assert.equal(stdout.indexOf(packageDetails.version) !== -1, true, stdout);
      done();
    });
  });

  it('should output help', (_, done) => {
    const args = ['-h'];
    const message = 'Usage: pug-lint [options] <file...>';

    run(args, (err, code, stdout, stderr) => {
      assert.ifError(err);
      assert.equal(code, 0, code);
      assert.equal(stderr, '', stderr);
      assert.equal(stdout.includes(message), true, stdout);
      assert.equal(stdout.includes(packageDetails.description.slice(0, 40)), true, stdout);
      done();
    });
  });

  it('should output help if no file specified', (_, done) => {
    const args = [];
    const message = 'Usage: pug-lint [options] <file...>';

    run(args, (err, code, _stdout, stderr) => {
      assert.ifError(err);
      assert.equal(code, 1, code);
      assert.equal(stderr.includes(message), true, stderr);
      assert.equal(stderr.includes(packageDetails.description.slice(0, 40)), true, stderr);
      done();
    });
  });

  it('should report errors for file path', (_, done) => {
    const args = [`${fixturesRelativePath}invalid.pug`];
    const expectedReport = fs.readFileSync(`${fixturesPath}reporters/expected-invalid.txt`, 'utf-8');

    run(args, (err, code, stdout, stderr) => {
      assert.ifError(err);
      assert.equal(code, 2, code);
      assert.equal(stdout, '', stdout);
      assert.equal(stderr.trim(), expectedReport.replace(/%dirname%/g, fixturesRelativePath).trim(), stderr);
      done();
    });
  });

  it('should report errors for directory path', (_, done) => {
    const dirname = `${fixturesRelativePath}rules/`;
    const args = [dirname];
    const expectedReport = fs.readFileSync(`${fixturesPath}reporters/expected-invalid.txt`, 'utf-8');

    run(args, (err, code, stdout, stderr) => {
      assert.ifError(err);
      assert.equal(code, 2, code);
      assert.equal(stdout, '', stdout);
      assert.equal(stderr.trim(), expectedReport.replace(/%dirname%/g, dirname).trim(), stderr);
      done();
    });
  });

  it('should use config when it is supplied', (_, done) => {
    const dirname = `${fixturesRelativePath}rules/`;
    const args = ['-c', `${fixturesPath}config-file/dotfile/.pug-lintrc`, `${dirname}disallow-block-expansion.pug`];
    const expectedReport = fs.readFileSync(
      `${fixturesPath}reporters/expected-disallow-block-expansion--console.txt`,
      'utf-8'
    );

    run(args, (err, code, stdout, stderr) => {
      assert.ifError(err);
      assert.equal(code, 2, code);
      assert.equal(stdout, '', stdout);
      assert.equal(stderr.trim(), expectedReport.replace(/%dirname%/g, dirname).trim(), stderr);
      done();
    });
  });

  it('should error on invalid reporter', (_, done) => {
    const args = ['-r', 'nonexistent', fixturesRelativePath];

    run(args, (err, code, stdout, stderr) => {
      assert.ifError(err);
      assert.equal(code, 1, code);
      assert.equal(stdout, '', stdout);
      assert.equal(stderr.trim(), 'Reporter "nonexistent" does not exist', stderr);
      done();
    });
  });

  it('should report errors using reporter', (_, done) => {
    const dirname = `${fixturesRelativePath}rules/`;
    const args = [
      '-r',
      'inline',
      '-c',
      `${fixturesPath}config-file/dotfile/.pug-lintrc`,
      `${dirname}disallow-block-expansion.pug`
    ];
    const expectedReport = fs.readFileSync(
      `${fixturesPath}reporters/expected-disallow-block-expansion--inline.txt`,
      'utf-8'
    );

    run(args, (err, code, stdout, stderr) => {
      assert.ifError(err);
      assert.equal(code, 2, code);
      assert.equal(stdout, '', stdout);
      assert.equal(stderr.trim(), expectedReport.replace(/%dirname%/g, dirname).trim(), stderr);
      done();
    });
  });
});
