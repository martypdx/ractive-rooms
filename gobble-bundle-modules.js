var browserify = require( 'browserify' ),
	fs = require( 'fs' ),
	join = require( 'path' ).join;

module.exports = function bundleModules( src, dir, options ) {
	options = options || {};
	// const { modules, dest } = options;
	const modules = options.modules, dest = options.dest;
	if ( !modules || !modules.length ) return;

	const b = browserify();
	modules.forEach( module => b.require( module ) );

	const bundle = join( dir, dest || 'modules.js' );

	return new Promise( ( r, j ) => {
		b.bundle()
			.pipe( fs.createWriteStream( bundle ) )
			.on( 'finish', r )
			.on( 'error', j );
	});
};
