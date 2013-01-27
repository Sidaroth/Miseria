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
		this.timer = new ig.Timer(8);
	},

	update: function()
	{
		// console.log(this.timer.delta());
		if(this.timer.delta() > 0)
		{
			ig.game.loadNextLevel('level1', true);
		}

		if(ig.input.pressed('enter') || ig.input.pressed('jump'))
		{
			ig.game.loadNextLevel('level1', true);
		}
	}
});
});