'use strict'

const prompt   = require('./index')
const stations = require('../vbb-stations-autocomplete')

prompt('which station?', {
	suggest: (query) =>
		stations(query, 3).map((s) => ({title: s.name, value: s.id}))
})
.then((id) => console.log(`You selected ${id}.`))
