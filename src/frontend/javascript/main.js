// Main javascript file, this will be responsible for the webGL render loop as well as calling on the other functions
// in the correct order.

import { Game } from "./game.js"

const game = new Game();
game.initialize().then(() => 
{
    game.Render();
}); // wait for the game to initialize before rendering anything

