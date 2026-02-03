// # validateTemplateString: `true` | Array
//
// Validate the use of template string in Pug templates.
//
// The option can either be an array or `true`. If it is an array, it can
// contain the following strings. If it is `true` signifies all of the
// following subrules are enabled.
//
// ## `'variable'`
//
// ```pug
// //- Invalid
// h1= `${title}`
//
// //- Valid
// h1= title
// ```
//
// ## `'string'`
//
// ```pug
// //- Invalid
// h1= `title`
//
// //- Valid
// h1= 'title'
// ```
//
// ## `'concatenation'`
//
// ```pug
// //- Invalid
// h1= `title` + `text`
// h1= `title` + variable
//
// //- Valid
// h1= `titletext`
// h1= `title${variable}`
// ```

const assert = require('node:assert');

const acornWalk = require('acorn/dist/walk');

const utils = require('../utils.js');

module.exports = Rule;

function Rule() {}

Rule.prototype = {
  name: 'validateTemplateString',

  schema: {
    anyOf: [
      {
        enum: [null, true]
      },
      {
        type: 'array',
        items: {
          enum: ['variable', 'string', 'concatenation']
        }
      }
    ]
  },

  configure(options) {
    assert(
      options === true || Array.isArray(options),
      `${this.name} option requires a true or array value or should be removed`
    );

    if (options === true) {
      this._subrules = {
        variable: true,
        string: true,
        concatenation: true
      };
    } else {
      this._subrules = options.reduce((prev, cur) => {
        prev[cur] = true;
        return prev;
      }, {});
    }
  },

  lint(file, errors) {
    file.iterateTokensByFilter(
      token =>
        (token.type === 'code' && token.buffer) ||
        token.type === 'interpolated-code' ||
        (token.type === 'attribute' && typeof token.val === 'string'),
      token => {
        if (this._subrules.string || this._subrules.variable) {
          file.addErrorWithAcorn(
            token,
            ast => {
              const out = [];

              acornWalk.ancestor(ast, {
                TemplateLiteral: (node, ancestors) => {
                  if (ancestors.length > 1 && ancestors[ancestors.length - 2].type === 'TaggedTemplateExpression') {
                    return;
                  }

                  const canBeString = this._subrules.string && !node.expressions.length;
                  const canBeVariable =
                    this._subrules.variable &&
                    node.quasis.length === 2 &&
                    node.quasis[0].value.raw === '' &&
                    node.quasis[1].value.raw === '';

                  if (canBeString || canBeVariable) {
                    out.push(node);
                  }
                }
              });

              return out;
            },
            errors,
            'Template string is unnecessary'
          );
        }

        if (this._subrules.concatenation) {
          file.addErrorWithAcorn(
            token,
            (ast, tokens) => {
              const out = [];

              acornWalk.simple(ast, {
                BinaryExpression: node => {
                  if (node.operator === '+' && (isTmpl(node.left) || isTmpl(node.right))) {
                    out.push(utils.getNextAcornToken(tokens, node.left.end));
                  }

                  function isTmpl(node) {
                    return node.type === 'TemplateLiteral';
                  }
                }
              });

              return out;
            },
            errors,
            'Unneeded template string concatenation'
          );
        }
      }
    );
  }
};
