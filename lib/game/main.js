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
    
    level_col: null,
    level_fg: null,
    level_fg_data: null,
    level_width: 0,
    level_height: 0,
    level_d: null,
    
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
        'titleScreen': LevelTitleScreen //,
        //'credits': LevelCredits
	},

	init: function() {
		ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
		ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
		ig.input.bind(ig.KEY.UP_ARROW, 'up');
		ig.input.bind(ig.KEY.DOWN_ARROW, 'down');
		ig.input.bind(ig.KEY.SPACE, 'jump');
		ig.input.bind(ig.KEY.SHIFT, 'run');
        ig.input.bind(ig.KEY.ENTER, 'enter');
		ig.input.bind( ig.KEY.MOUSE1, 'click' );


        ig.music.add('media/Russian_tunev03_loopable.*', 'mainSoundtrackv1');
        ig.music.add('media/Russian_tunev03_loopable2.*', 'mainSoundtrackv2');
        ig.music.add('media/screen.*', 'titleScreenTrack');
        ig.music.currentTrack = ig.music.tracks[1];
        //console.log(ig.music);
        ig.music.volume = 0.5;
        ig.music.loop = true;


		//this.loadLevel(LevelTestWave, true);
        this.loadLevel(LevelTitleScreen, false);
	},

    getLayers: function() {
        for (var l in this.backgroundMaps) {
            var bm = this.backgroundMaps[l];
            if (bm.name === 'foreground') {
                this.level_fg = bm;
                this.level_fg_data = ig.copy(this.level_fg.data);
            }
        }
        // this.level_col = ig.copy(this.collisionMap.data);
        // this.level_col = this.collisionMap.data;
        this.level_col = this.collisionMap;
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
            
            this.level_d = this.level_fg.data,
            this.level_height = this.level_d.length,
            this.level_width = this.level_d[0].length,        
        
           this.nextWave();
        }
        else
        {
            this.buttons = this.getEntitiesByType(EntityButton);

            if(this.buttons.length > 0)
            {
                this.buttons[this.selectedButton].highlight();
            }
        }
	},
	
	loadNextLevel: function(levelKey, gameScreen)
	{
		//console.log(levelKey);
		console.log(this.levels);
		this.loadLevel(this.levels[levelKey], gameScreen);
	},


	// setSpawnPoint: function(nick, pos) {
	// 	this.spawnPoints.push(new Array(nick, pos));
	// 	this.player.spawnPoint = nick;
	// },
		
	update: function() {

        // if (ig.input.released('click')) {
        //     this.wave_on = true;
        // }
        if(this.gameScreen === true)
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

                    var fg = this.level_fg,
                        d = this.level_fg_data,
                        changes = [],
                        current_col = [],

                        splice_old = false,
                        next_wave = false,
                        total_length = 0;

                    total_length = this.level_width + this.wave_len;
                    this.wave_travel_len = this.level_width - this.wave_calc_offset - this.wave_pos;

                    // console.log('wave pos: '+this.wave_pos+
                    //     ' total length: '+total_length+
                    //     ' travel len: '+this.wave_travel_len+
                    //     ' level width: '+this.level_width+
                    //     ' tot sum: '+(total_length - this.wave_travel_len));

                    for (var r=0; r<this.level_height; r++) {

                        if (total_length - this.wave_travel_len > this.wave_len) {
                            current_col.push(d[r][this.wave_pos]); // save current col

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
                                    over = this.level_d[oy][ox];
                                }
                                if (this.wave_pos < this.level_width-1) {
                                    rx = this.wave_pos+1;
                                    ry = r;
                                    right = this.level_d[ry][rx];
                                }
                                if (r < this.level_height-1) {
                                    ux = this.wave_pos;
                                    uy = r+1;
                                    under = this.level_d[uy][ux];
                                }
                                // left is wrong!
                                if (this.wave_pos > 0) {
                                    lx = this.wave_pos-1;
                                    ly = r;
                                    left = this.level_d[ly][lx];
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
                            this.wave_pos = this.level_width-1;
                            this.wave_calc_offset = 1;

                            this.wave_on = false;

                            // console.log(this.level_col);
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
                        }
                    }

                } // end modulo

            } // end if(this.wave_on)
        }
        else
        {
            // Button Selection. 
            if(ig.input.released('up'))
            {
                console.log(this.selectedButton);
                this.buttons[this.selectedButton].highlight();

                if(this.selectedButton == 0)
                {
                    this.selectedButton = this.buttons.length - 1;
                }
                else
                {
                    --this.selectedButton;
                }
                this.buttons[this.selectedButton].highlight();
            }
            else if(ig.input.released('down'))
            {
                console.log(this.selectedButton);
                // dehighlight the old one
                this.buttons[this.selectedButton].highlight();
                if(this.selectedButton == this.buttons.length - 1)
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

            if(ig.input.released('jump') || ig.input.released('enter')) // click a button
            {
                this.buttons[this.selectedButton].click(this.selectedButton);
            }
        }
            // console.log(this.level_col);
        this.parent();
    },

    drawLevelData: function(y, x, val, collision) {
        this.level_fg.data[y][x] = val;
        this.level_col.data[y][x] = collision;

        // console.log('set '+y+'/'+x+' to '+collision);

        // check player pos. Need to offset it?
        if (collision === 1) {
            var ppos_tile = this.getTileForPos(this.player.pos);
            if (ppos_tile.x === x && (ppos_tile.y === y /*|| ppos_tile.y === y-1*/)) {
                
                var pix_diff = {
                    x: this.player.pos.x - (this.level_fg.tilesize * x),
                    y: this.player.pos.y - (this.level_fg.tilesize * y)
                };
                console.log('hit at '+x+'|'+y);
                // console.log('diff x:'+pix_diff.x+' y:'+pix_diff.y);

                // this.player.pos.x -= pix_diff.x;
                this.player.vel.y = -200;
            }
        }
    },

    nextWave: function() {
        if (--this.wave_pos < 0) this.wave_pos = this.level_width-1;
        // console.log(this.wave_pos);
    },

    getTileForPos: function(pos) {
        var ts = this.level_fg.tilesize;
        return {x:Math.floor(pos.x/ts), y:Math.floor(pos.y/ts)};
    }

});


// Start the Game with 60fps, a resolution of 480x320, scaled
// up by a factor of 2
ig.main( '#canvas', MyGame, 60, 640, 480, 2);

});
