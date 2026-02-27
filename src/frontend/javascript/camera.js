/**
 * camera.js
 *
 * Minimal 2D camera.
 *
 * In this project the 'world' origin is the center of the canvas.
 * The camera provides a view transform (currently translation only).
 */


const { mat4 } = glMatrix;

export class Camera
{
    /**
     * @param {number} width Canvas width in pixels.
     * @param {number} height Canvas height in pixels.
     */
    constructor(width, height)
    {
        this.projectionViewMatrix = mat4.create();
        this.projection = mat4.create();
        this.view = mat4.create();
        this.width = width;
        this.height = height;
    }

    // function when called updates the camera.
    update()
    {
        this.projection = mat4.ortho(mat4.create(), 0, this.width, this.height, 0, -1, 1);
        this.view = mat4.lookAt(mat4.create(), [0, 0, 1], [0, 0, 0], [0, 1, 0]); // create a lookat matrix with eye position of viewer and target to look at.

        mat4.mul(this.projectionViewMatrix, this.projection, this.view);
    }
} 