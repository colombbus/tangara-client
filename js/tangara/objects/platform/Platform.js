define(['jquery', 'TGraphicalObject', 'TUtils', 'ResourceManager', 'TEnvironment', 'TRuntime'], function($, TGraphicalObject, TUtils, ResourceManager, TEnvironment, TRuntime) {
    /**
     * Defines Platform, inherited from TGraphicalObject.
     * Create a whole Block from a 2D matrix.
     * @exports Platform
     */
    var Platform = function() {
        this.gObject = new this.gClass();
        this._setLocation(0, 0);
        this.baseTile="";
        this.tiles = [];
        this.rows = [];
        this.nbCols = 0;
        this.nbRows = 0;
        this.resources = new ResourceManager();
        this.sheet = null;
        this.built = false;
        TRuntime.addGraphicalObject(this, false);
        var g = TRuntime.getGraphics().getInstance();
        g.stage().collisionLayer(this.gObject);
    };

    Platform.prototype = Object.create(TGraphicalObject.prototype);
    Platform.prototype.constructor = Platform;
    Platform.prototype.className = "Platform";

    var graphics = Platform.prototype.graphics;
    
    
    var TSpriteSheet = graphics.addClass("SpriteSheet", "TSpriteSheet", {
    	init: function(img, options) {
  	      TUtils.extend(this,{
  	          name: name,
  	          img: img,
  	          w: img.width,
  	          h: img.height,
  	          tileW: 64,
  	          tileH: 64,
  	          sx: 0,
  	          sy: 0,
  	          spacingX: 0,
  	          spacingY: 0,
  	          frameProperties: {}
  	          });
  	        if(options) { TUtils.extend(this,options); }
  	        // fix for old tilew instead of tileW
  	        if(this.tilew) { 
  	          this.tileW = this.tilew; 
  	          delete this['tilew']; 
  	        }
  	        if(this.tileh) { 
  	          this.tileH = this.tileh; 
  	          delete this['tileh']; 
  	        }

  	        this.cols = this.cols || 
  	                    Math.floor(this.w / (this.tileW + this.spacingX));

  	        this.frames = this.cols * (Math.ceil(this.h/(this.tileH + this.spacingY)));
  		},
  	    draw: function(ctx, x, y, frame) {
  	        if(!ctx) { ctx = Q.ctx; }
  	        ctx.drawImage(this.img,
  	                      this.fx(frame),this.fy(frame),
  	                      this.tileW, this.tileH,
  	                      Math.floor(x),Math.floor(y),
  	                      this.tileW, this.tileH);

  	      }
    });
    
    Platform.prototype.gClass = graphics.addClass("TileLayer", "TPlatform", {
        init: function(props, defaultProps) {
            this._super(TUtils.extend({
                type: TGraphicalObject.TYPE_PLATFORM,
                frozen: false ,
                initialized: false,
                reset:false,
                drawBaseTile:false,
                built:false,
                designMode:false,
                tiles: [[]]
            }, props), defaultProps);
            if (!this.p.built) {
            	this.spriteSheet = false;
            	this.operations = [];
        	}
        },
        build: function() {
        	this.perform( function() {
        		this.init({built:true, initialized:this.p.initialized, tiles:this.p.tiles, tileW:this.p.tileW, tileH:this.p.tileH, drawBaseTile:this.p.drawBaseTile, id:this.p.id, x:this.p.x, y:this.p.y});
        		graphics.objectResized(this);
        	});
        },
        setStructure: function(data) {
            this.p.tiles = data;
        	if (this.p.built) {
        		// rebuild object
        		this.build();
        	}
        	if (!this.p.initialized && this.spriteSheet !== false) {
        		this.initialized();
        	}
        },
        draw: function(context) {
        	if (this.p.initialized && this.p.built) {
        		this._super(context);
        	}
        },
        sheet: function(img,options) {
            if(!img) {
            	return this.spriteSheet;
        	}
        	this.spriteSheet = new TSpriteSheet(img, options);
        	this.p.tileW = this.spriteSheet.tileW;
        	this.p.tileH = this.spriteSheet.tileH;
        	if (this.p.built) {
        		// rebuild object
        		this.build();
        	}
        	if (!this.p.initialized && this.p.tiles) {
        		this.initialized();
        	}
        },
        perform: function(action, parameters) {
            if (this.p.initialized) {
                action.apply(this, parameters);
            } else {
                this.operations.push([action, parameters]);
            }
        },
        initialized: function() {
            this.p.initialized = true;
            while (this.operations.length > 0) {
                var operation = this.operations.shift();
                operation[0].apply(this, operation[1]);
            }
        },
        setDimensions: function() {
        	this._super();
        },
        setLocation: function(x, y) {
            this.perform(function(x, y) {
            	this.p.x = x;
                this.p.y = y;
            }, [x, y]);
        },
        getLocation: function() {
            return {x: Math.round(this.p.x), y: Math.round(this.p.y)};
        },
        getXCenter: function() {
            return Math.round(this.p.x+this.p.w/2);
        },
        getYCenter: function() {
            return Math.round(this.p.y+this.p.h/2);
        },
        getX: function() {
            return Math.round(this.p.x);
        },
        getY: function() {
            return Math.round(this.p.y);
        },
        setCenterLocation: function(x, y) {
            this.perform(function(x, y) {
                this.p.x = x - this.p.w / 2;
                this.p.y = y - this.p.h / 2;
            }, [x, y]);
        },
        freeze: function(value) {
        },
        drawBaseTile: function(value) {
        	this.p.drawBaseTile = value;
        },
        drawableTile: function(tileNum) {
        	if (!this.p.drawBaseTile) {
        		return tileNum > 0;
        	}
        	return true;
        },
        designDrag: function(touch) {
            if (this.p.designMode) {
                this.p.dragging = true;
                this.p.x = touch.origX + touch.dx;
                this.p.y = touch.origY + touch.dy;
            }
        },
        designTouchEnd: function(touch) {
            if (this.p.designMode) {
                this.p.dragging = false;
                this.p.designCallback(this.p.x - this.p.w / 2, this.p.y - this.p.h / 2);
            }
        },
        getId: function() {
            return this.p.id;
        },
        size: function(force) {
            if(force || (!this.p.w || !this.p.h)) { 
            	this.setDimensions();
            } 
        },
        drawBlock: function(ctx, blockX, blockY) {
        	// Fixed a bug in Quintus(?): startX and startY should not hold references to p.x and p.y
	      var p = this.p,
	          startX = Math.floor(blockX * p.blockW),
	          startY = Math.floor(blockY * p.blockH);
	
	      if(!this.blocks[blockY] || !this.blocks[blockY][blockX]) {
	        this.prerenderBlock(blockX,blockY);
	      }
	
	      if(this.blocks[blockY]  && this.blocks[blockY][blockX]) {
	        ctx.drawImage(this.blocks[blockY][blockX],startX,startY);
	      }
	    },          
    });
    
    /**
     * Set a new tile image. There can be many tiles.
     * Its value in the structure will depend of the moment where it is added :
     * The first time added will have the value "1", the second "2", etc...
     * @param {String} imageName    Image's name used for tiles
     */
    Platform.prototype._addTile = function(imageName) {
        imageName = TUtils.getString(imageName);
        try {
	    	this.tiles.push(imageName);
	    	var asset = TEnvironment.getProjectResource(imageName);
	    	var self = this;
	    	this.resources.add(imageName, asset, function() {
	    		if (self.built) {
	    			// build sheet only if object already built
	    			self.buildSheet();
	    		}
	    	});
        } catch (e) {
            throw new Error(this.getMessage("file not found", name));
        }
    };
    
    /**
     * Set the background image. There is only one base tile.
     * Its value in the structure is 0.
     * @param {String} imageName    Image's name used for background
     */
    Platform.prototype._setBaseTile = function(imageName) {
        imageName = TUtils.getString(imageName);
        try {
	    	this.baseTile = imageName;
	    	var asset = TEnvironment.getProjectResource(imageName);
	    	var self = this;
	    	this.resources.add(imageName, asset, function() {
	        	self.gObject.drawBaseTile(true);
	    		if (self.built) {
	    			// build sheet only if object already built
		        	self.buildSheet();
	    		}
	    	});
        } catch (e) {
            throw new Error(this.getMessage("file not found", name));
        }
    };
    
    /**
     * Add a new row, at the end of the structure.
     * If the row is too short, it is filled with 0.
     * If the row is too long, it is truncated.
     * @param {Number[]} row
     */
    Platform.prototype._addRow = function(row) {
    	row = TUtils.getArray(row);
    	if (this.nbCols === 0 && this.nbRows === 0) {
    		this.nbCols = row.length;
    	}
    	if (row.length < this.nbCols) {
    		// Fill row with 0
    		for (var i = row.length; i< this.nbCols; i++) {
    			row.push(0);
    		}
    	} else if (row.length>this.nbCols) {
    		// truncate row
    		row.splice(this.nbCols, row.length);
    	}
    	this.rows.push(row);
    	this.nbRows++;
    	this.buildStructure();
    };
    
    /**
     * Add a new column, at the end of the structure.
     * If the column is too short, it is filled with 0.
     * If the column is too long, it is truncated.
     * @param {Number[]} row
     */
    Platform.prototype._addColumn = function(col) {
    	col = TUtils.getArray(col);
    	if (this.nbCols === 0 && this.nbRows === 0) {
    		this.nbRows = col.length;
    	}
    	for (var i = 0; i< this.nbRows; i++) {
    		if (i<col.length) {
    			this.rows[i].push(col[i]);
    		} else {
    			this.rows[i].push(0);
    		}
    	}
    	this.nbCols++;
    	this.buildStructure();
    };
    
    /**
     * Create a new structure from a 2D matrix.
     * Each empty tile will be filled with a 0.
     * @param {Number[][]} structure
     */
    Platform.prototype._loadStructure = function(structure) {
    	var newRows = [];
    	//window.console.debug(structure[0]);
    	if (TUtils.checkArray(structure)) {
    		if (!TUtils.checkArray(structure[0])) {
                throw new Error(this.getMessage("structure incorrect"));
    		}
    		//window.console.log("on passe ici");
    		var newNbCols = structure[0].length
    		for (var i=0; i<structure.length; i++) {
    			newRows[i] = [];
    			for (var j = 0; j<newNbCols; j++) {
    				if (j<structure[i].length) {
    					newRows[i][j] = structure[i][j];
    				} else {
    					// row too short: fill with 0
    					newRows[i][j] = 0;
    				}
    			}
    		}
    		this.rows = newRows;
    		this.nbRows = structure.length;
    		this.nbCols = newNbCols;
        	this.buildStructure();
    	} else {
        	//TODO: offer to load structure from file as well (if structure is string)
            throw new Error(this.getMessage("structure incorrect"));
    	}
    };
    
    /**
     * Change the value of the tile [x,y] in structure to the value "number".
     * @param {Number} x
     * @param {Number} y
     * @param {Number} number
     */
    Platform.prototype._setTile = function(x,y,number) {
    	x = TUtils.getInteger(x);
    	y = TUtils.getInteger(y);
    	number = TUtils.getInteger(number);
    	if (x>this.nbCols || x<0) {
            throw new Error(this.getMessage("x value incorrect", x));
    	}
    	if (y>this.nbRows || y<0) {
            throw new Error(this.getMessage("y value incorrect", y));
    	}
    	if (number<0 || number > this.tiles.length+1) {
    		// tile.length+1 to take base block (#0) into account
            throw new Error(this.getMessage("tile number incorrect", number));
    	}
    	this.gObject.setTile(x,y,number);
    };
    
    /**
     * Build Platform.
     */
    Platform.prototype._build = function() {
    	this.gObject.build();
    	this.buildSheet();
    	this.built = true;
    };
    
    /**
     * Loads resources and draws Platform.
     */
    Platform.prototype.buildSheet = function() {
    	if (this.tiles.length===0) {
    		return;
    	}
    	var tile0 = this.resources.get(this.tiles[0]);
    	if (!tile0) {
    		// resource not already loaded: exit
    		return;
    	}
    	var tileW = tile0.width;
    	var tileH = tile0.height;
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = tileW*(this.tiles.length+1);
        canvas.height = tileH;
        if (this.baseTile !== "") {
        	var tile = this.resources.get(this.baseTile);
        	if (!tile) {
        		// resource not already loaded: exit
        		return;
        	}
            ctx.drawImage(tile, 0, 0);
        }
    	for (var i =0; i< this.tiles.length;i++) {
        	var tile = this.resources.get(this.tiles[i]);
        	if (!tile) {
        		// resource not already loaded: exit
        		return;
        	}
            ctx.drawImage(tile, tileW*(i+1), 0);
    	}
        var newImage = new Image();
        var self = this;
        newImage.onload = function() {
        	//self.sheet = newImage;
        	self.gObject.sheet(newImage, {'tileW':tileW, 'tileH':tileH});
        };
        // start loading
        newImage.src = canvas.toDataURL();
    };

    /**
     * Build structure.
     */
    Platform.prototype.buildStructure = function() {
    	this.gObject.setStructure(this.rows);
    };
    
    /**
     * Returns Platform is ready or not.
     * If Platform isn't ready, call callback if defined.
     * @param {function} callback
     * @param {type} arguments
     * @returns {Boolean}
     */
    Platform.prototype.isReady = function(callback, arguments) {
        if (this.gObject.p.initialized) {
            return true;
        } else {
            if (typeof callback !== 'undefined') {
                this.gObject.perform(callback, arguments);
            }
            return false;
        }
    };
    
    /**
     * Delete Platform.
     */
    Platform.prototype.deleteObject = function() {
        var g = TRuntime.getGraphics().getInstance();
        g.stage().removeCollisionLayer(this.gObject);
    	TGraphicalObject.prototype.deleteObject.call(this);
    };
    
    
    return Platform;
});



