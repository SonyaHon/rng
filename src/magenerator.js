/*
	Generates dungeon
 */
Game.generateDungeon = function(height, width) {
	var map = [];
	var mapHeight = height;
	var mapWidth = width;

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
}