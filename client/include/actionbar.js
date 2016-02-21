
function TActionBarButtonCallbackFactory(callback) {
    this.get = function(id) {
        return function () {
            callback(id);
        }
    }
}

function TActionBar(Game, GameWorld, callback, buttonWidth) {
    this.borderMargin = 40;
    this.create = function (ids) {
        var n = ids.length;
        var startPosX = Game.width / 2 - buttonWidth * n / 2;
        
        var actionBarHeight = GameWorld.GetActionBarHeight();
        // black rounded rect -- background for buttons
        var graphics = Game.add.graphics(0, 0);
        graphics.beginFill(0x000000, 0.5); 
        var actionBarWidth = Math.max(GameWorld.GetFieldSizeX(), buttonWidth * n + this.borderMargin );
        var actionBarPosX = Math.min(GameWorld.GetFieldX(), startPosX - this.borderMargin / 2);
        var rect = graphics.drawRoundedRect(actionBarPosX, window.innerHeight - actionBarHeight, 
                                            actionBarWidth , actionBarHeight);
        rect.fixedToCamera = true;

        var factory = new TActionBarButtonCallbackFactory(callback);

        for (var i = 0; i < parseInt(n); i++) {
            var posX = startPosX + buttonWidth * i;
            var posY = window.innerHeight - actionBarHeight;
            var button = Game.add.button(posX, posY, ids[i][1], factory.get(ids[i][0]), this);
            button.fixedToCamera = true;
        }
    }
    
    this.update = function (actionList) {
        
    }
}

/*
function AlertManager (id) {
    alert('Clicked on ' + id);
}

*/
/* Usage:

 var actionbar = new ActionBar(0,0, AlertManager, 128);
 actionbar.create([['first','button1'], ['second', 'button2'], ['third', 'button3']]);
*/
