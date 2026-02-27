/**
 * projectile.js
 *
 * Defines a projectile fired by the player.
 *
 * Projectiles are rendered as a tiny triangle (dot-like).
 * They travel in a straight line and are destroyed once off-screen.
 */


const { vec2 } = glMatrix;

export class Projectile
{
    /**
     * @param {number} x Spawn x in world space.
     * @param {number} y Spawn y in world space.
     * @param {number} vx Velocity x (units per frame).
     * @param {number} vy Velocity y (units per frame).
     */
    constructor(x, y, vx, vy)
    {
        this.position = vec2.fromValues(x, y);
        this.velocity = vec2.fromValues(vx, vy);
    }

    // Moves the projectile forward by one frame.s
    update()
    {
        this.position[0] += this.velocity[0];
        this.position[1] += this.velocity[1];
    }

    // Returns true if projectile is outside the visible view area.
    // Engine uses this to delete projectiles.
    isOffScreen(width, height)
    {
        const halfWidth = width * 0.5;
        const halfHeight = height * 0.5;

        return (this.position[0] < -halfWidth || this.position[0] > halfWidth || this.position[1] < -halfHeight || this.position[1] > halfHeight);
    }

    // Returns the projectile mesh (tiny triangle).
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