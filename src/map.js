/*
	Map is an 2 dismentional array of tiles.
 */

Game.Map = function(tiles, player) {
	this._tiles = tiles;

	//Cache the dismentions
	this._width = tiles.length;
	this._height = tiles[0].length;


	this._entities = [];
	this._scheduler = new ROT.Scheduler.Simple();
	this._engine = new ROT.Engine(this._scheduler);

	this.addEntityAtRandomPosition(player);
	for (var i = 0; i < 1000; i++) {
		this.addEntityAtRandomPosition(new Game.Entity(Game.FungusTemplate));
	}

};

//Some getters
Game.Map.prototype.getEngine = function() {
	return this._engine;
};

Game.Map.prototype.getEntities = function() {
	return this._entities;
};

Game.Map.prototype.getEntityAt = function(x, y) {
	for (var i = 0; i < this._entities.length; i++) {
		if (this._entities[i].getX() == x && this._entities[i].getY() == y) {
			return this._entities[i];
		}
	}
	return false;
};

Game.Map.prototype.getHeight = function() {
	return this._height;
};

Game.Map.prototype.getWidth = function() {
	return this._width;
};

// Returns tiles[x][y]
Game.Map.prototype.getTile = function(x, y) {
	// Check if in bounds. If not return nullTile.
	if (x < 0 || x > this._width || y < 0 || y > this._height) {
		return Game.Tile.nullTile;
	} else { // If in bounds return tiles[x][y]
		return this._tiles[x][y] || Game.Tile.nullTile;
	}
};

//Special funcs for tiles

Game.Map.prototype.dig = function(x, y) {
	if (this.getTile(x, y).isDiggable()) {
		this._tiles[x][y] = Game.Tile.floorTile;
	}
};

Game.Map.prototype.getRandomFloorPosition = function() {
	var x, y;
	do {
		x = Math.floor(Math.random() * this._width);
		y = Math.floor(Math.random() * this._height);
	} while (!this.isFloorEmpty(x, y));

	return {
		x: x,
		y: y
	};
};

Game.Map.prototype.addEntity = function(entity) {
	if (entity.getX() < 0 || entity.getY() < 0 ||
		entity.getX() > this._width || entity.getY() > this._height) {
		throw new Error('Adding entity out of bounds.');
	}

	entity.setMap(this);
	this._entities.push(entity);
	if (entity.hasMixin('Actor')) {
		this._scheduler.add(entity, true);
	}
};

Game.Map.prototype.addEntityAtRandomPosition = function(entity) {
	var pos = this.getRandomFloorPosition();
	entity.setX(pos.x);
	entity.setY(pos.y);
	this.addEntity(entity);
};

Game.Map.prototype.removeEntity = function(entity) {
	for (var i = 0; i < this._entities.length; i++) {
		if(entity == this._entities[i]) {
			this._entities.splice(i, 1);
			break;
		}
	}

	if(entity.hasMixin('Actor')) {
		this._scheduler.remove(entity);
	}
};

Game.Map.prototype.isFloorEmpty = function(x, y) {
	if(x > 0 && x < this._width && y > 0 && y < this._height)
		return (this.getTile(x, y) == Game.Tile.floorTile && !this.getEntityAt(x, y));
	else
		return false;
};

Game.Map.prototype.getEntitiesWithRadius = function(centerX, centerY, radius) {

	result = [];
	var leftX = centerX - radius;
	var rightX = centerX + radius;
	var topY = centerY - radius;
	var bottomY = centerY + radius;

	for(var i = 0; i < this._entities.length; i++) {
		if(this._entities[i].getX() >= leftX &&
			this._entities[i].getX() <= rightX &&
			this._entities[i].getY() >= topY &&
			this._entities[i].getY() >= bottomY) {
			result.push(this._entities[i]);
		}
	}

	return result;

};