# micro-es6-import-compiler

A micro, over-simplified compiler that turns ES6 `import` statement into CommonJS `require` statement.

## How to use

Go ahead, clone the repo, `npm install`, edit code in `try.js` and run with `node try.js` to see the compiler in action.

In order to better understand the parts of compiler, you shall edit code to check and see how different parts, at different stages generate different outputs.

## Documentation

You may love to read the concepts in more detail over [here](https://github.com/jamiebuilds/the-super-tiny-compiler/blob/master/the-super-tiny-compiler.js#L78-L360). Although, that explains for compiling call expression from Lisp-like to C-like statements. But should do to explain you a lot. :)

## Inspiration

The [super tiny compiler by James Kyle](https://github.com/jamiebuilds/the-super-tiny-compiler)

## License

MIT © [yatharthk](https://twitter.com/yatharthkhatri)
