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
	'game.entities.goalPoint',
    'game.entities.button',
    'game.levels.titleScreen',
    'impact.debug.debug'
)
.defines(function(){

MyGame = ig.Game.extend({
    
    font: new ig.Font( 'media/04b03.font.png' ),
    
    layer_col: null,
    layer_fg: null,
    layer_fg_data: null,
    layer_width: 0,
    layer_height: 0,
    layer_d: null,
    
    wave_old: [],
    wave_travel_len: 0,
    wave_on: false,
    wave_pos: 0,
    wave_len: 6,
    wave_calc_offset: 1,
    wave_timer: null,
    wave_move_int: 3,
    wave_next: 0,
    
	spawnPoint: {},

	player: null,
	gravity: 500,
    gameScreen: false,

    selectedButton: 0,
    buttons: {},
    
	levels: {
		'level1': LevelTestWave,
		'level2': LevelLevel2,
        'titleScreen': LevelTitleScreen
	},

    coll_tiles: new ig.Image( 'media/coll-debug.png' ),

	init: function() {
		ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
		ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
		ig.input.bind(ig.KEY.UP_ARROW, 'up');
		ig.input.bind(ig.KEY.DOWN_ARROW, 'down');
		ig.input.bind(ig.KEY.SPACE, 'jump');
		ig.input.bind(ig.KEY.SHIFT, 'run');
        ig.input.bind(ig.KEY.ENTER, 'enter');
		ig.input.bind( ig.KEY.MOUSE1, 'click' );


		this.loadLevel(LevelTestWave, true);
        // this.loadLevel(LevelTitleScreen, false);

        console.log(this);
	},

    getLayers: function() {
        for (var l in this.backgroundMaps) {
            var bm = this.backgroundMaps[l];
            if (bm.name === 'foreground') {
                this.layer_fg = bm;
                this.layer_fg_data = ig.copy(this.layer_fg.data);
            }
        }
        // this.layer_col = ig.copy(this.collisionMap.data);
        // this.layer_col = this.collisionMap.data;
        this.layer_col = this.collisionMap;

        var bgmap = new ig.BackgroundMap( 16, this.layer_col.data, this.coll_tiles );
        this.backgroundMaps.push( bgmap );
    },

	loadLevel: function(level, gameScreen) {
		this.parent(level);

        this.gameScreen = gameScreen;
        if(gameScreen === true)
        {
            this.spawnPoint = this.getEntitiesByType(EntitySpawnPoint)[0];
            this.player = this.getEntitiesByType(EntityPlayer)[0];
            this.player.setSpawnPoint(this.spawnPoint.pos.x, this.spawnPoint.pos.y);

            this.getLayers();
            
            this.layer_d = this.layer_fg.data,
            this.layer_height = this.layer_d.length,
            this.layer_width = this.layer_d[0].length,        
        
           this.nextWave();
        }
        else
        {
            this.buttons = this.getEntitiesByType(EntityButton);
        }
	},
	
	loadNextLevel: function(levelKey)
	{
		//console.log(levelKey);
		console.log(this.levels);
		this.loadLevel(this.levels[levelKey]);
	},


	// setSpawnPoint: function(nick, pos) {
	// 	this.spawnPoints.push(new Array(nick, pos));
	// 	this.player.spawnPoint = nick;
	// },
		
	update: function() {

        // if (ig.input.released('click')) {
        //     this.wave_on = true;
        // }
        if(this.gameScreen)
        {
            if (!this.wave_on) {
                this.wave_next += ig.system.tick;
                if (this.wave_next > this.wave_move_int) {
                    this.wave_next = 0;
                    this.wave_on = true;
                }
            }

            else {
                this.wave_next += ig.system.tick;

                if (this.wave_next > 0.1) {
                    this.wave_next = 0;

                    var fg = this.layer_fg,
                        d = this.layer_fg_data,
                        changes = [],
                        current_col = [],

                        splice_old = false,
                        next_wave = false,
                        total_length = 0;

                    total_length = this.layer_width + this.wave_len;
                    this.wave_travel_len = this.layer_width - this.wave_calc_offset - this.wave_pos;

                    // console.log('wave pos: '+this.wave_pos+
                    //     ' total length: '+total_length+
                    //     ' travel len: '+this.wave_travel_len+
                    //     ' level width: '+this.layer_width+
                    //     ' tot sum: '+(total_length - this.wave_travel_len));
                            
                    this.wave_old.push(new Array());

                    var old_string = '';

                    for (var r=0; r<this.layer_height; r++) {

                        if (total_length - this.wave_travel_len > this.wave_len) {

                            old_string += d[r][this.wave_pos] + ',';
                            var wp = 0;
                                wp = d[r][this.wave_pos];

                            this.wave_old[this.wave_old.length-1].push(wp);
                            // current_col.push(d[r][this.wave_pos]); // save current col
                            // current_col.push(d[r][this.wave_pos]); // save current col
                            // console.log(r+':'+d[r][this.wave_pos]);

                            // MODIFY STUFF START

                            var wave_i = d[r][this.wave_pos],
                                over = under = right = left = null,
                                ox = oy = null,
                                ux = uy = null,
                                rx = ry = null,
                                lx = ly = null;

                            if (wave_i > 0) {
                                if (r > 0) {
                                    ox = this.wave_pos;
                                    oy = r-1;
                                    over = this.layer_d[oy][ox];
                                }
                                if (this.wave_pos < this.layer_width-1) {
                                    rx = this.wave_pos+1;
                                    ry = r;
                                    right = this.layer_d[ry][rx];
                                }
                                if (r < this.layer_height-1) {
                                    ux = this.wave_pos;
                                    uy = r+1;
                                    under = this.layer_d[uy][ux];
                                }
                                // left is wrong!
                                if (this.wave_pos > 0) {
                                    lx = this.wave_pos-1;
                                    ly = r;
                                    left = this.layer_d[ly][lx];
                                }
                                
                                if (over === 0) changes.push({y:oy, x:ox, i:wave_i+1});
                                if (right === 0) changes.push({y:ry, x:rx, i:wave_i+1});
                                if (under === 0) changes.push({y:uy, x:ux, i:wave_i+1});
                                if (left === 0) changes.push({y:ly, x:lx, i:wave_i+1});
                            }

                            // MODIFY STUFF END

                            if (this.wave_travel_len >= this.wave_len) {
                                // fg.data[r][this.wave_pos + this.wave_len] = this.wave_old[0][r];
                                this.drawLevelData(r, this.wave_pos + this.wave_len, this.wave_old[0][r], 1);
                                // console.log('wave old('+(this.wave_pos + this.wave_len)+') '+this.wave_old[0][r]);
                                splice_old = true;
                            }

                            if (this.wave_pos > 0) { next_wave = true; }
                            else { this.wave_calc_offset = 0; }
                        }

                        else {
                            // runs when the wave has passed the outer left edge
                            // fg.data[r][this.wave_old.length-1] = this.wave_old[0][r];
                            this.drawLevelData(r, this.wave_old.length-1, this.wave_old[0][r], 0);
                            splice_old = true;
                        }

                    } // end looping through row

                    console.log(this.wave_old);

                    console.log(old_string);

                    if (current_col.length > 0) {
                        this.wave_old.push(current_col);
                    }

                    if (splice_old) {
                        this.wave_old.shift();
                        // this.wave_old.splice(0,1);
                        
                        if (this.wave_old.length === 0) {
                            // reset
                            this.wave_old = [];
                            this.wave_travel_len = 0;
                            this.wave_pos = this.layer_width-1;
                            this.wave_calc_offset = 1;

                            this.wave_on = false;

                            // console.log(this.layer_col);
                        }
                    }

                    if (next_wave) {
                        this.nextWave();
                    }

                    if (changes.length > 0) {
                        for (var i=0; i<changes.length; i++) {
                            var c = changes[i];
                            // fg.data[c.y][c.x] = c.i;
                            this.drawLevelData(c.y, c.x, c.i, 1);
                        	this.checkPlayerCollision(c.x, c.y);
                        	// this.drawCollisionData(c.x, c.y, 1)
                        }
                    }
                }

            } // end if(this.wave_on)
        }
        else
        {
            

            if(ig.input.state('up'))
            {
                this.buttons[this.selectedButton].highlight();
                if(this.selectedButton == 0)
                {
                    this.selectedButton = this.Buttons.len;
                }
                else
                {
                    --this.selectedButton;
                }
                this.buttons[this.selectedButton].highlight();
            }
            else if(ig.input.state('down'))
            {
                // dehighlight the old one
                this.buttons[this.selectedButton].highlight();
                if(this.selectedButton == this.Buttons.len - 1)
                {
                    this.selectedButton = 0;
                }
                else
                {
                    ++this.selectedButton;
                }
                //highlight the new. 
                this.buttons[this.selectedButton].highlight();
            }

            if(ig.input.state('jump') || ig.input.state('enter'))
            {

            }
        }
            // console.log(this.layer_col);
        this.parent();
    },

    drawLevelData: function(y, x, val, collision) {
        this.layer_fg.data[y][x] = val;
        this.layer_col.data[y][x] = collision;
        // if (typeof collision !== 'undefined')
        //     this.drawCollisionData(y, x, collision);
    },

    drawCollisionData: function(y, x, collision) {
        this.layer_col.data[y][x] = collision;
    },

    checkPlayerCollision: function(x, y) {
        // console.log('set '+y+'/'+x+' to '+collision);

        // check player pos. Need to offset it?
        /*
        get player pos
        get collision tile pos
        get diff
        */

        var ppos = this.player.pos,
            cpos = {x:(x*this.layer_fg.tilesize), y:(y*this.layer_fg.tilesize)},

        // console.log(ppos);
        // console.log(cpos);

            diff = {x:ppos.x - cpos.x, y:ppos.y - cpos.y};

        // diff.y = 0 -> -15    : coll tile is at the players head
        // diff.y = -16 -> -31  : coll tile is at the players feet
        // diff.x = 0 -> 15     : coll tile is at left
        // diff.x = 0 -> -15    : coll tile is at right

        if (diff.y <= 0 && diff.y > -this.layer_fg.tilesize) {
            if (diff.x >= -this.layer_fg.tilesize && diff.x <= this.layer_fg.tilesize) {
                if (this.player.coll_dir.left) {
                    console.log('bounce right');
                    console.log('Force X:'+(this.layer_fg.tilesize+diff.x)+' Y:0');
                }
                else {
                    console.log('bounce left');
                    console.log('Force X:'+(-(this.layer_fg.tilesize+diff.x))+' Y:0');
                }
            // if (diff.x >= 0 && diff.x <= this.layer_fg.tilesize) {
                // console.log('[x:'+diff.x+' y:'+diff.y+'] coll at left head');
            // }
            
            // else if (diff.x <= 0 && diff.x >= -this.layer_fg.tilesize) {
                // console.log('[x:'+diff.x+' y:'+diff.y+'] coll at right head');
            }
        }

        else if (diff.y <= -this.layer_fg.tilesize && diff.y >= -this.player.size.y) {
            if (diff.x >= -this.layer_fg.tilesize && diff.x <= this.layer_fg.tilesize) {
            // if (diff.x >= 0 && diff.x <= this.layer_fg.tilesize) {
                if (this.player.coll_dir.bottom) {
                    if (this.player.coll_dir.top) {
                        console.log('squish!');
                    }
                    else {
                        console.log('bounce up');
                        console.log('Force Y:'+(diff.y));
                        this.player.vel.y = diff.y * 20;
                    }
                }
                // console.log('[x:'+diff.x+' y:'+diff.y+'] coll at left feet');
                // console.log('Force X:'+(this.layer_fg.tilesize-diff.x)+' Y:'+(diff.y));
            // }
            // else if (diff.x <= 0 && diff.x >= -this.layer_fg.tilesize) {
            //     if (this.player.coll_dir.bottom && this.player.coll_dir.bottom) {
            //         console.log('squish!');
            //     }
                // console.log('[x:'+diff.x+' y:'+diff.y+'] coll at right feet');
                // console.log('Force X:'+(-(this.layer_fg.tilesize+diff.x))+' Y:'+(diff.y));
            }
        }


        // var ppos_tile = this.getTileForPos(this.player.pos);
        // if (ppos_tile.x === x && (ppos_tile.y === y /*|| ppos_tile.y === y-1*/)) {
            
        //     var pix_diff = {
        //         x: this.player.pos.x - (this.layer_fg.tilesize * x),
        //         y: this.player.pos.y - (this.layer_fg.tilesize * y)
        //     };
        //     console.log('hit at '+x+'|'+y);
        //     // console.log('diff x:'+pix_diff.x+' y:'+pix_diff.y);

        //     // this.player.pos.x -= pix_diff.x;
        //     this.player.vel.y = -200;
        // }
    },

    nextWave: function() {
        if (--this.wave_pos < 0) this.wave_pos = this.layer_width-1;
        // console.log(this.wave_pos);
    },

    getTileForPos: function(pos) {
        var ts = this.layer_fg.tilesize;
        return {x:Math.floor(pos.x/ts), y:Math.floor(pos.y/ts)};
    },

    draw: function() {
        this.parent();
        // this.layer_col.setScreenPos( this.screen.x, this.screen.y );
        // this.layer_col.draw();
    }

});


// Start the Game with 60fps, a resolution of 480x320, scaled
// up by a factor of 2
ig.main( '#canvas', MyGame, 60, 640, 480, 2);

});
