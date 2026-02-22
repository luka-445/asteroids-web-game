const { mat4 } = glMatrix;

export class Player 
{
    /**
     *  Construct a player ship and draw the model.
     * @param x - the x coordinate  
     * @param y - the y coordinate
     */
    constructor(x, y)
    {
        this.position = {x, y};
        this.rotation = 0;
    }
}