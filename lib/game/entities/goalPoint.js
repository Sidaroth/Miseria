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

	size: {x: 16, y:32},
	nextLevel: '',

	animSheet: new ig.AnimationSheet('media/Spritesheet.png', 16, 32),

	gameScreen: true,

	init: function(x, y, settings)
	{
		this.gravityFactor = 0;
		this.addAnim('closed', .1, [240], true);
		this.addAnim('opening', .1, [280, 281, 282, 283]);
		this.currentAnim = this.anims['closed'];
		this.parent(x, y, settings);
	},

	update: function() {
		if (this.currentAnim == this.anims.opening) {
			this.currentAnim.update();
			if (this.currentAnim.loopCount) {
				ig.game.loadNextLevel(this.nextLevel, this.gameScreen);
			}
			return;
		}

		this.parent();
	},

	triggeredBy: function( entity, trigger ) {
		this.currentAnim = this.anims.opening;
	}

});

});