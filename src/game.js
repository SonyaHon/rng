var Game = {
	_display: null, // Main console window
	_console: null, // For stats inventory ect
	_menu: null, // For messages
	_currentScreen: null, // Current rendring screen see screens.js

	_screenWidth: 80, // default display width
	_screenHeight: 24, // default display height

	switchScreen: function(screen) { // Call to switch to screen obj declared in screens.js
		// If we were in screen, call its exit()
		if (this._currentScreen !== null) {
			this._currentScreen.exit();
		}

		// Clear display
		this.getDisplay().clear();

		// Switch to screen, call its enter() and then render()
		this._currentScreen = screen;
		if (this._currentScreen !== null) {
			this._currentScreen.enter();
			this.refresh(); // Going to render in Game._display
		}
	},

	refresh: function() {
		this._display.clear();
		this._currentScreen.render(this._display);
	},

	clearMenu: function() {
		this._menu.clear();
		this._menu.drawText(1, 1, "Log:");
	},

	clearConsole: function() {
		this._console.clear();
		this._console.drawText(1, 1, "Stats:");
	},

	init: function() {
		// Creating display

		var windowHeight = $(window).height();
		var windowWidth = $(window).width();

		//All elems height setup
		var headerHeight = 30;
		$('#header').height(headerHeight);

		windowHeight = Math.floor(Math.floor((windowHeight) / 15) / 10) - (headerHeight / 15) / 10;

		$('#win').height(windowHeight * 10 * 15);
		$('#console').height(windowHeight * 7 * 15);
		$('#menu').height(windowHeight * 3 * 15);

		// All elems width setup
		
		windowWidth = Math.floor(Math.floor(windowWidth / 10) / 10);

		$('#win').width(windowWidth * 8 * 10);

		var consoleWidth = $(window).width() - 30 - $("#win").width();
		$('#console').width(consoleWidth);
		$('#menu').width(consoleWidth);
		//$('#header').width($(window).width() - 10);


		var consoleHeight = $('#console').height() / 15;
		var menuHeight = $('#menu').height() / 15;

		this._screenHeight = $('#win').height() / 15;
		this._screenWidth = $('#win').width() / 10;
		var fontSize = 15;


		/*
				var windowHeight = $(window).height();
				var windowWidth = $(window).width();

				windowHeight = Math.floor(windowHeight / 15);
				windowWidth = Math.floor(windowWidth / 10);

				windowHeight = Math.floor(windowHeight / 10);
				windowWidth = Math.floor(windowWidth / 10);

				$('#win').height(windowHeight * 10 * 15);
				$('#win').width(windowWidth * 8 * 10);

			
				var consoleWidth = $(window).width() - 30 - $("#win").width();
				$("#console").width(consoleWidth);
				$("#console").height(windowHeight * 7 * 15);
				$("#menu").height(windowHeight * 3 * 15);
				$("#menu").width(consoleWidth);

				this._screenHeight = $('#win').height() / 15;
				this._screenWidth = $('#win').width() / 10;
				var fontSize = 15;

				var consoleHeight = $('#console').height() / 15;
				var menuHeight = $("#menu").height() / 15;
		*/
		this._menu = new ROT.Display({
			width: consoleWidth / 10,
			height: menuHeight
		});

		this._console = new ROT.Display({
			width: consoleWidth / 10,
			height: consoleHeight
		});

		this._display = new ROT.Display({
			width: this._screenWidth,
			height: this._screenHeight,
			fontSize: fontSize
		});

		var game = this; // Use game instead of this just not ot lose it
		var bindEventToScreen = function(event) {
			window.addEventListener(event, function(e) {
				// Send an event to screen if there is one.
				if (game._currentScreen !== null) {
					game._currentScreen.handleInput(event, e);
				}
			});
		}

		bindEventToScreen('keydown');
		bindEventToScreen('keyup');
		bindEventToScreen('keypressed');

	},

	// --------------------- Getters here
	getMenu: function() {
		return this._menu;
	},
	getConsole: function() {
		return this._console;
	},
	getDisplay: function() {
		return this._display;
	},
	getScreenHeight: function() {
		return this._screenHeight;
	},
	getScreenWidth: function() {
		return this._screenWidth;
	}
};

window.onload = function() {
	//Check if rot.js is supported.
	if (!ROT.isSupported()) {
		alert("Rot.js lib is not supported in your browser.");
		return;
	} else {
		Game.init();
		document.getElementById("win").appendChild(Game.getDisplay().getContainer());
		document.getElementById("console").appendChild(Game.getConsole().getContainer());
		document.getElementById("menu").appendChild(Game.getMenu().getContainer());
		Game.switchScreen(Game.Screen.startScreen);
	}

};