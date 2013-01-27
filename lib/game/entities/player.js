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

	sounds: { 'walkRight': new ig.Sound('media/step_right02.*'),
			  'walkLeft': new ig.Sound('media/step_left02.*'),
			  'jump': new ig.Sound('media/jump.*')
	},

//	sound_HitGround: new ig.Sound( 'media/player_hit.*'),

	facing: "right",

	accelGround: 250,
	accelAir: 200,
	jump: 210,
	// jump: 275,
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
	
	die_timer: null,
	die_time: 1,
	died: false,

	bombs: 0,
	//curWeapon: null,
	//weapons: new Array(),
	coll_dir: {
		top: null, right: null, bottom: null, left: null
	},

	hitArea: {x:0, y:0, w:16, h:16},

	timer: new ig.Timer(),
/*
	accelGround: 250, maxVel.x: 150, friction: 900, turnAccel: 500, Fast walking
	accelGround: 250, maxVel.x: 40, friction: 900, turnAccel: 500, Slow walking
*/

	init: function( x, y, settings ) {
		this.addAnim('idle', .1, [360], true);
		this.addAnim('walk', .1, [400, 401, 402, 403, 404, 405]);
		this.addAnim('jump', .1, [440, 441, 442, 443, 444]);
		// this.addAnim('die', 1, [480]);
		this.parent( x, y, settings ); // Super

		this.sounds['walkRight'].volume = 0.5;
		this.sounds['walkLeft'].volume = 0.5;
		this.sounds['jump'].volume = 0.6;
	},

	spawn: function()
	{
		// console.log(this.spawnPoint);
		this.currentAnim = this.anims.idle;
		this.pos.x = this.spawnPoint.x;
		this.pos.y = this.spawnPoint.y;
		this.vel.x = this.maxVelWalking;
		this.vel.y = this.maxVelWalking;
	},

	checkSurroundings: function() {
		var tx = Math.floor(this.pos.x / ig.game.layer_fg.tilesize),
			ty = Math.floor(this.pos.y / ig.game.layer_fg.tilesize),
			
			c_data = ig.game.layer_col.data;

		// get tiles at top, right, bottom, left
		this.coll_dir.top = c_data[ty-1] ? c_data[ty-1][tx] : 0;

		if (ty < c_data.length && (tx+1) < c_data[ty].length) {
			this.coll_dir.right = c_data[ty][tx+1];
		} else if ((ty+1) < c_data.length && (tx+1) < c_data[ty+1].length) {
			this.coll_dir.right = c_data[ty+1][tx+1];
		} else {
			this.coll_dir.right = 0;
		}

		this.coll_dir.bottom = c_data[ty+2] ? c_data[ty+2][tx] : 0;

		if (ty < c_data.length && (tx-1) < c_data[ty].length) {
			this.coll_dir.left = c_data[ty][tx-1];
		} else if ((ty+1) < c_data.length && (tx-1) < c_data[ty+1].length) {
			this.coll_dir.left = c_data[ty+1][tx-1];
		} else {
			this.coll_dir.left = 0;
		}
	},

	update: function() {
		//console.log(this.timer.delta());
		this.checkSurroundings();

		ig.show('top', ig.game.player.coll_dir.top );
		ig.show('right', ig.game.player.coll_dir.right );
		ig.show('bottom', ig.game.player.coll_dir.bottom );
		ig.show('left', ig.game.player.coll_dir.left );

		if (this.currentAnim === this.anims.die) {
			if (this.die_timer.delta() >= 0) {
				this.spawn();
				this.die_timer = null;
			}
		}
		else {
			var accel = this.standing ? this.accelGround : this.accelAir;

			this.maxVel.x = this.maxVelWalking;
			
			if (ig.input.state('right')) {

				if(this.pos.x <= ig.system.width - (this.size.x + 10)) {
					if(this.vel.x < 0) 
						accel += this.turnAccel;

					if(this.timer.delta() > 0 && this.standing)
					{
						this.sounds['walkRight'].play();	
						this.timer.set(0.32);
					}
					this.accel.x = accel;
					this.flip = false;
					this.facing = "right";
				}
				else {
					this.accel.x = 0;
				}
			}
			else if (ig.input.state('left')) {
				if(this.pos.x > 10) {
					if(this.vel.x > 5)
						accel += this.turnAccel;

					if(this.timer.delta() > 0 && this.standing)
					{
						this.sounds['walkLeft'].play();	
						this.timer.set(0.32);
					}

					this.accel.x = -accel;
					this.flip = true;
					this.facing = "left";
				}
				else {
					this.accel.x = 0;
				}
			}
			else {

				this.accel.x = 0;
			}

			if (this.maxVel.x == this.maxVelWalking && this.vel.x != 0)
				this.currentAnim = this.anims.walk;
			else 
				this.currentAnim = this.anims.idle;

			if (this.vel.y != 0 && !this.standing) 
				this.currentAnim = this.anims.jump;


			if(this.standing && ig.input.state('jump'))
			{
				this.vel.y = -this.jump;
				this.sounds['jump'].play();
			}

			this.currentAnim.flip.x = this.flip;

			if(!this.standing) {
				this.maxVelWalking = 55;
				if(this.vel.y > 0)
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

	    if( res.collision.y && this.vel.y > 200 ) {
	    	//ig.game.spawnEntity(EntityBox, this.pos.x, (this.pos.y + this.size.y), {dir: -1});
	    	//ig.game.spawnEntity(EntityBox, (this.pos.x + this.size.x), (this.pos.y + this.size.y), {dir: 1});

	    	this.gravityFactor = 1.0;
	    	this.maxVelWalking = 70;
	    }

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
	// ,

	// die: function() {
	// 	if (!this.died) {
	// 		this.died = true;
	// 		this.currentAnim = this.anims.die;
	// 		this.die_timer = new ig.Timer(this.die_time);
	// 	}
	// }


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