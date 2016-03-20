'use strict'

const chalk =     require('chalk')
const escapes =   require('ansi-escapes')
const stripAnsi = require('strip-ansi')

const ui =        require('./ui')



const renderPrompt = (ctx) => [
	ui.symbol(ctx.done, ctx.aborted),
	ctx._.text,
	ui.delimiter,
	(ctx.done && ctx.cursor in ctx.suggestions
		? ctx.suggestions[ctx.cursor].title
		: ctx.render(ctx.input))
].join(' ')

var linesRendered = 0

const clear = (ctx) => // cursor is at the end of the first rendered line
	(linesRendered > 0 ? escapes.cursorDown(linesRendered) : '') // move to last rendered line
	+ escapes.eraseLines(linesRendered + 1) // move to first rendered line, deleting everything

const renderSuggestion = (ctx) =>
	(s, i) => i === ctx.cursor ? chalk.cyan(s.title) : s.title

const render = function (ctx) {
	process.stdout.write(clear())

	if (ctx.done) {
		process.stdout.write(renderPrompt(ctx) + '\n')
		linesRendered = 2
	} else {
		let lines = [renderPrompt(ctx)]
			.concat(ctx.suggestions.map(renderSuggestion(ctx)))
		linesRendered = lines.length

		process.stdout.write(
			lines.join('\n')
			+ (lines.length > 1 ? escapes.cursorUp(lines.length - 1) : '')
			+ escapes.cursorTo(stripAnsi(lines[0]).length)
		)
	}
}



const onKey = (ctx) => function (input, enc) {
	input = input.toString(enc)

	if(/\x1b\[+[A-Z]/.test(input)) {
		let key = input.charAt(input.length - 1);
		if (key === 'A') return moveUp(ctx)
		if (key === 'B') return moveDown(ctx)
		return
	}

	let code = input.charCodeAt(0); // see https://en.wikipedia.org/wiki/GNU_Readline#Keyboard_shortcuts
	// if (code === 1)    return first(); // ctrl + A
	if (code === 3)    return abort(ctx) // ctrl + C
	if (code === 13)   return submit(ctx) // return key
	if (code === 127)  return remove(ctx) // backspace
	// if (code === 4)    return process.exit(); // ctrl + D
	// if (code === 5)    return last(); // ctrl + E
	// if (code === 7)    return reset(); // ctrl + G
	// if (code === 9)    return right(); // ctrl + I / tab
	// if (code === 10)   return submit(); // ctrl + J
	// if (code === 27)   return abort(); // escape
	// if (code === 8747) return left(); // alt + B
	// if (code === 402)  return right(); // alt + F
	onInput(ctx, input)
}

const onInput = function (ctx, input) {
	ctx.input += input
	ctx.suggestions = ctx._.suggest(ctx.input)
	render(ctx)
}



const moveUp = function (ctx) {
	if (ctx.cursor === 0) ctx.cursor = ctx.suggestions.length - 1
	else ctx.cursor--
	render(ctx)
}

const moveDown = function (ctx) {
	ctx.cursor = ++ctx.cursor % ctx.suggestions.length
	render(ctx)
}



const abort = function (ctx) {
	process.stdin.destroy()
	ctx.aborted = ctx.done = true
	render(ctx)

	ctx.reject(null)
}

const submit = function (ctx) {
	process.stdin.destroy()
	ctx.done = true
	render(ctx)

	if (ctx.cursor in ctx.suggestions)
		ctx.resolve(ctx.suggestions[ctx.cursor].value)
	else ctx.resolve(null)
}

const remove = function (ctx) {
	if (ctx.input.length === 0) return process.stdout.write(escapes.beep)
	ctx.input = ctx.input.slice(0, -1)
	ctx.suggestions = ctx._.suggest(ctx.input)
	render(ctx)
}



const defaults = {
	type:    'default',
	text:    '',
	suggest: (input) => []
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
		suggestions: [],
		cursor:      0,
		render:      ui.render(opt.type)
	}

	process.stdin.setRawMode(true)
	process.stdin.on('data', onKey(ctx))
	// todo: on 'end'
	onInput(ctx, ctx.input)

	return new Promise(function (resolve, reject) {
		ctx.resolve = resolve
		ctx.reject =  reject
	})
}



module.exports = Object.assign(prompt, {defaults})
