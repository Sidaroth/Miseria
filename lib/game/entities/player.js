ig.module(
	'game.entities.player'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityPlayer = ig.Entity.extend({
	size: {x: 14, y: 32},
	offset: {x: 1, y: 0},

	type: ig.Entity.TYPE.A,
	checkAgainst: ig.Entity.TYPE.B,
	collides: ig.Entity.COLLIDES.PASSIVE,

	animSheet: new ig.AnimationSheet( 'media/Spritesheet.png', 16, 32),
	sound_HitGround: new ig.Sound( 'media/player_hit.*'),

	facing: "right",

	accelGround: 250,
	accelAir: 200,
	jump: 225,
	maxVel: {x:70, y:450},
	maxVelRunning: 170,
	maxVelWalking: 70,
	friction: {x: 900, y: 100},
	slopeStanding: {min: (44).toRad(), max: (136).toRad() },
	flip: false,
	health: 10,
	hasWoken: true,
	turnAccel: 500,
	kills: false,
	spawnPoint: {x:0, y:0},
	
	bombs: 0,
	//curWeapon: null,
	//weapons: new Array(),

	hitArea: {x:0, y:0, w:16, h:16},
/*
	accelGround: 250, maxVel.x: 150, friction: 900, turnAccel: 500, Fast walking
	accelGround: 250, maxVel.x: 40, friction: 900, turnAccel: 500, Slow walking
*/

	init: function( x, y, settings ) {
		this.addAnim('idle', .1, [400], true);
		this.parent( x, y, settings ); // Super
	},

	spawn: function()
	{
		// console.log(this.spawnPoint);
		this.pos.x = this.spawnPoint.x;
		this.pos.y = this.spawnPoint.y;
		this.vel.x = this.maxVelWalking;
		this.vel.y = this.maxVelWalking;
	},

	update: function() {

 			var accel = this.standing ? this.accelGround : this.accelAir;

 			if(ig.input.state('run'))
 			{
 				this.maxVel.x = this.maxVelRunning;
 			}
 			else
 			{
 				this.maxVel.x = this.maxVelWalking;
 			}
			
			if(ig.input.state('right')){

				if(this.pos.x <= ig.system.width - (this.size.x + 10))
				{
					if(this.vel.x < 0) 
					{
						accel += this.turnAccel;
					}

					this.accel.x = accel;
					this.flip = true;
					this.facing = "right";
				}
				else
				{
					this.accel.x = 0;
				}
			}
			else if (ig.input.state('left'))
			{	
				if(this.pos.x > 10)
				{
					if(this.vel.x > 5)
					{
						accel += this.turnAccel;
					}

					this.accel.x = -accel;
					this.flip = false;
					this.facing = "left";
				}
				else
				{
					this.accel.x = 0;
				}
			}
			else
			{
				this.accel.x = 0;
			}

			if(this.standing && ig.input.state('jump'))
			{
				this.vel.y = -this.jump;
			}

			if(!this.standing)
			{
				this.maxVelWalking = 55;
				if(this.vel.y > 0)
				{
					this.gravityFactor = 1.5;
				}
			}

		this.parent();
	}, 

	setSpawnPoint: function(x, y, nick)
	{
		this.spawnPoint.x = x;
		this.spawnPoint.y = y;
		this.spawn();
	},

	handleMovementTrace: function( res ) {

		// console.log(res.collision);
		// if(this.vel.y > 20){
		// 	// console.log(this.vel.y);
		// }

	 //    if( res.collision.y && this.vel.y > 200 ) {
	 //    	ig.game.spawnEntity(EntityBox, this.pos.x, (this.pos.y + this.size.y), {dir: -1});
	 //    	ig.game.spawnEntity(EntityBox, (this.pos.x + this.size.x), (this.pos.y + this.size.y), {dir: 1});

	 //    	this.gravityFactor = 1.0;
	 //    	this.maxVelWalking = 70;
	 //        this.sound_HitGround.play();
	 //    }

	    // Continue resolving the collision as normal
	    this.parent(res); 
	},

	check: function (other) {
		
		// if (this.kills) {
		// 	if ((this.facing == "right" && other.pos.x > this.pos.x) || (this.facing == "left" && other.pos.x < this.pos.x)) {
		// 		console.log("kill");
		// 		other.receiveDamage(1, "Player");
		// 		this.kills = false;
		// 	}
		// }
	}


});

EntityBox = ig.Entity.extend({
    size: {x: 2, y: 2},
    vel: {x: 160, y: -150},

    type: ig.Entity.TYPE.B,
    checkAgainst: ig.Entity.TYPE.NONE,
    collides: ig.Entity.COLLIDES.LIGHT,
    

	animSheet: new ig.AnimationSheet( 'media/particles.png', 2, 2 ),

    used: false,
    flip: false,
    dir: 0,


//    animSheet: new ig.AnimationSheet('media/classical_ruin.png', 16, 16),
    
    init: function (x, y, settings) {
        this.parent(x, y, settings);
    	this.addAnim('idle', .1, [1], true);
    	this.dir = settings.dir;
//    	this.gravityFactor = 1.0;

		//this.maxVel.x = 250;
    	this.vel.x = 200 * this.dir;
    	this.vel.y = -150;



    	if(this.dir)	// Going right. 
    	{
    		this.friction.x = this.vel.x * -.2;
    		this.friction.y = this.vel.y * .2;
    	}
    	else	// Going left. 
    	{
    		this.friction.x = this.vel.x * -.2;
    		this.friction.y = this.vel.y * .2;
    	}
    },

    handleMovementTrace: function( res ) {
		// if(this.vel.y > 20){
		// 	console.log(this.vel.y);
		// }

	    if( res.collision.y && this.vel.y > 50 ) {
	    	this.kill();
	    }

	    // Continue resolving the collision as normal
	    this.parent(res); 
	},

    update: function() {
    	this.parent();

    	if(this.pos.y >= ig.system.height)
    	{
    		this.kill();
    	}
    },

    check: function(other) {
    	//this.vel.x = 100 * this.dir;
    	// other.receiveDamage(1, this);
    	// this.kill();
    },
});

});

		
// 		if (!this.hasWoken) {
// 			if (this.currentAnim == this.anims.wakeup) {
// 				this.currentAnim.update();
// 				if (this.currentAnim.loopCount) {
// 					this.currentAnim = this.anims.idle;
// 					this.flip = true;
// 					this.hasWoken = true;
// 				}
// 			}
		
