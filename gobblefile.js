var gobble = require('gobble'),
	makeComponent = require('./gobble-plugins/make-component'),
	sass = require('./gobble-plugins/sass-file'),
	join = require('path').join,
	package = require( './package.json' ),
	bundleModules = require( './gobble-bundle-modules' );

var modules = gobble( 'assets/js/passthru' )
	.transform( bundleModules, {
		modules: Object.keys( package.dependencies ),
		dest: 'modules.js'
	});

var css = gobble('assets/scss').transform( 'sass', {
	src: 'main.scss',
	dest: 'min.css',
	sourceMap: true
});

var images = gobble('assets/images').moveTo('images');

var components = gobble('assets/components')
	.transform( sass, {
		includePaths: [ join(process.cwd(), 'assets/scss/include') ]
	})
	.transform('babel', {
		sourceMaps: true,
		blacklist: ['es6.modules', 'strict']
	})
	.transform( makeComponent )
	.transform('ractive', { type: 'es6' });

var js = gobble( 'assets/js' ).transform( 'babel', {
		sourceMaps: true,
		blacklist: ['es6.modules', 'strict']
	});

var bundle = gobble([ js, components ]).transform( 'rollup', {
  entry: 'index.js',
  dest: 'bundle.js',

  // what type of module to create - can be one of
  // 'amd', 'cjs', 'es6', 'iife', 'umd'. Defaults to 'cjs'
  format: 'umd',

  sourceMaps: true,

  // globals: { ractive: 'Ractive' }
  // external: ['ractive']

});

var index = gobble('assets').include('index.html')

module.exports = gobble( [ bundle, modules, css, images, index ] );
