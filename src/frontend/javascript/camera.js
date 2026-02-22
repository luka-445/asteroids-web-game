const { mat4 } = glMatrix;

export class Camera
{
    constructor(width, height)
    {
        this.projectionViewMatrix = mat4.create();
        this.projection = mat4.create();
        this.view = mat4.create();
        this.width = width;
        this.height = height;
    }

    update()
    {
        this.projection = mat4.ortho(mat4.create(), 0, this.width, this.height, 0, -1, 1);
        this.view = mat4.lookAt(mat4.create(), [0, 0, 1], [0, 0, 0], [0, 1, 0]); // create a lookat matrix with eye position of viewer and target to look at.

        mat4.mul(this.projectionViewMatrix, this.projection, this.view);
    }
} 