// 		} else {

// 			if (this.currentAnim == this.anims.die) {
// 				this.currentAnim.update();
// 				if (this.currentAnim.loopCount) {
// 					this.kill();
// 					ig.game.reloadLevel();
// 				}
// 				return;
// 			}

// 			if (this.currentAnim == this.anims.door) {
// 				this.currentAnim.update();
// 				if (this.currentAnim.loopCount) {
// 					ig.game.loadNextLevel();
// 				}
// 				return;
// 			}

// /*
// 			if (this.kills) {
// 				this.currentAnim.update();
// 				if (this.currentAnim.loopCount > 0) {
// 					this.kills = false;
// 					this.anims.kill.rewind();
// 					this.currentAnim = this.anims.idle;
// 				}
// 				return;
// 			}
// */
	

// 			if (ig.input.state('run')) {
// 				this.maxVel.x = this.maxVelRunning;
// 			} else {
// 				this.maxVel.x = this.maxVelWalking;
// 			}
			
// 			if (ig.input.pressed('throw') && this.bombs > 0) {
// 				var x = this.pos.x + (this.flip ? 23 : -10);
// 				var y = this.pos.y - 5;
//                 ig.game.spawnEntity(EntityBomb, x, y, {flip: this.flip});
//                 this.bombs--;
// 			}
			
// 			if (this.standing && ig.input.state('jump')) {
// 				this.vel.y = -this.jump;
// 			}

// 			if (ig.input.pressed('kill') && this.standing) {
// 				this.kills = true;
// 			}

// 			if (this.maxVel.x == this.maxVelWalking && this.vel.x != 0) {
// 				this.currentAnim = this.anims.walk;
// 			} else if (this.maxVel.x == this.maxVelRunning && this.vel.x != 0) {
// 				this.currentAnim = this.anims.run;
// 			} else {
// 				this.currentAnim = this.anims.idle;
// 			}

// 			if (this.vel.y > -200 && this.vel.y < 100 && !this.standing) {
// 				this.currentAnim = this.anims.hover;
// 			} else if (this.vel.y != 0 && !this.standing) {
// 				this.currentAnim = this.anims.jump;
// 			}

// /*
// 			if (this.kills) {
// 				this.currentAnim = this.anims.kill;
// 			}
// */
// 			this.currentAnim.flip.x = this.flip;

// 			this.hitArea.x = this.flip ? this.pos.x + 20 : this.pos.x - 20;
// 			this.hitArea.y = this.pos.y;

// 			if (this.kills) {
//                 ig.game.spawnEntity(EntityBox, this.hitArea.x, this.hitArea.y, {flip:this.flip});
//                 this.kills = false;
// 			}
// 		}

	// pickedupPowerup: function(powerup) {
	// 	if (powerup.powerupType == "bomb") {
	// 		this.bombs += powerup.amount;
	// 	}
	// },

	// receiveDamage: function (amount, from) {
	// 	this.health -= amount;
	// 	if (this.health == 0) {
	// 		if (this.currentAnim != this.anims.die) {
	// 			this.currentAnim = this.anims.die.rewind();
	// 		}
	// 	}
	// },

 //    triggeredByInput: function(inputKey) {
 //    	if (inputKey == 'up') {
 //    		this.currentAnim = this.anims.door.rewind();
 //    	}
 //    },

 //    gotWeapon: function(wpn) {
 //    	var add = true;
 //    	var i = 0;

 //    	for (i = 0; i < this.weapons.length; i++) {
 //    		if (this.weapons[i].weaponName == wpn.weaponName) {
	//     		add = false;
	//     		break;
	//     	}
 //    	}
 //    	if (add) this.weapons.push(wpn);
 //    	else this.weapons[i].amount += wpn.amount;

 //    	this.setCurWeapon(wpn);
 //    },

 //    setCurWeapon: function(wpn) {
	// 	if (wpn.weaponName != "none") {
	// 		for (var i=0; i<this.weapons.length; i++) {
	// 			if (this.weapons[i].weaponName == wpn.weaponName) {
	// 				this.curWeapon = this.weapons[i];
	// 				console.log("cur weapon is "+this.curWeapon.weaponName);
	// 				break;
	// 			}
	// 		}
	// 	}
 //    },