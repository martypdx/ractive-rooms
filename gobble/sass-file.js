var sass = require('node-sass');

function sassFile(input, options) {
	options = options || {}
	options.data = input
	return sass.renderSync(options)
}

sassFile.defaults = {
	accept: ['.scss'],
	ext: '.css'
}

module.exports = sassFile
