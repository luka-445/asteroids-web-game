/**
 * engine.js
 *
 * game loop
 *
 * Responsibilities:
 * - Creates and initializes subsystems (Renderer, InputManager).
 * - Owns the world state (player, asteroids, projectiles, score, timers).
 * - Runs the per-frame update loop:
 *     1) handle input
 *     2) update entities
 *     3) resolve collisions
 *     4) render
 * - Handles screen resize for full-screen canvas.
 */



import { Renderer } from "./renderer.js"
import { InputManager } from "./inputManager.js";
import { Player } from "./player.js"
import { Asteroid } from "./asteroid.js"
import { Projectile } from "./projectile.js"

export class Engine
{
    /** Creates an Engine instance. Call initialize() before draw(). */
    constructor(){}

    /**
     * Initializes all game systems and prepares the first playable state.
     * This is async because the Renderer compiles shaders and may fetch shader sources.
     */
    async initialize()
    {
        this.inputManager = new InputManager();
        this.inputManager.initialize();

        this.canvas = document.getElementById('canvas');
        this.gl = this.canvas.getContext('webgl2');

        this.renderer = new Renderer(this.gl, this.canvas.width, this.canvas.height);
        await this.renderer.initialize();
        this.resize();
        window.addEventListener("resize", () => this.resize());
        
        // score manager
        this.score = 0;
        this.scoreEl = document.getElementById("score");

        this.timerEl = document.getElementById("timer");

        this.startTime = performance.now();
        this.elapsedSeconds = 0;

        this.player = new Player(this.gl, 0, 0);
        this.playerRadius = 13; // tweak if it doesn't feel right

        this.asteroids = [];
        this.spawnAsteroids(6);
        this.maxAsteroids = 8; // max asteroids allowed
        this.spawnCooldown = 0; // frames until next spawn
        this.spawnInterval = 60; // spawn every 60 frames

        this.projectiles = [];
        this.shootCooldown = 0;
        this.wasSpaceDown = false;

        this.canvas.addEventListener("click", (e) => this.hitAsteroidAtMouse(e));
    }

    /**
     * Main per-frame loop.
     * Uses requestAnimationFrame to schedule the next frame.
     */
    draw()
    {   
        // Rotates the player based on input of 'a' and 'd' keys on the keyboard
        const rotationSpeed = 0.04;
        if (this.inputManager.isKeyDown("a"))
        {
            this.player.rotation -= rotationSpeed;
        }

        if (this.inputManager.isKeyDown("d"))
        {
            this.player.rotation += rotationSpeed;
        }

        // cooldown
        if (this.shootCooldown > 0) this.shootCooldown--;

        // check if spacebar was pressed
        const spaceDown = this.inputManager.isKeyDown(" ") || this.inputManager.isKeyDown("Space");

        if (spaceDown && !this.wasSpaceDown && this.shootCooldown === 0)
        {
            this.shoot();
            this.shootCooldown = 10;
        }
        this.wasSpaceDown = spaceDown;


        // update asteroids
        for (const a of this.asteroids)
        {
            a.update();
            a.wrap(this.canvas.width, this.canvas.height);
        }



        // update projectiles, do this after asteroids, since we want to make sure asteroids are suring correct positions for the current frame.
        for (let p = this.projectiles.length - 1; p >= 0; p--)
        {
            const proj = this.projectiles[p];
            proj.update();

            // if its offscreen then destroy it.
            if (proj.isOffScreen(this.canvas.width, this.canvas.height))
            {
                this.projectiles.splice(p, 1);
                continue;
            }

            // check if we hit an asteroid
            for (let a = this.asteroids.length - 1; a >= 0; a--)
            {
                const ast = this.asteroids[a];

                // use the circle hit test algorithm already in asteroids
                if (ast.containsPoint(proj.position[0], proj.position[1]))
                {
                    // remove the projectile
                    this.projectiles.splice(p, 1);

                    if (ast.sizeTier === 3) this.score += 20;
                    else if (ast.sizeTier === 2) this.score += 50;
                    else this.score += 100;

                    // split asteroid and replace it
                    const children = ast.split();
                    this.asteroids.splice(a, 1);
                    this.asteroids.push(...children);

                    break; // projectile is gone, no need to keep checking for asteroid collision.
                }
            }
        }


        // continuous spawning for asteroids
        if (this.spawnCooldown > 0) this.spawnCooldown--;

        const bigCount = this.countBigAsteroids();
        if (bigCount < this.maxAsteroids && this.spawnCooldown == 0)
        {
            this.spawnOneBigAsteroid();
            this.spawnCooldown = this.spawnInterval;
        }
        
        // render
        this.renderer.begin();
        // draw player
        this.renderer.draw(Player.vertices(), [0, 0], 1.0, this.player.rotation);

        // draw projectiles
        for (const proj of this.projectiles)
        {
            this.renderer.draw(Projectile.vertices(), proj.position, 1.0, 0.0);
        }

        // draw asteroids
        for (const a of this.asteroids)
        {
            this.renderer.draw(a.vertices(), a.position, a.getScale(), a.rotation);
        }

        this.renderer.end();

        // decided to move it after the rendering because it felt like nothing was hitting the ship, but in actual we just werent redrawing the new asteroid positions
        // before checking for collision
        if (this.checkPlayerCollision())
        {   
            // compute final time at collision
            const now = performance.now();
            const finalTimeSeconds = Math.floor((now - this.startTime) / 1000);

            // store results for the game over screen
            localStorage.setItem("finalScore", String(this.score));
            localStorage.setItem("finalTime", String(finalTimeSeconds));

            // go to game over screen
            window.location.href = "game-over-screen.html";
            return; // stops the game loop
        }

        // updates score
        if (this.scoreEl) this.scoreEl.textContent = `Score: ${this.score}`;


        // updates timer
        const now = performance.now();
        this.elapsedSeconds = Math.floor((now - this.startTime) / 1000);

        const minutes = Math.floor(this.elapsedSeconds / 60);
        const seconds = this.elapsedSeconds % 60;

        if (this.timerEl)
        {
            this.timerEl.textContent = `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2,'0')}`;
        }

        window.requestAnimationFrame(() => this.draw()); // game loop
    }

