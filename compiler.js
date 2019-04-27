/**
 * Micro ES6 `import` statement Compiler
 * Suports: Basic `import` statement
 * Ex:
 * `import module from "module";` => `var module = require("module");`
 */

// To understand the theory in much detail, please read it from:
// https://github.com/jamiebuilds/the-super-tiny-compiler/blob/master/the-super-tiny-compiler.js#L78-L360
// Except that it's explained for Lisp-like function call to C-like function call.
// Description will soon be added here. :)

// Constants
const KEYWORDS = ['import', 'from'];
const WHITESPACE = /\s/;
const NEWLINE = /\n/;
const LETTERS = /[a-zA-Z]/;

function tokenizer(input) {
  let current = 0;
  const tokens = [];

  while (current < input.length) {
    let char = input[current];

    if (WHITESPACE.test(char) || NEWLINE.test(char) || char === ';') {
      current++;
      continue;
    }

    if (char === '"') {
      let value = '';

      char = input[++current];

      while (char !== '"') {
        value += char;
        char = input[++current];
      }

      tokens.push({ type: 'string', value: value });

      current++;
      continue;
    }

    if (LETTERS.test(char)) {
      let value = '';

      while (LETTERS.test(char)) {
        value += char;
        char = input[++current];
      }

      if (KEYWORDS.indexOf(value) > -1) {
        // keywords
        tokens.push({ type: 'keyword', value: value });
      } else {
        // identifier
        tokens.push({ type: 'identifier', value: value });
      }

      current++;
      continue;
    }

    throw new Error(`Unrecognized token: ${char}`);
  }

  return tokens;
}

function parser(tokens) {
  let current = 0;

  function walk() {
    let token = tokens[current];

    if (token.type === 'string') {
      current++;

      return {
        type: 'StringLiteral',
        value: token.value
      };
    }

    if (token.type === 'identifier') {
      current++;

      return {
        type: 'Identifier',
        name: token.value
      };
    }

    if (token.type === 'keyword') {
      if (token.value === 'import') {
        current++;

        const node = {
          type: 'ImportDeclaration',
          source: undefined,
          specifier: undefined
        };

        // expect an identifier (module name) after `import` keyword.
        if (tokens[current].type === 'identifier') {
          node.specifier = walk();
        } else {
          throw new Error(
            `Parse error: Unexpected ${tokens[current].value} after \`import\``
          );
        }

        // expect keyword `from` after the identifier.
        if (
          tokens[current].type === 'keyword' &&
          tokens[current].value === 'from'
        ) {
          current++;
        } else {
          throw new Error(
            `Parse Error: Unexpected token after ${node.specifier.value}`
          );
        }

        // expect string token after the `from` keyword
        if (tokens[current].type === 'string') {
          node.source = walk();
        } else {
          throw new Error(`Parse Error: Unexpected token after \`from\``);
        }

        return node;
      }
    }

    throw new Error(`Unrecognized token: ${token.value}`);
  }

  const ast = {
    type: 'Program',
    body: []
  };

  while (current < tokens.length) {
    ast.body.push(walk());
  }

  return ast;
}

function traverser(ast, visitor) {
  function traverseArray(array) {
    array.forEach(traverseNode);
  }

  function traverseNode(node) {
    const method = visitor[node.type];

    switch (node.type) {
      case 'Program':
        traverseArray(node.body);
        break;

      case 'StringLiteral':
      case 'Identifier':
        break;

      case 'ImportDeclaration':
        traverseNode(node.specifier);
        traverseNode(node.source);
        break;

      default:
        throw new TypeError(node.type);
    }

    if (method) {
      method(node);
    }
  }

  traverseNode(ast);
}

function transformer(ast) {
  traverser(ast, {
    ImportDeclaration(node) {
      let variableDeclaration = {
        type: 'VariableDeclaration',
        kind: 'var',
        id: node.specifier,
        init: undefined
      };

      let callExpression = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'require'
        },
        arguments: [node.source]
      };

      variableDeclaration.init = callExpression;

      delete node.specifier;
      delete node.source;
      Object.assign(node, variableDeclaration);
    }
  });

  return ast;
}

function codeGenerator(node) {
  switch (node.type) {
    case 'Program': {
      return node.body.map(codeGenerator).join('\n');
    }

    case 'VariableDeclaration': {
      return (
        node.kind +
        ' ' +
        codeGenerator(node.id) +
        ' = ' +
        codeGenerator(node.init)
      );
    }

    case 'CallExpression': {
      return (
        codeGenerator(node.callee) +
        '(' +
        node.arguments.map(codeGenerator).join(', ') +
        ')' +
        ';'
      );
    }

    case 'Identifier': {
      return node.name;
    }

    case 'StringLiteral': {
      return '"' + node.value + '"';
    }
  }
}

function compiler(input) {
  const tokens = tokenizer(input);
  const ast = parser(tokens);
  const transformedAst = transformer(ast);
  const output = codeGenerator(transformedAst);

  return output;
}

module.exports = {
  tokenizer,
  parser,
  transformer,
  codeGenerator,
  compiler
};
