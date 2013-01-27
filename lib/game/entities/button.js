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

	size: {x: 16, y:16},
	highlighted: false,

	animSheet: new ig.AnimationSheet( 'media/test-tiles.png', 16, 16 ),

	init: function(x, y, settings){
		this.parent(x, y, settings);
		this.gravityFactor = 0;
		this.addAnim('unselected', .1, [0], true);
		this.addAnim('selected', .1, [1], true);
		this.currentAnim = this.anims.unselected;
		//this.parent(x, y, settings);
	},

	highlight: function(){
		if(this.highlighted === true)
		{
			this.currentAnim = this.anims.unselected;
			this.highlighted = false;
		}
		else
		{
			this.currentAnim = this.anims.selected;
			this.highlighted = true;
		}
	},

	click: function(id)
	{
		switch(id)
		{
			case 0: // Start Game
			ig.game.loadNextLevel('level1', true);
			break;

			case 1: // Credits
			ig.game.loadNextLevel('credits', false);
			break;

			case 2: // Quit game
			console.log("We have no quit button... close the web page etc!");
			break;

			default: // Something went wrong.
			console.log("Default case triggered in button.click()");
			break;
		}
	}

});

});