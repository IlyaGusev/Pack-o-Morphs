
function Set() {
    this.carry = [];
    this.has = function(obj) {
        for (i = 0; i < this.carry.length; i++) {
            if (this.carry[i].equals(obj))
                return true;
        }
        return false;
    }
    this.add = function (obj) {
        if (!this.has(obj)) {
            this.carry.push(obj);
            return false;
        }
        return true;
    }
}

THex_directions = [
        new THex(+1, -1,  0), new THex(+1,  0, -1), new THex( 0, +1, -1),
        new THex(-1, +1,  0), new THex(-1,  0, +1), new THex( 0, -1, +1)
];

function THex(x, y, z) {
    this.x = parseInt(x);
    this.y = parseInt(y);
    this.z = parseInt(z);
    this.__type__ = "T_hex";

    this.equals = function (another) {
        alert();
        return (this.x == another.x && this.y == another.y && this.z == another.z);
    }
    
    this.from_rowcol = function (col, row) {
        this.x = col - (row - (row&1)) / 2;
        this.z = row;
        this.y = -this.x - this.z;
        return this;
    }
    this.to_rowcol = function () {
        return [this.x + (this.z - (this.z & 1)) / 2, this.z];
    }
    
    this.getx = function () {
        return this.x;
    };
    this.gety = function () {
        return this.y;
    };
    this.getz = function () {
        return this.z;
    };

    this.add = function (hex) {
        return new THex(this.getx() + hex.getx(), this.gety() + hex.gety(), this.getz() + hex.getz());
    };
    
    this.neigh = function(direction) {
        return this.add(THex_directions[direction]);
    };
    
    this.distance = function (another) {
        if (!another || another.__type__ != "T_hex")
            return null;
        return Math.max(Math.abs(this.getx() - another.getx()), Math.abs(this.gety() - another.gety()), Math.abs(this.getz() - another.getz()));
    };
    
    this.radius = function (radius) {
        radius = parseInt(radius);
        if (isNaN(radius)) 
            return null;
        var result = [];
        for (var dx = -radius; dx <= radius; dx++) {
            for (var dy = Math.max(-radius, -radius-dx); dy <= Math.min(radius, radius-dx); dy++) {
                result.push(this.add(new THex(dx, dy, -dx - dy)));
            }
        }
        return result;
    };
    
    this.radius_with_blocks = function (radius, _blocked) {
        var visited = new Set();
        var blocked = new Set();
        blocked.carry = _blocked;
        
        visited.add(this);
        var fringes = []; // who is reachable in k steps
        fringes.push([this]);
    
        for (var k = 1; k <= radius; k++) {
            fringes.push([]);
            for (var i = 0; i < fringes[k-1].length; i++) {
                cube = fringes[k-1][i];
                for (var dir = 0; dir < 6; dir++) {
                    var neighbour = cube.neigh(dir);
                    if (!(visited.has(neighbour)) && !(blocked.has(neighbour))) {
                        visited.add(neighbour);
                        fringes[k].push(neighbour);
                    }
                }
            }
        }
        return visited.carry;
    };
}
