'use strict'

const chalk =   require('chalk')
const figures = require('figures')
const output =  require('log-update')
const escapes = require('ansi-escapes')




const styles = {
	default:   (input) => input,
	password:  (input) => '*'.repeat(input.length),
	invisible: (input) => ''
}

const symbols = {
	aborted: chalk.red(figures.cross),
	done:    chalk.green(figures.tick),
	default: chalk.cyan('?')
}

const defaults = {
	symbol:    (ctx) => ctx.aborted ? symbols.aborted : (ctx.done ? symbols.done : symbols.default),
	text:      '',
	delimiter: chalk.gray('>'),
	replace:   styles.default,
	suggest:   (input) => []
}



const render = function (ctx) {
	// todo: `output` appends a line break :/
	output(escapes.eraseLine + (!ctx.done ? escapes.cursorShow : '') + [
		ctx._.symbol(ctx),
		ctx._.text,
		ctx._.delimiter,
		ctx._.replace(ctx.input)
	].join(' '))
}
const prompt = function (text, opt) {
	if ('string' !== typeof text) throw new Error('text must be a string.')
	if (arguments.length < 2 || 'object' !== typeof opt) opt = {}
	opt = Object.assign({}, defaults, opt, {text})
	let ctx = {
		_:           opt,
		done:        false,
		aborted:     false,
		input:       '',
		suggestions: []
	}

	render(ctx)

	return new Promise(function (resolve, reject) {
		ctx.resolve = resolve
		ctx.reject =  reject
	})
}



module.exports = Object.assign(prompt, {styles, symbols, defaults})
