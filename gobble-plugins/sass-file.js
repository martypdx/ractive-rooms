var sass = require('node-sass');

function sassFile(input, options) {
	options = options || {}
	options.data = input
	var result = sass.renderSync(options);
	return result.css;
}

sassFile.defaults = {
	accept: ['.scss'],
	ext: '.css'
}

module.exports = sassFile
