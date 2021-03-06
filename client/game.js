window.onload = function() {
    var Game = new Phaser.Game("100%", "100%", Phaser.CANVAS, "", {preload: onPreload, create: onCreate, update: onUpdate});
    var Server;
    
    function TGameWorld() {
        var hexagonWidth = 35;
        var hexagonHeight = 40;
        var gridSizeX = 2 * 16;
        var gridSizeY = 20;
        var columns = [Math.ceil(gridSizeX / 2),Math.floor(gridSizeX / 2)];
        var sectorWidth = hexagonWidth;
        var sectorHeight = hexagonHeight / 4 * 3;
        var gradient = (hexagonHeight / 4) / (hexagonWidth / 2);
        var initialNutrition = 15;
        this.gameLogic = new TGameLogic();
        
        var fieldPosX;
        var fieldPosY;
        
        var actionBarHeight = 128; // must be changed if buttons change
    
        this.GetInitNutrition = function() {
            return initialNutrition;
        }
        
        this.GetHexagonWidth = function () {
            return hexagonWidth;
        };
    
        this.GetHexagonHeight = function () {
            return hexagonHeight;
        };
    
        this.GetGridSizeX = function () {
            return gridSizeX;
        };
    
        this.GetGridSizeY = function () {
            return gridSizeY;
        };
        
        this.GetColumns = function () {
            return columns;
        };
        
        this.GetSectorWidth = function () {
            return sectorWidth;
        };
        
        this.GetSectorHeight = function () {
            return sectorHeight;
        };
        
        this.GetGradient = function () {
            return gradient;
        };
        
        this.IsValidCoordinate = function (posX, posY) {
            return posX >= 0 && posY >= 0 
                    && posY < gridSizeY && posX <= columns[posY % 2] - 1;
        }
        
        this.ColRow2Ind = function(posX, posY) {
            return this.GetGridSizeX() * Math.floor(posY / 2) + 2 * posX + (posY%2);
        };

        this.Init = function () {
    		Game.stage.backgroundColor = "#B3E5FC";

            fieldPosX = (Game.width - this.GetHexagonWidth() * Math.ceil(this.GetGridSizeX() / 2)) / 2;
       	    if (this.GetGridSizeX() % 2 === 0) {
        	   fieldPosX -= this.GetHexagonWidth() / 4;
            }
            
            fieldPosY = (Game.height - Math.ceil(this.GetGridSizeY() / 2) * this.GetHexagonHeight() - Math.floor(this.GetGridSizeY() / 2)*this.GetHexagonHeight()/2)/2;
            if (GameWorld.GetGridSizeY() % 2 === 0) {
        	   fieldPosY -= this.GetHexagonHeight() / 8;
            }
            
            Game.world.setBounds(0, -50, Game.width, Game.height + 228); // constants should be fit for size of field that we need
            Game.camera.y += 60;
        }
        
        
        this.GetFieldX = function () {
            return fieldPosX;
        };
        
        this.GetFieldY = function () {
            return fieldPosY;
        };
        
        this.GetFieldSizeX = function () {
            var sizeX = this.GetHexagonWidth() * Math.ceil(this.GetGridSizeX() / 2);
            if (this.GetGridSizeX() % 2 === 0) {
        	   sizeX += this.GetHexagonWidth() / 2;
            }
            return sizeX;
        };
        
        this.GetActionBarHeight = function () {
            return actionBarHeight;
        };
                
        this.FindHex = function () {
            var candidateX = Math.floor((Game.input.worldX - this.GetFieldX()) / this.GetSectorWidth());
            var candidateY = Math.floor((Game.input.worldY- this.GetFieldY()) / this.GetSectorHeight());
            var deltaX = (Game.input.worldX - this.GetFieldX()) % this.GetSectorWidth();
            var deltaY = (Game.input.worldY - this.GetFieldY()) % this.GetSectorHeight(); 
            if(candidateY%2===0){
            	if (deltaY < ((this.GetHexagonHeight() / 4) - deltaX * this.GetGradient())){
                    candidateX--;
                    candidateY--;
                }
                if(deltaY < ((-this.GetHexagonHeight() / 4) + deltaX * this.GetGradient())){
                    candidateY--;
                }
            } else {
                if(deltaX >= this.GetHexagonWidth() / 2){
                    if(deltaY < (this.GetHexagonHeight() / 2 - deltaX * this.GetGradient())){
                	   candidateY--;
                    }
                } else {
                    if(deltaY < deltaX * this.GetGradient()){
                	   candidateY--;
                    } else {
                       candidateX--;
                    }
                }
            }
            return {
                x: candidateX, 
                y: candidateY
            };
        }
        
        this.getSpriteName = function(type, creature) {
            if (type === HexType.EMPTY) {
                return "hexagon";
            } else if (type === HexType.FOREST) {
                return "marker";
            } else if (type === HexType.GRASS) {
                return "marker";
            } else if (type === HexType.CREATURE) {
                assert(creature, "WUT creature");
                if (creature.type === CreatureType.COCOON) {
                    return 'hex_cocoon';
                } else if (creature.type === CreatureType.PLANT) {
                    return 'hex_plant';
                } else if (creature.type === CreatureType.DAEMON) {
                    return 'hex_daemon';
                } else if (creature.type === CreatureType.RHINO) {
                    assert(false, "gemme my sprite now!");
                } else if (creature.type === CreatureType.SPAWN) {
                    return 'hex_spawn';
                } else if (creature.type === CreatureType.SPIDER) {
                    assert(false, "gemme my sprite now!");
                } else if (creature.type === CreatureType.TURTLE) {
                    return 'hex_turtle';
                } else if (creature.type === CreatureType.VECTOR) {
                    return 'hex_vector';
                } else if (creature.type === CreatureType.WASP) {
                    assert(false, "gemme my sprite now!");
                } else  {
                    assert(false, "WUT creature type");
                }
            } else {
                assert(false, "WUT type");
            }
        };
        
        this.GetCreatureActionFuncAndButton = function (creatureAction) {
            if (creatureAction === CreatureAction.FEED) {
                return ['feed', 'button_feed'];
            } else if (creatureAction === CreatureAction.MORPH) {
                return ['morph', 'button_morph'];
            } else if (creatureAction === CreatureAction.REPLICATE) {
                return ['replicate', 'button_replicate'];
            } else if (creatureAction === CreatureAction.SPEC_ABILITY) {
                return ['spec_ability', 'button_spec_ability'];
            } else if (creatureAction === CreatureAction.YIELD) {
                return ['yield', 'button_yield'];
            } else if (creatureAction === CreatureAction.MORPH_VECTOR) {
                return ['morph_vector', 'button_morph_vector'];
            } else if (creatureAction === CreatureAction.MORPH_PLANT) {
                return ['morph_plant', 'button_morph_plant'];
            } else if (creatureAction === CreatureAction.MORPH_SPAWN) {
                return ['morph_spawn', 'button_morph_spawn'];
            } else if (creatureAction === CreatureAction.MORPH_DAEMON) {
                return ['morph_daemon', 'button_morph_daemon'];
            } else if (creatureAction === CreatureAction.MORPH_TURTLE) {
                return ['morph_turtle', 'button_morph_turtle'];
            } else if (creatureAction === CreatureAction.MORPH_RHINO) {
                return ['morph_rhino', 'button_morph_rhino'];
            } else if (creatureAction === CreatureAction.MORPH_WASP) {
                return ['morph_wasp', 'button_morph_wasp'];
            } else if (creatureAction === CreatureAction.MORPH_SPIDER) {
                return ['morph_spider', 'button_morph_spider'];
            } else if (creatureAction === CreatureAction.MORPH_CANCEL) {
                return ['morph_cancel', 'button_morph_cancel'];
            }
            
            return [];
        };
    };
    
    var GameWorld = new TGameWorld();
    
    // int, PlayerType
    function TPlayer(initNutrition, id) {
        this.nutrition = initNutrition;
        this.id = id;
    };
    
    var ActionType = {
        MOVE: 0,
        ATTACK: 1,
        RUNHIT: 2,
        REPLICATE: 3,
        MORPH: 4,
        REFRESH: 5,
        YIELD: 6,
        SPECIAL: 7
    }

    function THexagonField(playerOrder) {
        this.hexagonGroup = Game.add.group();
        this.highlightGroup = Game.add.group();
        this.creatureGroup = Game.add.group();
        this.oppGroup = Game.add.group();
        this.obstaclesGroup = Game.add.group();
        
        this.PlayerId = {};
        this.PlayerId.ME = playerOrder[0];
        this.PlayerId.NOTME = playerOrder[1];
        this.players = Array(2);
        this.players[this.PlayerId.ME] = new TPlayer(GameWorld.GetInitNutrition(), this.PlayerId.ME); 
        this.players[this.PlayerId.NOTME] = new TPlayer(GameWorld.GetInitNutrition(), this.PlayerId.NOTME);
        
        this.GetMe = function() {
            return this.players[this.PlayerId.ME];
        }
        
        this.GetOpp = function() {
            return this.players[this.PlayerId.NOTME];
        }
        
        this.InitGroup = function(groupName) {
            this[groupName].x = GameWorld.GetFieldX();
            this[groupName].y = GameWorld.GetFieldY();    
        };
        
        this.ResetGroup = function(groupName, fieldName) {
            this[groupName].destroy();
            this[groupName] = Game.add.group();
            this.InitGroup(groupName);
            if (fieldName) {
                delete this[fieldName];
                this[fieldName] = [];
            }
        };
        
        for (var groupName of ["hexagonGroup", "highlightGroup", "creatureGroup", 
                               "obstaclesGroup", "oppGroup"]) {
            this.InitGroup(groupName);
        }
        
        this.hexField = [];
        this.creatureField = [];
        var gengrid = function(hexGroup, spriteTag, visible) {
            var totalHexes = Math.floor(GameWorld.GetGridSizeX()/2) * GameWorld.GetGridSizeY();
            var hexes = new Array(totalHexes);
            var arrlen = 0;
            for (var i = 0; i < GameWorld.GetGridSizeY() / 2; i++) {
                for (var j = 0; j < GameWorld.GetGridSizeX(); j++) {
                    if (GameWorld.GetGridSizeY() % 2 === 0 
                            || i + 1 < GameWorld.GetGridSizeY() / 2 
                            || j % 2===0) {
                        var hexagonX = GameWorld.GetHexagonWidth() * j / 2;
                        var hexagonY = GameWorld.GetHexagonHeight() * i * 1.5
                            + (GameWorld.GetHexagonHeight() / 4 * 3) * (j % 2);	
                        var hexagon = Game.add.sprite(hexagonX,hexagonY,spriteTag);
                        hexes[arrlen++] = hexagon;
                        hexagon.visible = visible;
                        hexGroup.add(hexagon);
                    }
                }
            }
            return hexes;
        };
        gengrid(this.hexagonGroup, "hexagon", true);
        this.highHexes = gengrid(this.highlightGroup, "marker", false);
        this.lastHighlight = [];
        for (var _row = 0; _row < GameWorld.GetGridSizeY(); ++_row) {
            for (var _col = 0; _col < GameWorld.GetGridSizeX() / 2; ++_col) {
                this.hexField[_col+":"+_row] = {"row": _row, "col": _col, "objectType": HexType.EMPTY, "creature": null};
            }
        }
        
        this.creaturesDraggable = true;
        this.toggleDraggable = function() {
            for (var creatureSprite of this.creatureGroup.children) {
                if (this.creaturesDraggable) {
                    creatureSprite.input.disableDrag();
                } else {
                    creatureSprite.input.enableDrag();
                }
            }
            this.creaturesDraggable = !this.creaturesDraggable;
        };

        this.Move = function(prevPos, newPos, fieldObject) {
            var units;
            if (prevPos) {
                units = this.creatureField[prevPos[0] + ":" + prevPos[1]];
                ind = units.indexOf(fieldObject);
                units.splice(ind, 1);
            }
            if (newPos) {
                var ind = newPos[0] + ":" + newPos[1];
                if (this.creatureField[ind] === undefined) {
                    this.creatureField[ind] = [];
                }
                units = this.creatureField[ind];
                units.push(fieldObject);
                units.sort((a, b) => {return a.objectType - b.objectType;});
            }
        };
        
        this.Remove = function(fieldObject) {
            fieldObject.marker.destroy();
            this.Move([fieldObject.col, fieldObject.row], null, fieldObject);
        };
        
        this.Add = function (fieldObject) {
            if (fieldObject.objectType == HexType.CREATURE) {
                assert(fieldObject.creature, "missing creature over here");
                if (fieldObject.creature.player === this.PlayerId.ME) {
                    this.creatureGroup.add(fieldObject.marker);
                } else {
                    this.oppGroup.add(fieldObject.marker);
                }
            } else {
                this.obstaclesGroup.add(fieldObject.marker);
            }
            this.Move(null, [0, 0], fieldObject);
        };

        this.GetCreaturesInRadius = function(posX, posY, rad) {
            var neighborHexes = radius_with_blocks(makeColRowPair(posX, posY), rad, []);
            var neighborCreatures = new Array(neighborHexes.length);
            var ncreatures = 0;
            for (var i = 0; i < neighborHexes.length; i++) {
                var x = neighborHexes[i].col;
                var y = neighborHexes[i].row;
                if (GameWorld.IsValidCoordinate(x, y)) {
                    var hex = this.GetAt(x, y);
                    if (hex.objectType === HexType.CREATURE) {
                        neighborCreatures[ncreatures++] = hex;
                    }
                }
            }
            neighborCreatures.splice(ncreatures, neighborHexes.length);
            return neighborCreatures;
        };

        this.Highlight = function(posX, posY, rad) {
            // add obstacles
            this.HighlightOff();
            this.lastHighlight = radius_with_blocks(makeColRowPair(posX, posY), rad, this.GetCreaturesInRadius(posX, posY, rad));
            for (var i = 0; i < this.lastHighlight.length; i++) {
                var x = this.lastHighlight[i].col;
                var y = this.lastHighlight[i].row;
                if (GameWorld.IsValidCoordinate(x, y)) {
                    this.highHexes[GameWorld.ColRow2Ind(x, y)].visible = true;
                }
            }
        };

        this.HighlightOff = function() {
            for (var i = 0; i < this.lastHighlight.length; ++i) {
                var x = this.lastHighlight[i].col;
                var y = this.lastHighlight[i].row;
                if (GameWorld.IsValidCoordinate(x, y)) {
                    this.highHexes[GameWorld.ColRow2Ind(x, y)].visible = false;
                }
                delete this.lastHighlight[i];
            }
            this.lastHighlight = [];
        };

        this.GetAt = function(posX, posY) {
            var key = posX + ":" + posY;
            var units = this.creatureField[key];
            if (units && units.length > 0) {
                return units[0];
            } else {
                return this.hexField[key];
            }
        };
        
        /* The main link between TGameLogic and other code.
            Returns true if everything is all right.
            Writes an error msg to console.
            MOVE:  
                subject is creature, object is hex
            ATTACK:
                subject and object are creatures
            MORPH or REPLICATE:
                subject is creature, args = [target: creature, additional_cost: X]
            REFRESH:
                subject is creature, args = [additional_cost: X]
            YIELD:
                subject is creature, object is bush
            SPECIAL:
                subject is TURTLE :)
        */
        this.DoAction = function(subject, action, object, args) {
            var logic = GameWorld.gameLogic;
            //console.log(HexagonField.creatureField);
            if (action === ActionType.MOVE) {
                var response = logic.Move(subject, object);
                if (response !== undefined && response.error !== undefined) {
                    // something bad happened
                    console.log('ERROR in DoAction.MOVE: ' + response['error']);
                    return false;
                }
                subject.SetNewPosition(object.col, object.row);
                return true;
            } else if (action === ActionType.ATTACK) {
                var response = logic.Attack(subject, object);
                if (response !== undefined && response.error !== undefined) {
                    // something bad happened
                    console.log('ERROR in DoAction.ATTACK: ' + response['error']);
                    return false;
                }
                if (response === undefined || response['landed'] === undefined) {
                    console.log('ERROR in DoAction.ATTACK: Presentation error');
                    return false;
                }
                if (response['landed'] === true && response['death'] !== undefined) {
                    // attack landed
                    if (response.death.obj !== undefined) {
                        // obj is dead
                        if (response.death.subj !== undefined) {
                            // both are dead, nothing happens
                            HexagonField.Remove(subject);
                            HexagonField.Remove(object);
                            return true;
                        }
                        HexagonField.Remove(object);
                        if (subject.creature.type !== CreatureType.WASP || subject.creature.type !== CreatureType.SPIDER) {
                            HexagonField.players[subject.creature.player].nutrition += object.creature.NUT;
                        }
                        return true;
                    } 
                } 
                // attack missed or damage not lethal
                return true;
            } else if (action === ActionType.RUNHIT) {
            } else if (action === ActionType.MORPH) {
                if (args === undefined || args.target === undefined || args.additional_cost === undefined) {
                    console.log('ERROR in DoAction.MORPH: Presentation error');
                    return false;
                }
                
                var response = logic.Morph(subject, args.additional_cost);
                if (response !== undefined && response.error !== undefined) {
                    // something bad happened
                    console.log('ERROR in DoAction.MORPH: ' + response['error']);
                    return false;
                }
                if (HexagonField.players[subject.creature.player].nutrition <= 1) {
                    console.log('Not enough nutrition, need 2 have ' + HexagonField.players[subject.creature.player].nutrition);
                    return false;
                }
                var target;
                if (args.target === 'vector') 
                    target = CreatureType.VECTOR;
                else if (args.target === 'spawn')
                    target = CreatureType.SPAWN;
                else if (args.target === 'daemon')
                    target = CreatureType.DAEMON;
                else if (args.target === 'turtle')
                    target = CreatureType.TURTLE;
                else if (args.target === 'rhino')
                    target = CreatureType.RHINO;
                else if (args.target === 'wasp')
                    target = CreatureType.WASP;
                else if (args.target === 'spider')
                    target = CreatureType.SPIDER;
                HexagonField.Remove(subject);
                
                var creature = newCreature(CreatureType.COCOON, HexagonField.PlayerId.ME);
                creature.init_effect('morph');
                creature.effects['morph'] = {'target': target, 'turns': 3 - args.additional_cost};
                
                var fieldObject = new TFieldObject(HexType.CREATURE, creature);
                fieldObject.SetNewPosition(subject.col, subject.row);
                delete subject;
                
                HexagonField.players[subject.creature.player].nutrition -= 2;
                return true;
            } else if (action === ActionType.REPLICATE) {
                if (args === undefined || args.additional_cost === undefined) {
                    console.log('ERROR in DoAction.REPLICATE: Presentation error');
                    return false;
                }
                var response = logic.Morph(subject, args.additional_cost);
                if (response !== undefined && response.error !== undefined) {
                    // something bad happened
                    console.log('ERROR in DoAction.REPLICATE: ' + response['error']);
                    return false;
                }
                if (HexagonField.players[subject.creature.player].nutrition <= 1) {
                    console.log('Not enough nutrition, need 2 have ' + HexagonField.players[subject.creature.player].nutrition);
                    return false;
                }
                HexagonField.Remove(subject);
                var creature = newCreature(CreatureType.COCOON, HexagonField.PlayerId.ME);
                creature.init_effect('morph');
                creature.effects['morph'] = {'__replicate': true, 'target': subject.creature.type, 'turns': 3 - args.additional_cost};
                
                fieldObject = new TFieldObject(HexType.CREATURE, creature);
                fieldObject.SetNewPosition(subject.col, subject.row);
                delete subject;
                
                HexagonField.players[subject.creature.player].nutrition -= 2;
                return true;
            } else if (action === ActionType.REFRESH) {
                if (true) {
                    if (HexagonField.players[subject.creature.player].nutrition <= 0) {
                        console.log('Not enough nutrition, need 1 have ' + HexagonField.players[subject.creature.player].nutrition);
                        return false;
                    }
                    subject.creature.Refresh();
                    HexagonField.players[subject.creature.player].nutrition -= 1;
                    return true;
                } else {
                    return false;
                }
            } else if (action === ActionType.YIELD) {
                // ADD nutrition
                if (true) { // grass AVAILABLE
                    return true;
                } else {
                    return false;
                }
            } else if (action === ActionType.SPECIAL) {
                var response = logic.Special(subject);
                if (response !== undefined && response['error'] !== undefined) {
                    console.log('ERROR in DoAction.REPLICATE: ' + response['error']);
                    return false;
                }
                return true;
            }

        };
        
        this.getAllObjects = function() {
            var objects = [];
            for (var key in this.creatureField) {
                var objs = this.creatureField[key];
                for (var obj of objs) {
                    objects.push(obj);
                }
            }
            return objects;
        };
        
        this.getMeOpponentCreatures = function() {
            var myCreatures = [];
            var opponentCreatures = [];
            for (var key in this.creatureField) {
                var objs = this.creatureField[key];
                for (var obj of objs) {
                    if (obj.objectType === HexType.CREATURE) {
                        if (obj.creature.player === HexagonField.PlayerId.ME) {
                            myCreatures.push(obj);
                        } else if (obj.creature.player === HexagonField.PlayerId.NOTME) {
                            opponentCreatures.push(obj);
                        }
                    }
                }
            }
            
            return {
                myCreatures: myCreatures,
                opponentCreatures: opponentCreatures
                };
        }
        
        this.Dump2JSON = function() {
            var jsonGameState = {};
            jsonGameState.objects = [];
            for (var obj of this.getAllObjects()) {
                jsonGameState.objects
                    .push({"l": [obj.col, obj.row], "t": obj.objectType, "c": obj.creature});
            }
            jsonGameState.players = this.players;
            return jsonGameState;
        };
        
        this.Load4JSON = function(jsonGameState) {
            this.ResetGroup("creatureGroup", "creatureField");
            this.ResetGroup("obstaclesGroup", null);
            this.ResetGroup("oppGroup", null);
            for (var object of jsonGameState.objects) {
                var obj = new TFieldObject(object.t, copyCreature(object.c));
                obj.SetNewPosition(object.l[0], object.l[1]);
            }
            this.players = jsonGameState.players;
        };
    }
        
    var HexagonField;

    var StateType = {
        TS_NONE: 0,
        TS_SELECTED: 1,
        TS_ACTION: 2,
        TS_OPPONENT_MOVE: 3  
    };

    function updateStatInfo() {
        var creatures = HexagonField.getMeOpponentCreatures();
        StatInfoBar.displayStatInfo(HexagonField.GetMe().nutrition,
                                    HexagonField.GetOpp().nutrition,
                                    creatures.myCreatures.length,
                                    creatures.opponentCreatures.length);    
    };
    
    function TTurnState(weStart) {
        this.state = StateType.TS_NONE;
        this.activeObject = undefined;
        this.action = undefined;
        this.endPosition = undefined;
        
        this._ResetState = function () {
            this.state = StateType.TS_NONE;
            this.activeObject = undefined;
            this.action = undefined;
            this.endPosition = undefined;
            ActionBar.update([]);
        };
        
        this._PassTurn = function(dontSend) {
            this._ResetState();
            this.state = StateType.TS_OPPONENT_MOVE;
            ActionBar.lock();
            updateStatInfo();
            HexagonField.toggleDraggable();
            if (dontSend === true) {
                // I hate js handling of undefined, null and stuff
            } else {
                Server.Send('new-turn', HexagonField.Dump2JSON());
            }
        }
        
        this._ResetState();
        if (!weStart) {
            this._PassTurn(true);
        } else {
            updateStatInfo();
        }
        
        this._CancelMove = function () {
            if (this.activeObject != null) {
                this.state = StateType.TS_SELECTED;
            } else {
                this.state = StateType.TS_NONE;
            }
            this.action = undefined;
            this.endPosition = undefined;
        }
        
        this.SelectField = function (field) {
            if (this.state === StateType.TS_OPPONENT_MOVE) {
                return false;
            }
            
            if (this.state === StateType.TS_NONE || this.state === StateType.TS_SELECTED) {
                this.activeObject = field;
                this.state = StateType.TS_SELECTED;
            } else if (this.state === StateType.TS_ACTION) {
                this.endPosition = field;
                var result = HexagonField.DoAction(this.activeObject, this.action, this.endPosition);
                if (result) {
                    this._ResetState();
                    this._PassTurn();
                } else {
                    this._CancelMove();
                }
                return result;
            } else {
                assert(false, "WUT TurnState");
            }
            return true;
        };
        
        this.SelectAction = function (act) {
            if (this.state === StateType.TS_OPPONENT_MOVE) {
                return false;
            }
            if (this.state === StateType.TS_SELECTED) {
                this.action = act;
                this.state = StateType.TS_ACTION;
                return true;
            } else if (this.state === StateType.TS_ACTION) {
                this.action = act;
                return true;
            } else {
                this._ResetState();
                return false;
            }
        };
        
        this.MyTurn = function () {
            assert(this.state === StateType.TS_OPPONENT_MOVE, "MyTurn() called on my turn");
            HexagonField.toggleDraggable();
            ActionBar.unlock();
            ActionBar.update([]);
            this._ResetState();
            
            var objects = HexagonField.getAllObjects();
            for (var i in objects) {
                if (objects[i].objectType === HexType.CREATURE) {
                    if (objects[i].creature.effects === undefined)
                        continue;
                    
                    // poison
                    if (objects[i].creature.effects['poison'] !== undefined) {
                        objects[i].creature.init_effect('damage');
                        objects[i].creature.effects['damage'] += objects[i].effects['poison'];
                        objects[i].creature.effects['poison'] = undefined;
                    }
                    // carapace
                    if (objects[i].creature.effects['carapace'] !== undefined) {
                        objects[i].creature.effects['carapace'] -= 1;
                        if (objects[i].creature.effects['carapace'] === 0) {
                            objects[i].creature.ATT += 2;
                            objects[i].creature.DEF -= 2;
                            objects[i].creature.effects['carapace'] = undefined;
                        }
                    }
                    // replicate & morph
                    if (objects[i].creature.effects['morph'] !== undefined) {
                        objects[i].creature.effects['morph']['turns'] -= 1;
                        if (objects[i].creature.effects['morph']['turns'] === 0) {
                            // time to evolve!
                            if (objects[i].creature.effects['morph']['__replicate'] === true) {
                                // replicate
                                // remove cocoon
                                HexagonField.Remove(objects[i]);
                                // place first one
                                var creature = newCreature(objects[i].creature.effects['morph']['target'], objects[i].creature.player);
                                var fieldObject = new TFieldObject(HexType.CREATURE, creature);
                                fieldObject.SetNewPosition(objects[i].col, objects[i].row);
                                // find the right place for the second one
                                // forsake if too crowdy
                                var radius1 = radius_with_blocks(makeColRowPair(objects[i].col, objects[i].row), 1, []);
                                for (var j in radius1) {
                                    if (HexagonField.GetAt(radius1[j].col, radius1[j].row).objectType === HexType.EMPTY) {
                                        var creature2 = newCreature(objects[i].creature.effects['morph']['target'], objects[i].creature.player);
                                        var fieldObject2 = new TFieldObject(HexType.CREATURE, creature2);
                                        fieldObject2.SetNewPosition(radius1[j].col, radius1[j].row);
                                        break;
                                    }
                                }
                                // free
                                delete objects[i];
                            } else {
                                // morph
                                // remove cocoon
                                HexagonField.Remove(objects[i]);
                                // place first one
                                var creature = newCreature(objects[i].creature.effects['morph']['target'], objects[i].creature.player);
                                var fieldObject = new TFieldObject(HexType.CREATURE, creature);
                                fieldObject.SetNewPosition(objects[i].col, objects[i].row);
                                // free
                                delete objects[i];
                            }
                        }
                    }
                    
                    // death?
                    if (objects[i] !== undefined && GameWorld.gameLogic.chk_death(objects[i]) !== undefined) {
                        HexagonField.Remove(objects[i]);
                    }
                }
            }
            
            // win?
            
        }
    }
    
    var TurnState;
    
    // string, HexType, TCreature
    function TFieldObject(type, initCreature) {
        var spriteName = GameWorld.getSpriteName(type, initCreature);
        this.marker = Game.add.sprite(0,0,spriteName);
        this.marker.visible = true;
        // row = y, col = x
        this.col = 0;
        this.row = 0;
        this.objectType = type;
        this.creature = initCreature; 
        this.hexActive = null;
        /*if (initCreature) {
            if (initCreature.player === HexagonField.PlayerId.ME) {
                this.hexActive = Game.add.sprite(0,0,'hexagon_me');
                HexagonField.creatureGroup.add(this.hexActive);
            } else if (initCreature.player === 1) {
                this.hexActive = Game.add.sprite(0,0,'hexagon_opponent');
                HexagonField.creatureGroup.add(this.hexActive);
            }
        }*/
        
        this.colrow = function () {
            return [this.col, this.row];
        }
        
        if (this.objectType === HexType.CREATURE && 
            this.creature.player === HexagonField.PlayerId.ME) {
            this.marker.inputEnabled = true;
            this.marker.input.enableDrag();
            this.OnDragStart = function (sprite, pointer) {
                var hex = GameWorld.FindHex(); 
                if (TurnState.SelectField(HexagonField.GetAt(hex.x, hex.y)) === true) {
                    HexagonField.HighlightOff();
                    HexagonField.Highlight(this.col, this.row, this.MoveRange());
                }
            };
            
            this.OnDragStop = function (sprite, pointer) {
                var hex = GameWorld.FindHex(); 
                if (!GameWorld.IsValidCoordinate(hex.x, hex.y)) { // out of field 
                   this.SetNewPosition(this.col, this.row); 
                } else {
                    var target = HexagonField.GetAt(hex.x, hex.y);
                    if (target.objectType === HexType.CREATURE &&
                        TurnState.SelectAction(ActionType.ATTACK) === true && 
                        TurnState.SelectField(target) === true) {
                        this.SetNewPosition(this.col, this.row);
                    } else if (TurnState.SelectAction(ActionType.MOVE) === true &&
                               TurnState.SelectField(target) === true) {
                        // moved as side-effect
                    } else {
                        this.SetNewPosition(this.col, this.row);          
                    }
                    TurnState.SelectField(this);
                }
                
                HexagonField.HighlightOff();
            };
            
            this.marker.events.onDragStart.add(this.OnDragStart, this);
            this.marker.events.onDragStop.add(this.OnDragStop, this);
        }

		this.marker.anchor.setTo(0.5);
		this.marker.visible = false;
		HexagonField.Add(this);
        
        this.SetNewPosition = function (posX, posY) {
            HexagonField.Move([this.col, this.row], [posX, posY], this);
            this.row = posY;
            this.col = posX;
            if (!GameWorld.IsValidCoordinate(posX, posY)) {
                this.marker.visible = false;
                if (this.hexActive) {
                    this.hexActive.visible = false;
                }
		    } else {
                this.marker.visible = true;
                if (this.hexActive) {
                    this.hexActive.visible = true;
                }
                
                var newX = GameWorld.GetHexagonWidth() * posX + GameWorld.GetHexagonWidth()/ 2 + (GameWorld.GetHexagonWidth() / 2) * (posY % 2);
                var newY = 0.75 * GameWorld.GetHexagonHeight() * posY + GameWorld.GetHexagonHeight() / 2;
                
                if (this.hexActive) {
                    this.hexActive.x = newX - 16;
                    this.hexActive.y = newY - 20;
                }
                
                this.marker.x = newX;
				this.marker.y = newY;
            }
            
            return this;
        };
        
        this.GetCreaturesInRadius = function (radius) {
            return HexagonField.GetCreaturesInRadius(this.col, this.row, radius);
        }
        
        this.MoveRange = function () {
            if (this.objectType !== HexType.CREATURE || this.creature == null)
                return 0;
            if (this.creature.type === CreatureType.PLANT || this.creature.type === CreatureType.COCOON)
                return 0;
            var neigh = this.GetCreaturesInRadius(1);
            for (var cr in neigh) {
                if (neigh[cr] === this)
                    continue;
                if (neigh[cr].creature.type === CreatureType.TURTLE) {
                    return 1;
                }
            }
            if (this.creature.type === CreatureType.SPAWN) {
                return 4;
            }
            return 2;
        }
    }
    
    var ActionBar = new TActionBar(Game, GameWorld, AlertManager, 128);
    
    var InfoBar = new TInfoBar(Game, GameWorld);
    var StatInfoBar = new TStatInfoBar(Game, GameWorld);
    
    function mouseDownCallback(e) {
        if (Game.input.y <= window.innerHeight - GameWorld.GetActionBarHeight()) { 
            var hex = GameWorld.FindHex(); 
            var activeField = HexagonField.GetAt(hex.x, hex.y);
            InfoBar.displayInfoCreature(activeField.creature);
            if (activeField.objectType !== HexType.CREATURE ||
                activeField.creature.player !== HexagonField.PlayerId.ME) {
                ActionBar.update([]);    
            } else {
                ActionBar.update(getCreatureActions(activeField.creature));
            }
            TurnState.SelectField(HexagonField.GetAt(hex.x, hex.y));
                //Creature.SetNewPosition(hex.x, hex.y);
        } else { // else we click on the action bar
                
        }
    }
    
	function onPreload() {
        Game.load.image('bubble', 'arts/bubble.png');
		Game.load.image("hexagon", "arts/hexagon.png");
        Game.load.image("hexagon_me", "arts/hexagon_me.png");
        Game.load.image("hexagon_opponent", "arts/hexagon_opponent.png");
		Game.load.image("marker", "arts/marker.png");
        Game.load.spritesheet('button_replicate', 'arts/buttons/button_replicate_spritesheet.png', 128, 128);
        Game.load.spritesheet('button_spec_ability', 'arts/buttons/button_spec_ability_spritesheet.png', 128, 128);
        Game.load.spritesheet('button_feed', 'arts/buttons/button_feed_spritesheet.png', 128, 128);
        Game.load.spritesheet('button_morph', 'arts/buttons/button_morph_spritesheet.png', 128, 128);
        Game.load.spritesheet('button_yield', 'arts/buttons/button_yield_spritesheet.png', 128, 128);
        Game.load.image('button_morph_vector', 'arts/button_size/amoeba1.png');
        Game.load.image('button_morph_cocoon', 'arts/button_size/amoeba2.png');
        Game.load.image('button_morph_plant', 'arts/button_size/amoeba3.png');
        Game.load.image('button_morph_spawn', 'arts/button_size/amoeba4.png');
        Game.load.image('button_morph_daemon', 'arts/button_size/amoeba5.png');
        Game.load.image('button_morph_turtle', 'arts/button_size/amoeba6.png');
        Game.load.image('button_morph_rhino', 'arts/button_size/amoeba7.png');
        Game.load.image('button_morph_wasp', 'arts/button_size/amoeba8.png');
        Game.load.image('button_morph_spider', 'arts/button_size/amoeba9.png');
        Game.load.image('button_morph_cancel', 'arts/button_size/cancel.png');
        Game.load.image('hex_vector', 'arts/small/amoeba.png');
        Game.load.image('hex_cocoon', 'arts/small/amoeba2.png');
        Game.load.image('hex_plant', 'arts/small/amoeba3.png');
        Game.load.image('hex_spawn', 'arts/small/amoeba4.png');
        Game.load.image('hex_daemon', 'arts/small/amoeba5.png');
        Game.load.image('hex_turtle', 'arts/small/amoeba6.png');
	}
    
    function AlertManager (id) {
        
        if (id === 'feed') {
            if (HexagonField.DoAction(TurnState.activeObject, ActionType.REFRESH)) {
                TurnState._PassTurn();
            }
        } else if (id === 'morph') {
            ActionBar.update(getMorphList());
        } else if (id === 'replicate') {
            if (HexagonField.DoAction(TurnState.activeObject, ActionType.REPLICATE, undefined, {'additional_cost': 0})) {
                TurnState._PassTurn();
            }
        } else if (id === 'yield') {
            if (HexagonField.DoAction(TurnState.activeObject, ActionType.YIELD)) {
                TurnState._PassTurn();
            }
        } else if (id === 'spec_ability') {
            if (!HexagonField.DoAction(TurnState.activeObject, ActionType.SPECIAL)) {
                console.log('spec ability is used already');
            } else {
                TurnState._PassTurn();
            }
        } else if (id === 'morph_cancel') {
            if (ActionBar.update(getCreatureActions(TurnState.activeObject.creature))) {
                TurnState._PassTurn();
            }
        } else if (id.substring(0, 6) == 'morph_') {
            var target = id.substring(6);
            if (HexagonField.DoAction(TurnState.activeObject, ActionType.MORPH, undefined, {'target': target, 'additional_cost': 0})) {
                ActionBar.update([]);
                TurnState._PassTurn();
            }
        } else {
            console.log('ERROR: something other has been clickd, id=' + id);
        }
        //ActionBar.update(getCreatureActions(TurnState.activeObject.creature));
    }
    
    function InitMockCreatures() {
        var RealCreature = newCreature(CreatureType.TURTLE, HexagonField.PlayerId.NOTME);
        var Creature = new TFieldObject(HexType.CREATURE, RealCreature);
        Creature.SetNewPosition(10, 11);
        
        var RealCreature2 = newCreature(CreatureType.SPAWN, HexagonField.PlayerId.ME);
        var Creature2 = new TFieldObject(HexType.CREATURE, RealCreature2);
        Creature2.SetNewPosition(12, 12);
        
        var RealCreature3 = newCreature(CreatureType.DAEMON, HexagonField.PlayerId.ME);
        Creature2 = new TFieldObject(HexType.CREATURE, RealCreature3);
        Creature2.SetNewPosition(12, 14);
    };
    
    function genHex(pos, hexType, creatureType, player) {
        var creature = null;
        if (hexType === HexType.CREATURE) {
            if (player === undefined) {
                player = 2;
            }
            creature = newCreature(creatureType, player);
        };
        var hex = new TFieldObject(hexType, creature);
        hex.SetNewPosition(pos[0], pos[1]);
    };
    
    function InitBattleground() {
        var grass = [[17,12],[0,7],[1,8],[2,8],[2,7],[2,6],[1,6],[1,10],[0,11],[1,12],[2,12],[2,11],[2,10],
                     [13,11],[14,11],[15,10],[14,9],[13,9],[13,10],[13,7],[14,7],[15,6],[14,5],[13,5],[13,6]];
        var forest = [[1,8],[1,12],[14,12],[14,8]];
        var neutrals = [[6,8],[6,9],[7,9],[8,8],[7,7],[6,7],[6,11],[6,12],[6,13],[7,13],[8,12],[7,11]];
        var playerOne = [[7,0],[6,1],[7,2],[8,2],[8,1],[8,0]];
        var playerTwo = [[7,18],[6,17],[7,16],[8,16],[8,17],[8,18]];
        for (var pos of grass) {
            genHex(pos, HexType.GRASS);
        }
        for (var pos of forest) {
            genHex(pos, HexType.FOREST);
        }
        for (var pos of neutrals) {
            genHex(pos, HexType.CREATURE, CreatureType.VECTOR);
        }
        for (var pos of playerOne) {
            genHex(pos, HexType.CREATURE, CreatureType.VECTOR, 0);
        }
        for (var pos of playerTwo) {
            genHex(pos, HexType.CREATURE, CreatureType.VECTOR, 1);
        }
    };
    
    function InitGame(order, creaturesInit) {
        hideLoading();
        HexagonField = new THexagonField(order);
        creaturesInit();
        ActionBar.create([]);
        InfoBar.create("");
        StatInfoBar.create("");        
        Game.input.mouse.mouseDownCallback = mouseDownCallback;
        TurnState = new TTurnState(order[0] === 0);
    };
    
    function TServer() {
        var socket = io.connect();
        var myserv = this;
        
        this.Send = function(mtype, mdata) {
            socket.emit(mtype, mdata);
        };
        
        socket.on('found-opp', function(data) {
            var order = data.order;
            InitGame(order, InitBattleground);
            Game.input.keyboard.onDownCallback = function(key) {
                if (key.keyCode == Phaser.Keyboard.SPACEBAR) {
                    myserv.Send('manual-field-send', HexagonField.Dump2JSON());
                }
            };
        });
        
        socket.on('disconnect', function() {
            loading("Sorry, your opponent has disconnected...", "down");
            TurnState._PassTurn();
        });
        socket.on('new-turn', function(data) {
            assert(TurnState.state === StateType.TS_OPPONENT_MOVE, "Received new-turn during my turn");
            HexagonField.Load4JSON(data);
            TurnState.MyTurn();
        });
    };
    
    function TServerMock() {
        this.Send = function(mtype, mdata) {
            return true;
        };
        
        var order = [0, 1];
        InitGame(order, InitBattleground);
        Game.input.keyboard.onDownCallback = function(key) {
            if (key.keyCode === Phaser.Keyboard.ONE) {
                TurnState.MyTurn();
            }
        };
    };

    var emitter;
    var loadingText;

    function hideLoading() {
        emitter.destroy();
        loadingText.destroy();    
    }

    function loading (text, direction) {
        var emitterY = Game.world.height;
        var gravity = -500;
        var color = "#0288D1";
        if (direction === 'down') {
            emitterY = 0;
            gravity = 500;
            color = "#01579B";
        }
        emitter = Game.add.emitter(Game.world.centerX, emitterY, 200);

        emitter.width = window.innerWidth - 100;

        emitter.makeParticles('bubble');

        emitter.minParticleSpeed.set(0, 100);
        emitter.maxParticleSpeed.set(0, 200);

        emitter.setRotation(0, 0);
        emitter.setAlpha(0.3, 0.8);
        emitter.setScale(0, 0.2, 0, 0.2, 6000, Phaser.Easing.Quintic.Out);
        emitter.gravity = gravity;

        emitter.start(false, 5000, 100);
        
        var style = { font: "32px Comfortaa", fill: color, align: "center"};        
        loadingText = Game.add.text(Game.width / 2, Game.height / 2, text, style);
        loadingText.anchor.set(0.5);
        loadingText.fixedToCamera = true;
    }

	function onCreate() {
        GameWorld.Init();
        loading("Waiting for the opponent...\nTip: you can open the game in other tab and play with yourself :)", "up");
        Server = new TServer();
	}
	
	function onUpdate() {
		var camSpeed = 4;
		
		if (Game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
		    Game.camera.x -= camSpeed;
		} else if (Game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
		    Game.camera.x += camSpeed;
		}

		if (Game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
		    Game.camera.y -= camSpeed;
		} else if (Game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
		    Game.camera.y += camSpeed;
		}
	};
}
