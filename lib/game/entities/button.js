ig.module(
	'game.entities.button'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityButton = ig.Entity.extend({

	_wmDrawBox: true,
	_wmBoxColor: 'rgba(255, 255, 0, 0.7)',

	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.NEVER,

	size: {x: 64, y:64},
	highlighted: true,

	animSheet: new ig.AnimationSheet( 'media/test-tiles.png' ),

	init: function(x, y, settings){
		this.gravityFactor = 0;
		this.addAnim('unselected', .1, [0], true);
		this.addAnim('selected', .1, [1], true);
		this.parent(x, y, settings);
	},

	highlight: function(){
		if(highlighted)
		{
			this.currentAnim = this.anims['unselected'];
		}
		else
		{
			this.currentAnim = this.anims['selected'];
			this.highlighted = true;
		}
	}

});

});