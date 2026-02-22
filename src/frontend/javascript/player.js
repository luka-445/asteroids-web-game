const { mat4, vec2, vec3 } = glMatrix;


export class Player 
{
    /**
     *  Construct a player ship and draw the model at the given coordinate (x, y).
     * @param gl - WebGL rendering context
     * @param x - the x coordinate 
     * @param y - the y coordinate
     */
    constructor(gl, width, height)
    {
        this.position = {x, y};
        this.rotation = 0;
    }

    static vertices()
    {
        return [
      // x,    y,   r, g, b
         0,   -40,   1, 1, 1,
        -12, -10,   1, 1, 1,
         12, -10,   1, 1, 1,
        ]
    }

    static indices()
    {
        return [0, 1, 2];
    }
}