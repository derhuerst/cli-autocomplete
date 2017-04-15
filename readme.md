# cli-autocomplete

**A command line prompt with autocompletion.** It provides just the ui, you are responsible for relevant completions.

[![asciicast](https://asciinema.org/a/82643.png)](https://asciinema.org/a/82643)

[![npm version](https://img.shields.io/npm/v/cli-autocomplete.svg)](https://www.npmjs.com/package/cli-autocomplete)
[![build status](https://img.shields.io/travis/derhuerst/cli-autocomplete.svg)](https://travis-ci.org/derhuerst/cli-autocomplete)
[![dependency status](https://img.shields.io/david/derhuerst/cli-autocomplete.svg)](https://david-dm.org/derhuerst/cli-autocomplete#info=dependencies)
[![dev dependency status](https://img.shields.io/david/dev/derhuerst/cli-autocomplete.svg)](https://david-dm.org/derhuerst/cli-autocomplete#info=devDependencies)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/cli-autocomplete.svg)
[![chat on gitter](https://badges.gitter.im/derhuerst.svg)](https://gitter.im/derhuerst)

*cli-autocomplete* uses [*cli-styles*](https://github.com/derhuerst/cli-styles) and [*prompt-skeleton*](https://github.com/derhuerst/prompt-skeleton) to have a look & feel consistent with [other prompts](https://github.com/derhuerst/prompt-skeleton#prompts-using-prompt-skeleton).


## Installing

```
npm install cli-autocomplete
```


## Usage

```js
const autocompletePrompt = require('cli-autocomplete')

const colors = [
	{title: 'red',    value: '#f00'},
	{title: 'yellow', value: '#ff0'},
	{title: 'green',  value: '#0f0'},
	{title: 'blue',   value: '#00f'},
	{title: 'black',  value: '#000'},
	{title: 'white',  value: '#fff'}
]
const suggestColors = (input) => Promise.resolve(colors
	.filter((color) => color.title.slice(0, input.length) === input))

autocompletePrompt('What is your favorite color?', suggestColors)
.on('data', (e) => console.log('Interim value', e.value))
.on('abort', (v) => console.log('Aborted with', v))
.on('submit', (v) => console.log('Submitted with', v))
```


## Related

- [`date-prompt`](https://github.com/derhuerst/date-prompt)
- [`mail-prompt`](https://github.com/derhuerst/mail-prompt)
- [`multiselect-prompt`](https://github.com/derhuerst/multiselect-prompt)
- [`number-prompt`](https://github.com/derhuerst/number-prompt)
- [`range-prompt`](https://github.com/derhuerst/range-prompt)
- [`select-prompt`](https://github.com/derhuerst/select-prompt)
- [`text-prompt`](https://github.com/derhuerst/text-prompt)
- [`tree-select-prompt`](https://github.com/derhuerst/tree-select-prompt)
- [`switch-prompt`](https://github.com/derhuerst/switch-prompt)


## Contributing

If you **have a question**, **found a bug** or want to **propose a feature**, have a look at [the issues page](https://github.com/derhuerst/cli-autocomplete/issues).
