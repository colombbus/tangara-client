define(['jquery','TEnvironment', 'TUtils', 'TGraphicalObject'], function($, TEnvironment, TUtils, TGraphicalObject) {
    var Character = function(characterName) {
        window.console.log("Initializing character");
        TGraphicalObject.call(this);
        window.console.log("Character initialized");
        if (typeof(characterName)==='undefined') {
            characterName = "boy";
        } else {
            var simplifiedName = TUtils.removeAccents(characterName);
            characterName = this.getMessage(simplifiedName);
        }
        var leftElement, rightElement;
        this._setLocation(0,0);
        this._loadSkeleton(characterName);
    };

    Character.prototype = new TGraphicalObject();
    Character.prototype.constructor = Character;
    Character.prototype.className = "Character";
    
    var qInstance = TEnvironment.getQuintusInstance();
    
    qInstance.TGraphicalObject.extend("Character", {
        init: function(props,defaultProps) {
            this._super(qInstance._extend({
                destinationX: 0,
                destinationY: 0,
                velocity:200,
                w:0,
                h:0,
                type:TGraphicalObject.TYPE_CHARACTER
            },props),defaultProps);
            this.catchableObjects = new Array();
        },
        step: function(dt) {
            var p = this.p;
            if (!p.dragging && p.initialized) {
              var step = p.velocity*dt; 
              if (p.x < p.destinationX) {
                  p.x = Math.min(p.x+step, p.destinationX); 
              } else if (p.x > p.destinationX) {
                  p.x = Math.max(p.x-step, p.destinationX); 
              }
              if (p.y < p.destinationY) {
                  p.y = Math.min(p.y+step, p.destinationY); 
              } else if (p.y > p.destinationY) {
                  p.y = Math.max(p.y-step, p.destinationY); 
              }
            }
        },
        designDrag: function(touch) {
            for (var i=0; i<this.children.length; i++) {
                this.children[i].stopAnimation();
            }
            if (!this.p.dragging) {
                touch.origX = this.p.x;
                touch.origY = this.p.y;
            }
            this._super(touch);
        },
        designTouchEnd: function(touch) {
            this.p.destinationX = this.p.x;
            this.p.destinationY = this.p.y;
            this._super(touch);
            for (var i=0; i<this.children.length; i++) {
                this.children[i].startAnimation();
            }
        },
        getSideCoordinates: function(side) {
            var element;
            if (side === 'left') {
                element = this.leftElement;
            } else {
                element = this.rightElement;
            }
            return [(element.c.points[0][0]+element.c.points[2][0])/2,(element.c.points[0][1]+element.c.points[2][1])/2];
        },
        setLocation: function(x,y) {
            this._super(x,y);
            this.perform(function(){
                this.p.destinationX = this.p.x;this.p.destinationY = this.p.y;
            }, {});
        },
        setCenterLocation: function(x,y) {
            this._super(x,y);
            this.perform(function(){
                this.p.destinationX = this.p.x;this.p.destinationY = this.p.y;
            }, {});
        },
        mayCatch: function(object, command) {
            this.perform(function(obj, cmd){
                if (typeof this.catchableObjects[obj] === 'undefined') {
                    this.catchableObjects[obj] = new Array();
                }
                if (typeof cmd !== 'undefined') {
                    this.catchableObjects[obj].push(cmd);
                }
                obj.p.type = obj.p.type | TGraphicalObject.TYPE_CATCHABLE;
            },[object, command]);
        }
    });

    qInstance.Sprite.extend("CharacterPart", {
        init: function(props,defaultProps) {
            this._super(qInstance._extend({
                name:"",
                moveUp:true,
                initialized:false,
                rotationSpeed:0.025,
                moving:false,
                initX:0,
                initY:0,
                initAngle:0,
                type:TGraphicalObject.TYPE_CHARACTER,
                collisionMask:qInstance.SPRITE_NONE,
                mayCatch:false
            },props),defaultProps);
            this.add("tween");
        },
        startAnimation: function() {
            this.p.initX = this.p.x;
            this.p.initY = this.p.y;
            this.p.initAngle = this.p.angle;
            this.p.moveUp = true;
            if (this.p.name === "chest" || this.p.name === "tail")  {
              this.breathe();
            }
        },
        breathe: function() {
          var p = this.p;
          switch (p.name) {
            case 'chest' :
              // movement with chest and arms
              if (p.moveUp) {
                  this.animate({y:p.y-3},1, qInstance.Easing.Linear, {callback:this.breathe});
              } else {
                  this.animate({y:p.y+3},1, qInstance.Easing.Linear, {callback:this.breathe});
              }
              if (typeof this.leftArm !== 'undefined') {
                this.leftArm.p.moveUp = p.moveUp;
                this.leftArm.breathe();
              }
              if (typeof this.rightArm !== 'undefined') {
                this.rightArm.p.moveUp = p.moveUp;
                this.rightArm.breathe();
              }
              p.moveUp = !p.moveUp;
              break;
            case 'tail' :
              // movement with only tail
              if (p.moveUp) {
                  this.animate({angle:p.angle+4},1, qInstance.Easing.Linear, {callback:this.breathe});
              } else {
                  this.animate({angle:p.angle-4},1, qInstance.Easing.Linear, {callback:this.breathe});
              }
              p.moveUp = !p.moveUp;
              break;
            case 'rightArm' :
              if (!p.moving) {
                if (p.moveUp) {
                    this.animate({angle:p.angle+4},1, qInstance.Easing.Linear);
                } else {
                    this.animate({angle:p.angle-4},1, qInstance.Easing.Linear);
                }
              }
              break;
            case 'leftArm' :
              if (!p.moving) {
                if (p.moveUp) {
                    this.animate({angle:p.angle-4},1, qInstance.Easing.Linear);
                } else {
                    this.animate({angle:p.angle+4},1, qInstance.Easing.Linear);
                }
              }
              break;
          }
        },
        stopAnimation: function() {
          this.stop();
          this.p.x = this.p.initX;
          this.p.y = this.p.initY;
          this.p.angle = this.p.initAngle;
        },
        raise: function(value) {
          p = this.p;
          p.moving = true;
          this.stopAnimation();
          var duration = Math.abs(value*p.rotationSpeed);
          this.animate({angle:p.angle + value},duration, qInstance.Easing.Linear, {callback:this.stopMoving});
        },
        lower: function(value) {
          p = this.p;
          p.moving = true;
          this.stopAnimation();
          var duration = Math.abs(value*this.p.rotationSpeed);
          this.animate({angle:this.p.angle - value},duration, qInstance.Easing.Linear, {callback:this.stopMoving});
        },
        stopMoving: function() {
            this.p.initAngle=this.p.angle;
            this.p.moving=false;
        },
        step: function(dt) {
            if (this.p.mayCatch)
                this.stage.collide(this, TGraphicalObject.TYPE_CATCHABLE);
        },
        objectEncountered: function(col) {
            var collided = col.obj;
            if (typeof this.container.catchableObjects[collided] !== 'undefined' && ((collided.p.type & TGraphicalObject.TYPE_CATCHABLE) !== 0) ) {
                // we have caught: we cannot catch anymore
                this.p.mayCatch = false;

                // collided object change type
                collided.p.type = collided.p.type & ~TGraphicalObject.TYPE_CATCHABLE;
                collided.owner = this.container;
                collided.ownerSide = this.side;
                // Redefine collided object movement
                collided.step = function() {
                    var coordinates = this.owner.getSideCoordinates(this.ownerSide);
                    this.p.x = coordinates[0];
                    this.p.y = coordinates[1];
                };
                
                // execute commands if any
                var commands = this.container.catchableObjects[collided];
                for (var i=0;i<commands.length;i++) {
                    TEnvironment.execute(commands[i]);
                }
                this.container.catchableObjects[collided] = [];
            }
        }                
    });
    
    Character.prototype.qSprite = qInstance.Character;

    Character.prototype._moveForward = function(value) {
        if (TUtils.checkInteger(value)) {
          this.qObject.p.destinationX+=value;
        }
        return;
    };

    Character.prototype._moveBackward = function(value) {
        if (TUtils.checkInteger(value)) {
          this.qObject.p.destinationX-=value;
        }
        return;
    };
        
    Character.prototype._moveUpward = function(value) {
        if (TUtils.checkInteger(value)) {
          this.qObject.p.destinationY-=value;
        }
        return;
    };

    Character.prototype._moveDownward = function(value) {
        if (TUtils.checkInteger(value)) {
          this.qObject.p.destinationY+=value;
        }
        return;
    };
    
    Character.prototype._stop = function() {
        this.qObject.p.destinationX = this.qObject.p.x;
        this.qObject.p.destinationY = this.qObject.p.y;
        return;
    };
    
    Character.prototype._loadSkeleton = function(name) {
        if (TUtils.checkString(name)) {
          window.console.log("loading skeleton");
          var baseImageUrl = this.getResource(name)+"/";
          var skeletonUrl = baseImageUrl+"skeleton.json";
          window.console.log("Skeleton URL : "+skeletonUrl);
          var parent = this;
          var elements = new Array();
          var assets = new Array();
          $.ajax({
              dataType: "json",
              url: skeletonUrl,
              async: false,
              success: function(data) {
                  $.each( data['skeleton']['element'], function( key, val ) {
                      elements.push(val);
                      assets.push(baseImageUrl+val['image']);
                  });
              }
          }).fail(function(jqxhr, textStatus, error) {
              throw new Error(TUtils.format(parent.getMessage("unknwon skeleton"), name));
          });

          var qObject = this.qObject;
          var qStage = qInstance.stage();
          // destroy previous elements
          for (var i=0; i<qObject.children.length; i++) {
            qObject.children[i].destroy();
          }
          var chest = null;
          var leftArm = null;
          var rightArm = null;
          var character = this;
          qInstance.load(assets,function() {
              // Add elements to character
              for (var i=0; i<elements.length; i++) {
                  var val = elements[i];
                  var element = new qInstance.CharacterPart({asset:baseImageUrl+ val['image'], name:val['name']});
                  // Set center if defined
                  if (typeof val['cx'] !== 'undefined') {
                    element.p.cx = val['cx'];
                  }
                  if (typeof val['cy'] !== 'undefined') {
                    element.p.cy = val['cy'];
                  }
                  // Set elements coordinates (relative to character)
                  element.p.x = val['coordinateX']+element.p.cx;
                  element.p.y = val['coordinateY']+element.p.cy;
                  // Set collision if hand defined
                  if (typeof val['hand'] !== 'undefined') {
                      var hand = val['hand'];
                      element.p.points = [[hand[0][0],hand[0][1]], [hand[0][0],hand[1][1]], [hand[1][0],hand[1][1]], [hand[1][0],hand[0][1]]];
                      // register collision handler
                      element.p.mayCatch = true;
                      element.on("hit", element, "objectEncountered");
                  }
                  qStage.insert(element, qObject);
                  switch(val['name']) {
                    case 'leftArm' : 
                      character.leftElement = element;
                      leftArm = element;
                      element.side = "left";
                      break;
                    case 'rightArm' :
                      character.rightElement = element;
                      rightArm = element;
                      element.side = "right";
                      break;
                    case 'leftLeg' : 
                      character.leftElement = element;
                      element.side = "left";
                      break;
                    case 'rightLeg' :
                      character.rightElement = element;
                      element.side = "right";
                      break;
                    case 'chest' :
                      chest = element;
                      break;
                  }
                  element.startAnimation();
              }
              qObject.leftElement = character.leftElement;
              qObject.rightElement = character.rightElement;
              if (chest !== null) {
                chest.leftArm = leftArm;
                chest.rightArm = rightArm;
              }
              if (!qObject.p.initialized) {
                  qObject.initialized();
              }
          });
        }
    };
        
    Character.prototype._change = function(name) {
        if (TUtils.checkString(name)) {
          var simplifiedName = TUtils.removeAccents(name);
          this._loadSkeleton(this.getMessage(simplifiedName));
        }
    };
    
    Character.prototype._raiseLeftArm = function(value) {
        if (TUtils.checkInteger(value)) {
          this.leftElement.lower(value);
        }
    };

    Character.prototype._raiseRightArm = function(value) {
        if (TUtils.checkInteger(value)) {
          this.rightElement.raise(value);
        }
    };
    
    Character.prototype._lowerLeftArm = function(value) {
        if (TUtils.checkInteger(value)) {
          this.leftElement.raise(value);
        }
    };

    Character.prototype._lowerRightArm = function(value) {
        if (TUtils.checkInteger(value)) {
          this.rightElement.lower(value);
        }
    };
    
    Character.prototype._mayCatch = function(object, command) {   
        var qObject = this.getQObject();
        var catchableQObject = object.getQObject();
        qObject.mayCatch(catchableQObject, command);
    };

    TEnvironment.internationalize(Character, true);

    return Character;
});



