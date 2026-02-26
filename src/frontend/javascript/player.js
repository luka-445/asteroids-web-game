const { mat4, vec2 } = glMatrix;


export class Player 
{
    /**
     *  Construct a player ship and draw the model at the given coordinate (x, y).
     * @param gl - WebGL rendering context
     * @param x - the x coordinate 
     * @param y - the y coordinate
     */
    constructor(gl, x, y)
    {
        this.position = {x, y};
        this.rotation = 0;
    }

    // local model vertices
    static vertices()
    {
        // I found a colour in an rgb colour picker with values of 49, 6, 59, to convert to WebGL, since it only goes from 0 to 1 we divide by 255 since its na 8bit integer value
        return [
      // x,    y,    r, g, b
         0,   -40,   49/255, 6/255, 59/255,
        -12, -10,    49/255, 6/255, 59/255,
         12, -10,    49/255, 6/255, 59/255
        ]
    }

    static indices()
    {
        return [0, 1, 2];
    }

    // internal function to draw player using its model transformation matrix.
    draw(renderer)
    {
        renderer.draw();
    }
}