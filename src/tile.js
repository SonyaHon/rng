/*
	Each cell in the display is a tile.
	Use to draw things on the display.
 */

Game.Tile = function(props) {
	props = props || {};
	Game.Glyph.call(this, props);
	this._isWalkable = props['isWalkable'] || false;
	this._isDiggable = props['isDiggable'] || false;
};

Game.Tile.extend(Game.Glyph);

Game.Tile.prototype.isWalkable = function() {
	return this._isWalkable;
};

Game.Tile.prototype.isDiggable = function() {
	return this._isDiggable;
}
	
// Some types of tiles here 
// Null tile 
Game.Tile.nullTile = new Game.Tile({});

//Floor tile
Game.Tile.floorTile = new Game.Tile({
	character: '.',
	isWalkable: true
});

//Wall tile
Game.Tile.wallTile = new Game.Tile({
	character: '#',
	foreground: 'goldenrod',
	isDiggable: true
});

//Stairs tiles

Game.Tile.stairsUp = new Game.Tile({
	character: '<',
	isWalkable: true
});

Game.Tile.stairsDown = new Game.Tile({
	character: '>',
	isWalkable: true
});