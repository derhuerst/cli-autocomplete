prompt = require './index.js'
stream = require 'stream'
sink   = require 'stream-sink'

pass   = require 'pass-stream'

module.exports =

	'prints to stdout': (t) ->
		# stdin = new stream.PassThrough()
		stdin = pass()
		stdout = sink()
		# p = prompt 'foo', {stdin, stdout, suggest: -> ['bar']}
		p = prompt 'foo', {stdin, stdout: process.stdout, suggest: -> ['bar']}
		stdin.write '_\n' # send any char
		stdout.on 'data', console.error
		t.done()
