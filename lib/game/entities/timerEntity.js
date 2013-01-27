ig.module(
	'game.entities.timerEntity'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityTimerEntity = ig.Entity.extend({

	_wmDrawBox: true,
	_wmBoxColor: 'rgba(123, 123, 123, 0.7)', 

	timer: {},

	init: function(x, y, settings)
	{
		this.timer = new ig.Timer(5);
	},

	update: function()
	{
		// console.log(this.timer.delta());
		if(this.timer.delta() > 0)
		{
			ig.game.loadNextLevel('level1', true);
		}
	}
});
});