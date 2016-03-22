# cli-autocomplete

**A command line prompt with autocompletion** that is simple and lightweight. It provides just the ui, you are responsible for relevant completions.

[![asciicast](https://asciinema.org/a/39918.png)](https://asciinema.org/a/39918)

[![npm version](https://img.shields.io/npm/v/cli-autocomplete.svg)](https://www.npmjs.com/package/cli-autocomplete)
[![build status](https://img.shields.io/travis/derhuerst/cli-autocomplete.svg)](https://travis-ci.org/derhuerst/cli-autocomplete)
[![dependency status](https://img.shields.io/david/derhuerst/cli-autocomplete.svg)](https://david-dm.org/derhuerst/cli-autocomplete#info=dependencies)
[![dev dependency status](https://img.shields.io/david/dev/derhuerst/cli-autocomplete.svg)](https://david-dm.org/derhuerst/cli-autocomplete#info=devDependencies)

*cli-autocomplete* uses [*cli-styles*](https://github.com/derhuerst/cli-styles) to have a look & feel consistent with other prompts.


## Installing

```
npm install cli-autocomplete
```


## Usage

```js
const prompt = require('cli-autocomplete')

const colors = [
	{title: 'red',    value: '#f00'},
	{title: 'yellow', value: '#ff0'},
	{title: 'green',  value: '#0f0'},
	{title: 'blue',   value: '#00f'},
	{title: 'black',  value: '#000'},
	{title: 'white',  value: '#fff'}
]

prompt('What is your favorite color?', {
	suggest: (input) => colors
		.filter((c) => c.title.slice(0, input.length) === input)
})
.then(console.log)
```



## Contributing

If you **have a question**, **found a bug** or want to **propose a feature**, have a look at [the issues page](https://github.com/derhuerst/cli-autocomplete/issues).