    /**
     * Spawns N BIG asteroids (tier 3) along the screen edges.
     * Medium/small asteroids are only created via splitting.
     */
    spawnAsteroids(count)
    {
        for (let k = 0; k < count; k++)
        {
            const side = Math.floor(Math.random() * 4);
            const halfWidth = this.canvas.width * 0.5;
            const halfHeight = this.canvas.height * 0.5;

            let x = 0;
            let y = 0;

            if (side === 0)
            {
                // left
                x = -halfWidth;
                y = (Math.random() * 2 - 1) * halfHeight; 
            }
            else if (side === 1)
            {
                // right
                x = halfWidth;
                y = (Math.random() * 2 - 1) * halfHeight;
            }
            else if (side === 2)
            {
                // bottom
                x = (Math.random() * 2 - 1) * halfWidth;
                y = - halfHeight;
            }
            else if (side === 3)
            {
                // top
                x = (Math.random() * 2 - 1) * halfWidth;
                y = halfHeight;
            }

            this.asteroids.push(new Asteroid(x, y, 3));
        }
    }

    // used for Testing if asteroids split properly when pressed.
    hitAsteroidAtMouse(e)
    {
        // convert mouse screen to world
        const rect = this.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        const wx = mx - this.canvas.width * 0.5;
        const wy = my - this.canvas.height * 0.5;

        for (let i = 0; i < this.asteroids.length; i++)
        {
            const a = this.asteroids[i];
            if (a.containsPoint(wx, wy))
            {
                // remove it and add children
                const children = a.split();
                this.asteroids.splice(i, 1);
                this.asteroids.push(...children);
                return;
            }
        }
    }

    /**
     * Spawns a projectile in front of the player ship.
     * Projectile direction is taken from the player's forward vector (ship tip).
     */
    shoot()
    {
        const theta = this.player.rotation;

        // forward direction = rotated (0, -1)
        const fx = Math.sin(theta);
        const fy = -Math.cos(theta);

        const projectileSpeed = 6.0; // this can be tweaked to go faster or slower
        const muzzleDistance = 30.0; // spawns projectile in front of ship

        const px = fx * muzzleDistance;
        const py = fy * muzzleDistance;

        const vx = fx * projectileSpeed;
        const vy = fy * projectileSpeed;

        this.projectiles.push(new Projectile(px, py, vx, vy));
    }

    // A function to spawn asteroids in wave, no longer used since its been changed to have asteroids spawn continuously rather than in waves. still good to keep in case
    // we want to use in the future
    startNextWave()
    {
        const count = this.asteroidsPerWave + (this.wave - 1) * 2; // + 2 each wave
        this.spawnAsteroids(count);
        this.wave++;
    }

    /**
     * Checks if any asteroid collision circle overlaps the player collision circle.
     * @returns {boolean} true if player is hit.
     */
    checkPlayerCollision()
    {
        // player world position
        const px = 0;
        const py = 0;

        for (const ast of this.asteroids)
        {
            const dx = ast.position[0] - px;
            const dy = ast.position[1] - py;

            const r = ast.radius + this.playerRadius;
            if (dx * dx + dy * dy <= r * r)
            {
                return true;
            }
        }

        return false;
    }

    /**
     * Resizes the canvas + WebGL viewport to match the browser window.
     * Also updates renderer/camera dimensions so world to screen math remains correct.
     */
    resize()
    {
        const dpr = window.devicePixelRatio || 1;

        const displayWidth = Math.floor(window.innerWidth * dpr);
        const displayHeight = Math.floor(window.innerHeight * dpr);
        
        if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight)
        {
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;

            this.gl.viewport(0, 0, displayWidth, displayHeight);

            this.renderer.width = displayWidth;
            this.renderer.height = displayHeight;
            this.renderer.canvasCenterX = displayWidth * 0.5;
            this.renderer.canvasCenterY = displayHeight * 0.5;

            this.renderer.camera.width = displayWidth;
            this.renderer.camera.height = displayHeight;


        }
    }

    // Convenience helper: spawns one big asteroid (tier 3). 
    spawnOneBigAsteroid()
    {
        this.spawnAsteroids(1);
    }

    // Counts only tier-3 asteroids (big ones) for continuous spawning.
    countBigAsteroids()
    {
        let count = 0;
        for (const a of this.asteroids)
        {
            if (a.sizeTier === 3) count++;
        }
        return count;
    }
}