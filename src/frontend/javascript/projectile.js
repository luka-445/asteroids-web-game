const { vec2 } = glMatrix;

export class Projectile
{
    constructor(x, y, vx, vy)
    {
        this.position = vec2.fromValues(x, y);
        this.velocity = vec2.fromValues(vx, vy);
    }

    update()
    {
        this.position[0] += this.velocity[0];
        this.position[1] += this.velocity[1];
    }

    isOffScreen(width, height)
    {
        const halfWidth = width * 0.5;
        const halfHeight = height * 0.5;

        return (this.position[0] < -halfWidth || this.position[0] > halfWidth || this.position[1] < -halfHeight || this.position[1] > halfHeight);
    }

    static vertices()
    {
        return [
          // x,  y,    r, g, b,
             0, -2,    1, 0, 0,
            -2,  2,    1, 0, 0,
             2,  2,    1, 0, 0
        ]
    }
}