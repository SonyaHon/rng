/*
	Here are some rdy to use mixins and some entities

 */

Game.Mixins = {};

Game.sendMessage = function(recipient, message, args) {
	if(recipient.hasMixin(Game.Mixins.MessageRecipient)) {
		if(args) {
			message = vsprintf(message, args);
		}
		recipient.recieveMessage(message);
	}
};

Game.Mixins.Moveable = {
	name: 'Moveable',
	tryMove: function(x, y, map) {
		var tile = map.getTile(x, y);
		var target = map.getEntityAt(x, y);

		if (target) {
			if (this.hasMixin('Attacker')) {
				this.attack(target);
				return true;
			}

			return false;
		}

		if (tile.isWalkable()) {
			this._x = x;
			this._y = y;
			return true;
		} else if (tile.isDiggable()) {
			map.dig(x, y);
			return true;
		}

		return false;
	}
};

Game.Mixins.PlayerActor = {
	name: 'PlayerActor',
	groupName: 'Actor',
	act: function() {
		Game.refresh();
		this.getMap().getEngine().lock();
		Game.renderMessages(this.getMessages());
		Game.renderStats(this);
	}
};

Game.Mixins.FungusActor = {
	name: 'FungusActor',
	groupName: 'Actor',
	init: function() {
		this._growsRemaining = 1;
	},
	act: function() {
		if(this._growsRemaining > 0) {
			if(Math.random() <= 0.1) {
				var xOffset = Math.floor(Math.random() * 3) - 1;
				var yOffset = Math.floor(Math.random() * 3) - 1;
				if(xOffset != 0 || yOffset != 0) {
					if(this.getMap().isFloorEmpty(this.getX() + xOffset,
													this.getY() + yOffset)) {
						var entity = new Game.Entity(Game.FungusTemplate);
						entity.setX(this.getX() + xOffset);
						entity.setY(this.getY() + yOffset);
						this.getMap().addEntity(entity);
						this._growsRemaining--;
					}
				} 
			}
		} else {
			this.getMap().removeEntity(this);
		}
	}
};

Game.Mixins.Destructible = {
	name: 'Destructible',
	init: function(template) {
		this._maxHp = template['maxHp'] || 10;
		this._hp = template['hp'] || this._maxHp;
		this._defenceValue = template['defenceValue'] || 0;
	},
	getDefenceValue: function() {
		return this._defenceValue;
	},
	getHp:  function() {
		return this._hp;
	},
	getMaxHp: function() {
		return this._maxHp;
	},
	takeDamage: function(attacker, damage) {
		this._hp -= damage;
		if (this._hp <= 0) {
			Game.sendMessage(attacker, 'You killed the %s.', ["%c{yellow}"+this.getName()  
																			+ "%c{white}"]);
			this.getMap().removeEntity(this);
		}
	}
};

Game.Mixins.Attacker = {
	name: 'Attacker',
	groupName: 'Attacker',
	init: function(template) {
		this._attackValue = template['attackValue'] || 1;
	},
	getAttackValue: function() {
		return this._attackValue;
	},
	attack: function(target) {
		if (target.hasMixin('Destructible')) {
			var attack = this.getAttackValue();
			var defence = target.getDefenceValue();
			var damage = 1 + Math.floor(Math.random() *Math.max(0, attack - defence));

			Game.sendMessage(this, 'You strike the %s for %d.', 
				["%c{yellow}" + target.getName() + "%c{white}", damage]);

			Game.sendMessage(target, 'The %s strikes you for %d', 
				["%c{yellow}" + this.getName() + "%c{white}", damage]);

			target.takeDamage(this, damage);
		}
	}
};

Game.Mixins.MessageRecipient = {
	name: 'MessageRecipient',
	init: function(template) {
		this._messages = [];
	},
	recieveMessage: function(message) {
		this._messages.push(message);
	},
	getMessages: function() {
		return this._messages;
	},
	clearMessages: function() {
		this._messages = [];
	}
};

Game.FungusTemplate = {
	name: 'fungus',
	character: 'F',
	foreground: 'green',
	maxHp: 10,
	mixins: [Game.Mixins.FungusActor, Game.Mixins.Destructible]
};

Game.PlayerTemplate = {
	character: '@',
	foreground: 'white',
	background: 'black',
	maxHp: 40,
	attackValue: 10,
	mixins: [Game.Mixins.Moveable, Game.Mixins.PlayerActor,
		Game.Mixins.Attacker, Game.Mixins.Destructible, Game.Mixins.MessageRecipient]
};