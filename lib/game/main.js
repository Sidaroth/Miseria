ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',
	'game.levels.test-wave',
	'game.levels.level2',
	'game.entities.player',
	'game.entities.spawnPoint',
	'game.entities.goalPoint'
)
.defines(function(){

MyGame = ig.Game.extend({
	
	// Load a font
	font: new ig.Font( 'media/04b03.font.png' ),
	spawnPoint: {},

	player: null, 
	gravity: 500,

	init: function() {
		ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
		ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
		ig.input.bind(ig.KEY.UP_ARROW, 'up');
		ig.input.bind(ig.KEY.DOWN_ARROW, 'down');
		ig.input.bind(ig.KEY.SPACE, 'jump');
		ig.input.bind(ig.KEY.SHIFT, 'run');

		this.loadLevel(LevelTestWave);
	},
	
	update: function() {
		// Update all entities and backgroundMaps
		this.parent();
		
		// Add your own, additional update code here
	},

	loadLevel: function(level) {
		this.parent(level);
		this.spawnPoint = this.getEntitiesByType(EntitySpawnPoint)[0];

		this.player = this.getEntitiesByType(EntityPlayer)[0];
		this.player.setSpawnPoint(this.spawnPoint.pos.x, this.spawnPoint.pos.y);
	},
	
	// setSpawnPoint: function(nick, pos) {
	// 	this.spawnPoints.push(new Array(nick, pos));
	// 	this.player.spawnPoint = nick;
	// },

	draw: function() {
		// Draw all entities and backgroundMaps
		this.parent();
		
		// Add your own drawing code here
		var x = ig.system.width/2,
			y = ig.system.height/2;
	}

});


// Start the Game with 60fps, a resolution of 480x320, scaled
// up by a factor of 2
ig.main( '#canvas', MyGame, 60, 480, 320, 2 );
});
