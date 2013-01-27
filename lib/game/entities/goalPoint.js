ig.module(
	'game.entities.goalPoint'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityGoalPoint = ig.Entity.extend({
	_wmDrawBox: true,
	_wmBoxColor: 'rgba(125, 125, 125, 0.7)',
	_wmScalable: true,

	size: {x: 16, y:16},
	nextLevel: '',

	animSheet: new ig.AnimationSheet('media/Spritesheet.png', 16, 16),

	init: function(x, y, settings)
	{

		this.addAnim('closed', .1, [280], true);
		this.addAnim('opening', .1, [280, 281, 282, 283]);
		this.currentAnim = this.anims['closed'];
		this.parent(x, y, settings);
	},


	triggeredBy: function( entity, trigger ) {	
		console.log(this.nextLevel);
		ig.game.loadNextLevel(this.nextLevel, true);
	}

	//update: function(){}
});

});