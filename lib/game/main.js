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
    layer_col_data: null,
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
        'titleScreen': LevelTitleScreen //,
        //'credits': LevelCredits
	},

    // For debugging the collision data
    // coll_tiles: new ig.Image( 'media/coll-debug.png' ),

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
        ig.music.add('media/screen2v2.*', 'titleScreenTrack');
        ig.music.currentTrack = ig.music.tracks[2];
        //console.log(ig.music);
        ig.music.volume = 0.5;
        ig.music.loop = true;
        ig.music.play();

        this.loadLevel(LevelTitleScreen, false);
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
        this.layer_col_data = ig.copy(this.collisionMap.data);

        // Debugging collision data
        // var bgmap = new ig.BackgroundMap( 16, this.layer_col.data, this.coll_tiles );
        // this.backgroundMaps.push( bgmap );
    },

	loadLevel: function(level, gameScreen) {
		this.parent(level);

        this.gameScreen = gameScreen;
        if(gameScreen === true)
        {
            ig.music.stop();
            ig.music.currentTrack = ig.music.tracks[0];
            ig.music.play();
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

            if(this.buttons.length > 0)
            {
                this.buttons[this.selectedButton].highlight(this.selectedButton);
            }
        }
	},
	
	loadNextLevel: function(levelKey, gameScreen)
	{
		//console.log(levelKey);
		// console.log(this.levels);
		this.loadLevel(this.levels[levelKey], gameScreen);
	},


	// setSpawnPoint: function(nick, pos) {
	// 	this.spawnPoints.push(new Array(nick, pos));
	// 	this.player.spawnPoint = nick;
	// },
		
	update: function() {

        if(this.gameScreen === true)
        {
            // Count seconds before sending the next wave
            if (!this.wave_on) {
                this.wave_next += ig.system.tick;
                if (this.wave_next > this.wave_move_int) {
                    this.wave_next = 0;
                    this.wave_on = true;
                }
            }

            else {
                // reuse wave_next to set the tempo of the wave
                this.wave_next += ig.system.tick;

                if (this.wave_next > 0.2) {
                    this.wave_next = 0;

                    var fg = this.layer_fg,
                        d = this.layer_fg_data,
                        cd = this.layer_col_data,
                        changes = [], // Stores the tiles that needs to be changed
                        current_col = [], // a reference to the tiles collected along the current column

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
                            
                    for (var r=0; r<this.layer_height; r++) {
                        if (total_length - this.wave_travel_len > this.wave_len) {

                            current_col.push(d[r][this.wave_pos]); // save current col

                            // MODIFY STUFF START

                            var wave_i = d[r][this.wave_pos],
                                over = under = right = left = null,
                                ox = oy = null,
                                ux = uy = null,
                                rx = ry = null,
                                lx = ly = null;

                            if (wave_i > 0 && wave_i !== 13 && wave_i !== 14 && wave_i !== 15 && wave_i !== 54) {
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
                                if (this.wave_pos > 0) {
                                    lx = this.wave_pos-1;
                                    ly = r;
                                    left = this.layer_d[ly][lx];
                                }
                                
                                // Alter wave_i so that the renderer shows the correct
                                // tiles according to the surroundings
                                if (over === 0) changes.push({y:oy, x:ox, i:wave_i});
                                if (right === 0) changes.push({y:ry, x:rx, i:wave_i});
                                if (under === 0) changes.push({y:uy, x:ux, i:wave_i});
                                if (left === 0) changes.push({y:ly, x:lx, i:wave_i});
                            }

                            // MODIFY STUFF END

                            if (this.wave_travel_len >= this.wave_len) {
                                this.drawLevelData(r, this.wave_pos + this.wave_len, this.wave_old[0][r]);
                                splice_old = true;
                            }

                            if (this.wave_pos > 0) { next_wave = true; }
                            else { this.wave_calc_offset = 0; }
                        }

                        else {
                            // runs when the wave has passed the outer left edge
                            this.drawLevelData(r, this.wave_old.length-1, this.wave_old[0][r]);
                            splice_old = true;
                        }

                    } // end looping through row

                    if (current_col.length > 0) {
                        this.wave_old.push(current_col);
                    }

                    if (changes.length > 0) {
                        for (var i=0; i<changes.length; i++) {
                            var c = changes[i];
                            this.drawLevelData(c.y, c.x, c.i);
                        	this.checkPlayerCollision(c.x, c.y);
                        }
                    }

                    if (splice_old) {
                        this.wave_old.shift();
                        
                        if (this.wave_old.length === 0) {
                            // reset
                            this.wave_old = [];
                            this.wave_travel_len = 0;
                            this.wave_pos = this.layer_width-1;
                            this.wave_calc_offset = 1;

                            this.wave_on = false;
                        }
                    }

                    if (next_wave) {
                        this.nextWave();
                    }
                }

            } // end if(this.wave_on)
        }
        else
        {
            // Button Selection. 
            if(ig.input.released('up'))
            {
                console.log(this.selectedButton);
                this.buttons[this.selectedButton].highlight(this.selectedButton);

                if(this.selectedButton == 0)
                {
                    this.selectedButton = this.buttons.length - 1;
                }
                else
                {
                    --this.selectedButton;
                }
                this.buttons[this.selectedButton].highlight(this.selectedButton);
            }
            else if(ig.input.released('down'))
            {
                console.log(this.selectedButton);
                // dehighlight the old one
                this.buttons[this.selectedButton].highlight(this.selectedButton);
                if(this.selectedButton == this.buttons.length - 1)
                {
                    this.selectedButton = 0;
                }
                else
                {
                    ++this.selectedButton;
                }
                //highlight the new. 
                this.buttons[this.selectedButton].highlight(this.selectedButton);
            }

            if(ig.input.released('jump') || ig.input.released('enter')) // click a button
            {
                this.buttons[this.selectedButton].click(this.selectedButton);
            }
        }

        this.parent();
    },

    drawLevelData: function(y, x, val) {
        this.layer_fg.data[y][x] = val;
        var c = val > 0 ? 1 : 0;
        this.layer_col.data[y][x] = c;
    },

    checkPlayerCollision: function(x, y) {
        var ppos = this.player.pos,
            cpos = {x:(x*this.layer_fg.tilesize), y:(y*this.layer_fg.tilesize)},
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
                    console.log(this.player.flip);
                    this.player.vel.x = this.layer_fg.tilesize+diff.x;
                }
                else {
                    console.log('bounce left');
                    console.log('Force X:'+(-(this.layer_fg.tilesize+diff.x))+' Y:0');
                    console.log(-(this.layer_fg.tilesize+diff.x*10));
                    console.log(this.player.flip);

                    this.player.vel.x = -(this.layer_fg.tilesize+diff.x*(this.player.flip ? 10 : -10));
                    // this.player.vel.x = this.layer_fg.tilesize + diff.x * 10 * (this.player.flip ? -1 : 1);
                }
            }
        }

        else if (diff.y <= -this.layer_fg.tilesize && diff.y >= -this.player.size.y) {
            if (diff.x >= -this.layer_fg.tilesize && diff.x <= this.layer_fg.tilesize) {

                if (this.player.coll_dir.bottom) {
                    if (this.player.coll_dir.top) {
                        this.player.die();
                    }
                    else {
                        // bounce with force Y = diff.y
                        this.player.vel.y = diff.y * 10;
                    }
                }
            }
        }
    },

    nextWave: function() {
        if (--this.wave_pos < 0) this.wave_pos = this.layer_width-1;
    }

});


// Start the Game with 60fps, a resolution of 480x320, scaled
// up by a factor of 2
ig.main( '#canvas', MyGame, 60, 640, 480, 2);

});
