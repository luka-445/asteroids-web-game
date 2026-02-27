/**
 * inputManager.js
 *
 * Captures keyboard input using DOM events.
 *
 * Design:
 * - Maintains a map of key -> boolean (down/up).
 * - Engine queries InputManager each frame to drive gameplay.
 */

export class InputManager
{

    //Creates an empty key state map. 
    constructor()
    {
        this.keyDown = {};
    }

    // Registers DOM event listeners.
    // Call once during Engine initialization.
    initialize()
    {
        window.addEventListener("keydown", e => this.keyDown[e.key] = true);
        window.addEventListener("keyup", e => this.keyDown[e.key] = false);
    }


    /**
     * @param {string} key The exact KeyboardEvent.key to test (e.g., 'a', 'd', ' ').
     * @returns {boolean} true if key is currently pressed.
     */
    isKeyDown(key)
    {
        return this.keyDown[key];
    }

    /**
     * @param {string} key The exact KeyboardEvent.key to test (e.g., 'a', 'd', ' ').
     * @returns {boolean} true if key is no longer pressed.
     */
    isKeyUp(key)
    {
        return !this.keyDown[key];
    }
}