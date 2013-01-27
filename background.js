// ig.module(
// 	'game.entities.background'
// )
// .requires(
// 	'impact.entity'
// )
// .defines(function(){

// EntityBackground = ig.Entity.extend({

// 	_wmDrawBox: true,
// 	_wmBoxColor: 'rgba(0, 200, 200, 0.7)',

// 	type: ig.Entity.TYPE.NONE,
// 	checkAgainst: ig.Entity.TYPE.NONE,
// 	collides: ig.Entity.COLLIDES.NEVER,

// 	size: {x: 640, y:480},

// 	img: new ig.Image( 'media/Sky.png' ),

// 	init: function(x, y, settings){ 
// 		this.gravityFactor = 0;
// 	},

// 	draw: function(){
// 		this.img.draw( this.pos.x, this.pos.y );
// 		this.parent();
// 	}
// });

// });