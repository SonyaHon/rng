/*
	Glyph is a one char of the display wich consists of character, foreground and background
	This is a helping obj, dont change or use it by yourself.
	See tile.js instead.
 */

Game.Glyph = function(props) {
	props = props || {};
	this._character = props['character'] || ' ';
	this._foreground = props['foreground'] || 'white';
	this._background = props['background'] || 'black';
};

// Some standart getters

Game.Glyph.prototype.getChar = function() {
	return this._character;
};

Game.Glyph.prototype.getForeground = function() {
	return this._foreground;
};

Game.Glyph.prototype.getBackground = function() {
	return this._background;
};