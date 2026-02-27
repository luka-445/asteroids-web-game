/**
 * asteroid.js
 *
 * Defines the asteroids shape and the operation that the engine will use to check for collision and drawing.
 *
 */

const { vec2 } = glMatrix;

export class Asteroid 
{
    /**
     * sizeTier meaning:
     * - 3 = big asteroid
     * - 2 = medium asteroid
     * - 1 = small asteroid
     *
     * @param {number} x - initial x position in world space (centered at screen center)
     * @param {number} y - initial y position in world space (centered at screen center)
     * @param {number} sizeTier - asteroid size category (defaults to 3/big)
     */
    constructor(x, y, sizeTier = 3)
    { 
        this.position = vec2.fromValues(x, y); // World-space position of the asteroid (vec2: [x, y])
        this.sizeTier = sizeTier; // Store tier first because getSpeed() / getRotationSpeed() depend on it

        const angle = Math.random() * Math.PI * 2; // Choose a random direction to travel in (angle in radians from 0..2π)
        const speed = this.getSpeed();  // Base movement speed depends on size:
        this.velocity = vec2.fromValues(Math.cos(angle) * speed, Math.sin(angle) * speed); // velocity is measured in "world units per frame"

        this.rotation = Math.random() * Math.PI * 2; // Random starting orientation so asteroids don't all look identical.
        this.angularVelocity = this.getRotationSpeed(); // Angular velocity (radians per frame) based on size
        
        // Radius used for simple circle-based collision tests
        // This is not exact triangle collision — it's an approximation (fast and good enough).
        this.radius = this.getRadius(); 
    }

    /**
     * Returns collision radius for this asteroid tier.
     * Used for:
     * - projectile collision (point vs asteroid circle)
     * - player collision (circle vs circle)
     */
    getRadius()
    {
        if (this.sizeTier === 3) return 45;
        if (this.sizeTier === 2) return 25;
        return 15;
    }
    
    /**
     * Returns draw scale multiplier for this asteroid tier.
     * This allows one base triangle mesh to represent different sizes.
     */
    getScale()
    {
        if (this.sizeTier === 3) return 1.0;
        if (this.sizeTier === 2) return 0.65;
        return 0.4;
    }

    // asteroids base mesh in model space.
    static baseVertices()
    {
        return [
        //   x,   y,    r, g, b
             0, -40,    1, 1, 1,
            -32, 10,    1, 1, 1,
             28, 18,    1, 1, 1
        ]
    }
    // returns vertex array for the asteroids
    vertices()
    {
        return Asteroid.baseVertices();
    }

    /**
     * Screen warpping: If the asteroid leaves one side of the screen it reappears on the opposite side
     * 
     * @param {number} width - canvas width in pixels
     * @param {number} height  - canvas height in pixels
     */
    wrap(width, height)
    {
        const halfWidth = width * 0.5;
        const halfHeight = height * 0.5;

        if (this.position[0] < -halfWidth)
        {
            this.position[0] = halfWidth;
        }
        else if (this.position[0] > halfWidth)
        {
            this.position[0] = -halfWidth;
        }
        else if (this.position[1] < -halfHeight)
        {
            this.position[1] = halfHeight;
        }
        else if (this.position[1] > halfHeight)
        {
            this.position[1] = -halfHeight;
        }
    }

    // moves the asteroid every frame
    update()
    {
        this.position[0] += this.velocity[0];
        this.position[1] += this.velocity[1];
        this.rotation += this.angularVelocity;
    }

    // Simple circle collision detection algortihm
    containsPoint(x, y)
    {
        const dx = x - this.position[0];
        const dy = y - this.position[1];
        return (dx * dx + dy * dy) <= (this.radius * this.radius);
    }

    // breaks the asteroid into smaller ones
    // returns an array of the smaller asteroids
    split()
    {
        if (this.sizeTier <= 1) return []; // return nothing if its the smallest size already.

        const childTier = this.sizeTier - 1;
        const kick = 0.25; // seperation kick, can be tweaked if its too fast or slow

        // get current velocity, so we can separate perpendicular to current direction
        const vx = this.velocity[0];
        const vy = this.velocity[1];

        const a = new Asteroid(this.position[0], this.position[1], childTier);
        const b = new Asteroid(this.position[0], this.position[1], childTier);

        a.velocity[0] += -vy * kick;
        a.velocity[1] += vx * kick;

        b.velocity[0] += vy * kick;
        b.velocity[1] += -vx * kick;

        return [a, b];
    }

    // return the base movement speed of teh asteroid relative to the size
    getSpeed()
    {
        if (this.sizeTier === 3) return 0.2; // big asteroid
        if (this.sizeTier === 2) return 0.75; // medium
        return 1.0; // small
    }

    // return base rotation speed of the asteroid relative to the size
    getRotationSpeed()
    {
        if (this.sizeTier === 3) return 0.003;
        if (this.sizeTier === 2) return 0.008;
        return 0.015;
    }
}