ig.module( 
    'game.main' 
)
.requires(
    'impact.game',
    'impact.font',

    'game.levels.test-wave'
)
.defines(function(){

MyGame = ig.Game.extend({
    
    font: new ig.Font( 'media/04b03.font.png' ),
    
    level_fg: null,
    level_fg_data: null,
    level_width: 0,
    level_height: 0,
    level_d: null,
    

    init: function() {
        this.loadLevel(LevelTestWave);
        // console.log(this);
        // console.log(this.level_fg.data.length);
    },

    loadLevel: function(level) {
        this.parent(level);

        ig.input.bind( ig.KEY.MOUSE1, 'click' );
        this.getForegroundLevel();
        // this.remapLevel();
        
        this.level_d = this.level_fg.data,
        this.level_height = this.level_d.length,
        this.level_width = this.level_d[0].length,
        
        this.nextWave();
        // console.log('level height:'+this.level_height);
    },

    getForegroundLevel: function() {
        for (var l in this.backgroundMaps) {
            var bm = this.backgroundMaps[l];
            if (bm.name === 'foreground') {
                this.level_fg = bm;
                this.level_fg_data = ig.copy(this.level_fg.data);
            }
        }
    },
    
    wave_old: [],
    wave_travel_len: 0,
    wave_on: true,
    wave_pos: 0,
    wave_len: 6,
    wave_calc_offset: 1,

    update: function() {
        this.parent();

        // if (ig.input.released('click')) {
        //     this.wave_on = true;
        // }

        // if (this.wave_on) {
        
            var fg = this.level_fg,
                d = this.level_fg_data,
                changes = [],
                current_row = [],

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
                    current_row.push(d[r][this.wave_pos]); // save current row

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
                        fg.data[r][this.wave_pos + this.wave_len] = this.wave_old[0][r];
                        // console.log('put: '+this.wave_old[0][r]+' at ' + (this.wave_pos + this.wave_len));
                        splice_old = true;
                    }

                    if (this.wave_pos > 0) { next_wave = true; }
                    else { this.wave_calc_offset = 0; }
                }

                else {
                    // runs when the wave has passed the outer left edge
                    fg.data[r][this.wave_old.length-1] = this.wave_old[0][r];
                    splice_old = true;
                }

            } // end looping through row

            if (current_row.length > 0) {
                this.wave_old.push(current_row);
            }

            if (splice_old) {
                this.wave_old.splice(0,1);
                
                if (this.wave_old.length === 0) {
                    // reset
                    this.wave_old = [];
                    this.wave_travel_len = 0;
                    this.wave_pos = this.level_width-1;
                    this.wave_calc_offset = 1;
                }
            }

            if (next_wave) {
                this.nextWave();
            }

            if (changes.length > 0) {
                for (var i=0; i<changes.length; i++) {
                    var c = changes[i];
                    fg.data[c.y][c.x] = c.i;
                }
            }

        //     this.wave_on = false;
        // }
    },

    nextWave: function() {
        if (--this.wave_pos < 0) this.wave_pos = this.level_width-1;
        // console.log(this.wave_pos);
    },
    
    draw: function() {
        this.parent();
    }

    // level_map: [],
    // remapLevel: function() {
    //     // flattens out the level to a one-dimensional array
    //     var d = this.level_fg.data,
    //         height = d.length,
    //         width = d[0].length,
    //         x = 0,
    //         y = 0;

    //     for (var i=0; i<(width*height); i++) {
    //         x = i % width;
    //         y = Math.floor(i / width);
    //         this.level_map.push(d[y][x]);
    //     }
    // },
});


// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', MyGame, 60, 480, 320, 1);

});
