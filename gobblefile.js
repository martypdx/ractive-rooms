var gobble = require('gobble'),
	makeComponent = require('./gobble-plugins/make-component'),
	sass = require('./gobble-plugins/sass-file'),
	join = require('path').join; //,
// 	package = require( './package.json' ),
// 	bundleModules = require( './gobble-bundle-modules' );

// var modules = gobble( 'assets/js/passthru' )
// 	.transform( bundleModules, {
// 		modules: Object.keys( package.dependencies ),
// 		dest: 'modules.js'
// 	});

var css = gobble('assets/scss').transform( 'sass', {
	src: 'main.scss',
	dest: 'min.css'
});

var images = gobble('assets/images').moveTo('images');

var components = gobble('assets/components')
	.transform( sass, {
		includePaths: [ join(process.cwd(), 'assets/scss/include') ]
	})
	.transform('babel')
	.transform( makeComponent )
	.transform('ractive', { type: 'es6' });

var js = gobble( 'assets/js' ).transform( 'babel');

var bundle = gobble([ js, components ]).transform( 'rollup', {
  // REQUIRED - the file to start bundling from
  entry: 'index.js',

  // where to write the file to. If omitted,
  // will match the entry module's name
  dest: 'bundle.js',

  // what type of module to create - can be one of
  // 'amd', 'cjs', 'es6', 'iife', 'umd'. Defaults to 'cjs'
  format: 'iife',

  // if generating a 'umd' module, and the entry module
  // (and therefore the bundle) has exports, specify
  // a global name
  // moduleName: 'myApp', // becomes `window.myApp`

  //external: ['ractive']

});

var index = gobble('assets').include('index.html')

module.exports = gobble( [ bundle, /*modules,*/ css, images, index ] );
