// Returns a random integer between min (included) and max (included)
function getRandom(min, max) {
  return Math.floor(Math.random() * (max + 1 - min)) + min;
}

var count = getRandom(3, 10),
	rooms = new Array(count);

for (var i = 0; i < count; i++) {
	rooms[i] = {
		x: getRandom(100, 2500),
		z: getRandom(100, 2500),
		height: getRandom(50, 500)
	}
};

var girls = [
	{ x: 1200, z: 500, image: 'images/happy-girl.png' },
	{ x: 1700, z: 1700, image: 'images/mad-girl.png' },
	{ x: 2100, z: 600, image: 'images/in-a-band-girl.png' },
	{ x: 790, z: 1100, image: 'images/kick-it-girl.png' }
];

component.exports = {
	noCssTransform: true,
	data: {
		x: -2000, y: 0, z: 0,
		rotateX: -15, rotateY: 0, rotateZ: 0,
		rooms: rooms,
		girls: girls
	},
	computed: {
		strollZ: {
			get: '-${z}',
			set: function(z){
				this.set('z', -z);
			}
		},
		strollX: {
			get: '-${x}',
			set: function(x){
				this.set('x', -x);
			}
		}
	}
};
