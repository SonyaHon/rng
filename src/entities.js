/*
	Here are some rdy to use mixins and some entities

 */

Game.Mixins = {};

Game.sendMessage = function(recipient, message, args) {
	if (recipient.hasMixin(Game.Mixins.MessageRecipient)) {
		if (args) {
			message = vsprintf(message, args);
		}
		recipient.recieveMessage(message);
	}
};

Game.Mixins.MobsLvl = {
	name: 'MobsLvl',
	init: function(template) {
		this._lvl = template['lvl'] || 1;
	},
	getLvl: function() {
		return this._lvl;
	}
}

Game.Mixins.Lvl = {
	name: 'Lvl',
	init: function(template) {
		this._lvl = template['lvl'] || 1; //  Points to dist
		this._strength = template['strength'] || this._lvl; // Max hp and mellee attack
		this._agil = template['agil'] || this._lvl; // Deffence and range attack
		this._int = template['int'] || this._lvl; // Casting spells
		this._luck = template['luck'] || this._lvl; // Crit chance
		this._currentExp = 0;
		this._expNeeded = Game.Consts.BASE_LVL_BARRIER * this._lvl;
	},
	plusCurrentExp: function(val) {
		this._currentExp += val;
	},
	getExpNeeded: function() {
		return this._expNeeded;
	},
	getCurrentExp: function() {
		return this._currentExp;
	},
	getInt: function() {
		return this._int;
	},
	getAgil: function() {
		return this._agil;
	},
	getStrength: function() {
		return this._strength;
	},
	getLuck: function() {
		return this._luck;
	},
	getLvl: function() {
		return this._lvl;
	}
};

Game.Mixins.ExpDropper = {
	name: 'ExpDropper',
	init: function() {
		this._expToDrop = Game.Consts.BASE_EXP_DROP * this.getLvl() || 1;
	},
	getExp: function() {
		return this._expToDrop;
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
		if (this._growsRemaining > 0) {
			if (Math.random() <= 0.1) {
				var xOffset = Math.floor(Math.random() * 3) - 1;
				var yOffset = Math.floor(Math.random() * 3) - 1;
				if (xOffset != 0 || yOffset != 0) {
					if (this.getMap().isFloorEmpty(this.getX() + xOffset,
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
		this._defenceValue = template['defenceValue'] || 0;
		if(this.hasMixin('Lvl')) {
			this._maxHp += this.getStrength() * Game.Consts.BASE_MAXHP_COEF;
			this._defenceValue = this.getAgil() * Game.Consts.BASE_DEF_COEF;
		}
		this._hp = template['hp'] || this._maxHp;
	},
	setMaxHp: function(val) {
		this._maxHp = val;
	},
	setHp: function(val) {
		this._hp = val;
	},
	getDefenceValue: function() {
		return this._defenceValue;
	},
	getHp: function() {
		return this._hp;
	},
	getMaxHp: function() {
		return this._maxHp;
	},
	takeDamage: function(attacker, damage) {
		this._hp -= damage;
		if (this._hp <= 0) {
			Game.sendMessage(attacker, 'You killed the %s.', [this.getName()]);
			if(attacker.hasMixin('Lvl') && this.hasMixin('ExpDropper')) {
				attacker.plusCurrentExp(this.getExp());
			}
			this.getMap().removeEntity(this);
		}
	}
};

Game.Mixins.SimpleAttacker = {
	name: 'SimpleAttacker',
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
			var damage = 1 + Math.floor(Math.random() * Math.max(0, attack - defence));

			Game.sendMessage(this, 'You strike the %s for %d.', [target.getName(), damage]);

			Game.sendMessage(target, 'The %s strikes you for %d', [this.getName(), damage]);

			target.takeDamage(this, damage);
		}
	}
};

Game.Mixins.AttackerMellee = {
	name: 'AttackerMellee',
	groupName: 'Attacker',
	init: function(template) {
		this._attackValue = template['attackValue'] || 1;
		this._critChance = this.getLuck() * Game.Consts.BASE_LUCK_CHANCE;
		this._attackValue += this.getStrength() * Game.Consts.BASE_STR_COEF;
	},
	getAttackValue: function() {
		return this._attackValue;
	},
	updateStats: function() {
		this._critChance = this.getLuck() * Game.Consts.BASE_LUCK_CHANCE;
		this._attackValue += this.getStrength() * Game.Consts.BASE_STR_COEF;
	},
	attack: function(target) {
		if (target.hasMixin('Destructible')) {
			var msg = 'strike';
			var baseAtkValue = this.getAttackValue();
			var defence = target.getDefenceValue();
			var attack = baseAtkValue;
			var damage = 1 + Math.floor(Math.random() * Math.max(0, attack - defence));

			if (Math.random() <= this._critChance) {
				attack += baseAtkValue * Game.Consts.CRIT_DAMAGE;
				damage = attack - defence;
				msg = '%c{red}crit%c{white}';
			}

			Game.sendMessage(this, 'You %s the %s for %d.', [msg, target.getName(), damage]);

			Game.sendMessage(target, 'The %s %s you for %d', [this.getName(), msg, damage]);

			target.takeDamage(this, damage);
		}
	}
}

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
	name: '%c{yellow}fungus%c{white}',
	character: 'F',
	foreground: 'green',
	lvl: 10,
	maxHp: 10,
	mixins: [Game.Mixins.FungusActor, Game.Mixins.MobsLvl, Game.Mixins.Destructible, Game.Mixins.ExpDropper]
};

Game.PlayerTemplate = {
	character: '@',
	foreground: 'white',
	background: 'black',
	maxHp: 40,
	attackValue: 10,
	mixins: [Game.Mixins.Moveable, Game.Mixins.PlayerActor, Game.Mixins.Lvl,
		Game.Mixins.AttackerMellee, Game.Mixins.Destructible, Game.Mixins.MessageRecipient
	]
};