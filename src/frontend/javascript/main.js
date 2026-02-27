/**
 * main.js
 *
 * Frontend entry point.
 * - Creates the Engine.
 * - Initializes it.
 * - Starts the render/update loop.
 */

import { Engine } from "./engine.js"

const engine = new Engine();
engine.initialize().then(() => 
{
    engine.draw();
}); // wait for the game to initialize before rendering anything

