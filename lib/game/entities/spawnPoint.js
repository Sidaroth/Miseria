ig.module(
	'game.entities.spawnPoint'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntitySpawnPoint = ig.Entity.extend({
	_wmDrawBox: true,
	_wmBoxColor: 'rgba(0, 255, 0, 0.7)',

	size: {x: 16, y:16},

	//update: function(){}
});

});