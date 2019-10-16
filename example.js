'use strict'

const words = require('more-words')
const autocompletePrompt = require('./index')

const data = words.map((word) => ({title: word, value: word}))

const suggestWords = (input) => new Promise((yay) => {
	setTimeout(() => {
		const words = data
			.filter((d) => d.title.slice(0, input.length) === input)
			// .map((d, i) => {
			// 	if (i === 3) return Object.assign({}, d, {
			// 		title: d.title + 'f'.repeat(70)
			// 	})
			// 	else if (i === 4) return Object.assign({}, d, {
			// 		title: d.title + 'f'.repeat(80)
			// 	})
			// 	return d
			// })
		yay(words)
	}, 10)
})

autocompletePrompt('What is your favorite color?', suggestWords)
// .on('data', (e) => console.log('Interim value', e.value))
.on('abort', (v) => console.log('Aborted with', v))
.on('submit', (v) => console.log('Submitted with', v))
