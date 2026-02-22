// Main javascript file, this will be responsible for the webGL render loop as well as calling on the other functions
// in the correct order.

import { Engine } from "./engine.js"

const engine = new Engine();
engine.initialize().then(() => 
{
    engine.draw();
}); // wait for the game to initialize before rendering anything

