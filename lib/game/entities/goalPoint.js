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

	size: {x: 16, y:16},
	nextLevel: '',

	triggeredBy: function( entity, trigger ) {	
		console.log(this.nextLevel);
		ig.game.loadNextLevel(this.nextLevel, true);
	}

	//update: function(){}
});

});