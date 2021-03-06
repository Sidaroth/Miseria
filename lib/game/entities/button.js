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
	id: 1,

	size: {x: 145, y:28},
	highlighted: false,

	animSheet: new ig.AnimationSheet( 'media/Buttons.png', 145, 28 ),

	init: function(x, y, settings){
		this.parent(x, y, settings);
		this.gravityFactor = 0;
		this.addAnim('unselected0', .1, [0], true);
		this.addAnim('selected0', .1, [1], true);
		this.addAnim('unselected1', .1, [2], true);
		this.addAnim('selected1', .1, [3], true);
		this.addAnim('unselected2', .1, [4], true);
		this.addAnim('selected2', .1, [4], true);
		console.log(this.id);
		this.currentAnim = this.anims['unselected1'];
		//this.parent(x, y, settings);
	},

	highlight: function(id){
		if(this.highlighted === true)
		{
			this.currentAnim = this.anims['unselected' + this.id];
			this.highlighted = false;
		}
		else
		{
			this.currentAnim = this.anims['selected' + this.id];
			this.highlighted = true;
		}
	},

	click: function(id)
	{
		switch(this.id)
		{
			case 0: // Start Game
			ig.game.loadNextLevel('introScreen', false);
			break;

			case 1: // Credits
			ig.game.loadNextLevel('credits', false);
			break;

			case 2: // Menu
			ig.game.loadNextLevel('titleScreen', false);
			break;

			default: // Something went wrong.
			console.log("Default case triggered in button.click()");
			break;
		}
	}

});

});