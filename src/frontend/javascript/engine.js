/**engine.js, this is the game engine that will run all other operations */


import { Renderer } from "./renderer.js"

export class Engine
{
    constructor(){}

    async initialize()
    {
        this.canvas = document.getElementById('canvas');
        this.gl = this.canvas.getContext('webgl2');

        this.renderer = new Renderer(this.gl, this.canvas.width, this.canvas.height);
        await this.renderer.initialize();
    }

    draw()
    {
        this.renderer.begin();
        this.renderer.draw();
        this.renderer.end();

        window.requestAnimationFrame(() => this.draw()); // game loop
    }
}