ig.module(
	'game.entities.goalPoint'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityGoalPoint = ig.Entity.extend({
	_wmDrawBox: true,
	_wmBoxColor: 'rgba(0, 255, 0, 0.7)',
	_wmScalable: true,

	size: {x: 16, y:16},

	triggeredBy: function( entity, trigger ) {	
		//entity.loadNextLevel();
	}

	//update: function(){}
});

});