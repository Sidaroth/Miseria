ig.module(
	'game.entities.img'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityImg = ig.Entity.extend({

	_wmDrawBox: true,
	_wmBoxColor: 'rgba(0, 255, 0, 0.7)',

	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.NEVER,

	size: {x: 640, y:480},

	img: new ig.Image( 'media/Title.png' ),

	init: function(x, y, settings){ 
		this.gravityFactor = 0;
	},

	draw: function(){
		this.parent();
		this.img.draw( this.pos.x, this.pos.y );
	}
});

});