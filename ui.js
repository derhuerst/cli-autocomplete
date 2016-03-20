'use strict'

const chalk =     require('chalk')
const figures =   require('figures')



const styles = Object.freeze({
	password:  (input) => '*'.repeat(input.length),
	invisible: (input) => '',
	default:   (input) => input
})
const render = (type) => styles[type] || styles.default

const symbols = Object.freeze({
	aborted: chalk.red(figures.cross),
	done:    chalk.green(figures.tick),
	default: chalk.cyan('?')
})

const symbol = (done, aborted) =>
	aborted ? symbols.aborted : (done ? symbols.done : symbols.default)

const delimiter = chalk.gray('>')



module.exports = Object.freeze({styles, render, symbols, symbol, delimiter})
