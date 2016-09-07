/*
	The base of everithing in the game.
	Use mixins to get certain behavior.
 */

Game.Entity = function(props) {
	props = props || {};
	Game.Glyph.call(this, props);

	this._name = props['name'] || '';
	this._x = props['x'] || 0;
	this._y = props['y'] || 0;

	this._map = null;

	this._attachedMixins = {};
	this._attachedMixinsGroups = {};
	var mixins = props['mixins'] || [];
	for (var i = 0; i < mixins.length; i++) {
		for (var key in mixins[i]) {
			if (key != 'init' && key != 'name' && !this.hasOwnProperty(key)) {
				this[key] = mixins[i][key];
			}
		}
		this._attachedMixins[mixins[i].name] = true;

		if(mixins[i].groupName) {
			this._attachedMixinsGroups[mixins[i].groupName] = true;
		}

		if (mixins[i].init) {
			mixins[i].init.call(this, props);
		}
	}
};

Game.Entity.extend(Game.Glyph);

Game.Entity.prototype.getMap = function() {
	return this._map;
};

Game.Entity.prototype.setMap = function(map) {
	this._map = map;
};

Game.Entity.prototype.hasMixin = function(obj) {
	if (typeof obj === 'object') {
		return this._attachedMixins[obj.name];
	} else {
		return this._attachedMixins[obj] || this._attachedMixinsGroups[obj];
	}
};

Game.Entity.prototype.setName = function(name) {
	this._name = name;
};

Game.Entity.prototype.setX = function(x) {
	this._x = x;
};

Game.Entity.prototype.setY = function(y) {
	this._y = y;
};

Game.Entity.prototype.getName = function() {
	return this._name;
};

Game.Entity.prototype.getX = function() {
	return this._x;
};

Game.Entity.prototype.getY = function() {
	return this._y;
};