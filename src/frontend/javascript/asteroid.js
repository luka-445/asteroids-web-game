const { vec2 } = glMatrix;

export class Asteroid 
{
    // size tier 3 = big, 2 = med, 1 = small
    constructor(x, y, sizeTier = 3)
    {
        this.position = vec2.fromValues(x, y);
        this.sizeTier = sizeTier;

        // set up a random velocity for the asteroid
        const angle = Math.random() * Math.PI * 2;
        const speed = this.getSpeed();
        this.velocity = vec2.fromValues(Math.cos(angle) * speed, Math.sin(angle) * speed);

        this.rotation = Math.random() * Math.PI * 2;
        this.angularVelocity = this.getRotationSpeed();
        
        

        this.radius = this.getRadius(); // for hit collision
    }

    getRadius()
    {
        if (this.sizeTier === 3) return 45;
        if (this.sizeTier === 2) return 25;
        return 15;
    }
    
    getScale()
    {
        if (this.sizeTier === 3) return 1.0;
        if (this.sizeTier === 2) return 0.65;
        return 0.4;
    }

    static baseVertices()
    {
        return [
        //   x,   y,    r, g, b
             0, -40,    1, 1, 1,
            -32, 10,    1, 1, 1,
             28, 18,    1, 1, 1
        ]
    }

    vertices()
    {
        return Asteroid.baseVertices();
    }

    // this wraps the asteroid, so it appears on the other sideo of the canvas if its goes off screen.
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

    // Simple circle hit detection algortihm
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

    getSpeed()
    {
        if (this.sizeTier === 3) return 0.2; // big asteroid
        if (this.sizeTier === 2) return 0.75; // medium
        return 1.0; // small
    }

    getRotationSpeed()
    {
        if (this.sizeTier === 3) return 0.003;
        if (this.sizeTier === 2) return 0.008;
        return 0.015;
    }
}