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

	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.NEVER,

	size: {x: 16, y:32},

	//update: function(){}
});

});