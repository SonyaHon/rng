/*
	All rendering screens are here 
	Each one can be switched and containce
	enter() - functions is called whenever the screen is switched to
	exit() - function is called whenever exiting the current screen
	render(display) - called torender data on this screen to ROT.Display obj
	handleInput(intputType, inputData) - called to proccess inputs inputType: 'keydown' etc.
																   inputData: event object.
 */
Game.renderStats = function(player) {
	
	Game.clearConsole();
	Game.getConsole().drawText(1, 2, vsprintf("HP: %d/%d.", [player.getHp(), player.getMaxHp()]));
	Game.getConsole().drawText(1, 3, vsprintf("ATK: %d.", [player.getAttackValue()]));
	Game.getConsole().drawText(1, 4, vsprintf("DEF: %d.", [player.getDefenceValue()]));
}

Game.renderMessages = function(messages) {
	var message = "";

	if(messages.length > 4) {
		messages.splice(0, 1);
	}

	for(var ms = 0; ms < messages.length; ms++) {
		message += messages[ms];
		message += "\n\n";
	}
	Game.clearMenu();
	Game.getMenu().drawText(1, 2, message);
};

Game.Screen = {}; // Special namespace for screens

/* Starting screen, showed once when entering the game.
   Says to press return to enter the Game.Screen.playScreen.
*/
Game.Screen.startScreen = {
	enter: function() {
		console.log("Entered start screen.");
	},

	exit: function() {
		console.log("Exited start screen.");
		Game.clearMenu();
		Game.clearConsole();
	},

	render: function(display) {

		display.drawText(1, 1, "%c{yellow}Welcome to the RNG.");
		display.drawText(1, 3, "Press [Enter] to continue...");

	},

	handleInput(inputType, inputData) {

		if(inputType === 'keydown') {
			if(inputData.keyCode == ROT.VK_RETURN) {
				Game.switchScreen(Game.Screen.playScreen);
			}
		}

	}
};

/*
	Main playing screen. 
 */
Game.Screen.playScreen = {
	//Some decs for map drawing

	map: null,
	player: null,

	// Setting offset
	move: function(dX, dY) {
		var newX = this._player.getX() + dX;
		var newY = this._player.getY() + dY;
		this._player.tryMove(newX, newY, this._map);
	},

	enter: function() {
		console.log("Entered playing screen.");
		// Starting to generate a map
		console.log("Generating map...");	

		//Creating map

		map = [];
		var mapHeight = 500;
		var mapWidth = 500;

		for(var x = 0; x < mapWidth; x++) {
			map.push([]);
			for(var y = 0; y < mapHeight; y++) {
				map[x].push(Game.Tile.nullTile);
			}
		}

		//Define tiles randomly
		var generator = new ROT.Map.Cellular(mapWidth, mapHeight);
		generator.randomize(0.5);

		for(var i = 0; i < Game.Consts.MapSmotheness; i++) {
			generator.create();
		}

		//Applying generator to the map.

		generator.create(function(x, y, v){
			if(v === 1) {
				map[x][y] = Game.Tile.floorTile;
			} else {
				map[x][y] = Game.Tile.wallTile;
			}
		});
		//creating player 
		console.log("Creating player");
		this._player = new Game.Entity(Game.PlayerTemplate);
		this._map = new Game.Map(map, this._player);
		console.log("Map is ready, Rendering.");
		this._map.getEngine().start();
	},

	exit: function() {
		console.log("Exited playing screen.")
	},

	render: function(display) {

		var screenWidth = Game.getScreenWidth();
		var screenHeight = Game.getScreenHeight();

		var topLeftX = Math.max(0, this._player.getX() - Math.floor(screenWidth / 2));
		topLeftX = Math.min(topLeftX, this._map.getWidth() - screenWidth);

		var topLeftY = Math.max(0, this._player.getY() - Math.floor(screenHeight / 2));
		topLeftY = Math.min(topLeftY, this._map.getHeight() - screenHeight);

		//Render map

		for(var x = topLeftX; x < topLeftX + screenWidth; x++) {
			for(var y = topLeftY; y < topLeftY + screenHeight; y++) {
				var tile = this._map.getTile(x, y);
				display.draw(
					x - topLeftX, 
					y - topLeftY, 
					tile.getChar(),
					tile.getForeground(),
					tile.getBackground());
			}
		}

		//Render enities

		var enities = this._map.getEntities();
		for(var i = 0; i < enities.length; i++) {
			var entity = enities[i];
			if(entity.getX() >= topLeftX && entity.getX() < topLeftX + screenWidth &&
				entity.getY() >= topLeftY && entity.getY() < topLeftY + screenHeight) {
				display.draw(
					entity.getX() - topLeftX,
					entity.getY() - topLeftY,
					entity.getChar(),
					entity.getForeground(),
					entity.getBackground()); 
			}
		}
	},

	handleInput: function(inputType, inputData) {
		if(inputType === 'keydown') {
			switch(inputData.keyCode)  {
				case ROT.VK_LEFT:
					this.move(-1, 0);
					break;
				case ROT.VK_RIGHT:
					this.move(1, 0);
					break;
				case ROT.VK_UP:
					this.move(0, -1);
					break;
				case ROT.VK_DOWN:
					this.move(0, 1);
					break;				
			}
		}

		this._map.getEngine().unlock();
		Game.refresh();
	}
};
/*
	Showed once player is dead.
 */
Game.Screen.loseScreen = {
	enter: function() {
		console.log("Entered lose screen.");		
	},

	exit: function() {
		console.log("Exited lose screen.");
	},

	render: function(display) {

		var message = "YOU ARE DEAD."

		display.drawText(40 - message.length/2, 12, "%c{red}" + message);
	},

	handleInput: function(inputType, inputData) {
		//TODO Restart the game.
	}
};