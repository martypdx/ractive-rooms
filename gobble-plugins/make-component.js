var fs = require('fs'),
	join = require('path').join

module.exports = function makeComponent ( src, outputdir, options, callback ) {


	function isDirectory(f){
		return fs.lstatSync(join(src,f)).isDirectory()
	}

	function readFile(name, ext){
		var p = join(src, name, name + '.' + ext)
		return  fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : ''
	}

	function wrapFile(tag, file){
		return file ? '\n\n<' + tag + '>\n' + file + '\n\n</'+ tag + '>\n' : ''
	}

	try {
		var components = fs.readdirSync(src).filter(isDirectory)
		var imports = 'import Ractive from "ractive";\n';
		var list = '';//"var Ractive = require('ractive');\n\n"

		components.forEach( function( c, i ) {
			imports += 'import C' + i + ' from "./' + c + '";\n';
			list += "Ractive.components['" + c + "'] = C" + i + ";\n"
			var file = readFile(c, 'html')
			file += wrapFile('style', readFile(c, 'css') )
			file += wrapFile('script', readFile(c, 'js') )
			var write = join(outputdir, c + '.html')
			fs.writeFileSync(write, file)
		});
		fs.writeFileSync(join(outputdir, 'components.js'), imports + list)
		callback()
	} catch(err){
		callback(err)
	}

}
