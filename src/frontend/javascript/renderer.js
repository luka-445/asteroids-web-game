/**
 * renderer.js
 *
 * WebGL renderer responsible for drawing all game entities.
 *
 * Current design constraints:
 * - Batches objects as TRIANGLES only (3 vertices per instance).
 * - Uses a single dynamic vertex buffer sized for N instances.
 * - Applies per-object transforms (scale/rotation/translation) on CPU when filling buffer.
 */


import { Camera } from "./camera.js"
import { ProgUtils } from "./program-utilities.js"
import { Player } from "./player.js"

const { vec2 } = glMatrix;

const vertexShaderSource = document.getElementById("vertex-shader-2d").textContent;
const fragmentShaderSource = document.getElementById("fragment-shader-2d").textContent;

// Buffer constants
// This is the max allowed number of meshes that can be drawn at one time, for example the player ship is one mesh, and when we add asteroids as well.
// this is useful for batching objects that we want to render, that way we can just create one initial large buffer, and all we need to do is append vertex data (x, y, r,g,b)
// and then we send all of that data to the gpu in on go.
const MAX_MESH_OBJECTS = 1000; 
const NUMBER_OF_VERTEX = 5; // tracks how many vertices in gpu buffer (i.e the x, y, r, g, b) in the interlaced buffer
const BUFFER_SIZE = 3 * NUMBER_OF_VERTEX; // the size of buffer we will need. since for now we are only drawing a single triangle, and a trinagle as 3 vertices, we need 3
const INDICES_PER_SPRITE = 3; // a triangle has 3 vertices, so 3 indices, will need to be refactored when we add asteroids they will require more vertices.


export class Renderer
{
    /**
     * Creates the renderer.
     * @param {WebGLRenderingContext} gl WebGL context.
     * @param {number} width Canvas width in pixels.
     * @param {number} height Canvas height in pixels.
     */
    constructor(gl, width, height)
    {
        this.gl = gl; // WebGl rendering context
        this.width = width; // canvas width
        this.height = height; // canvas height

        this.camera = null; // camera instance
        this.buffer = null; // gpu buffer
        this.elementBuffer = null; // For later use when implementing asteroids.
        this.data = new Float32Array(BUFFER_SIZE * MAX_MESH_OBJECTS); // holds the vertex data to be send into the gpu
        this.program = null; // shader program.
        this.instanceCount = 0; // # of mesh objects currently drawn into the canvas
        this.canvasCenterX = width * 0.5; // Store the coordinates for the center of the canvas
        this.canvasCenterY = height * 0.5;

        this.v0 = vec2.create();
        this.v1 = vec2.create();
        this.v2 = vec2.create();
        this.rotationOrigin = vec2.create();
    }

    /**
     * Loads/compiles shaders, creates buffers, and sets up WebGL state.
     * Must be awaited before calling begin/draw/end.
     */
    async initialize()
    {
        this.camera = new Camera(this.width, this.height);

        const vertexShader = ProgUtils.createShader(this.gl, this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = ProgUtils.createShader(this.gl, this.gl.FRAGMENT_SHADER, fragmentShaderSource);

        this.program = ProgUtils.createProgram(this.gl, vertexShader, fragmentShader);
        this.projectionViewMatrixLocation = this.gl.getUniformLocation(this.program, "projectionViewMatrix");

        this.gl.useProgram(this.program);

        // https://learnopengl.com/Getting-started/Shaders --> this website explains how shaders work, its the standard way to code and 
        // define shaders. all shader code follows this pipeline: write source code -> create shader from source code -> create program ->
        // link program --> use program. --> create buffer --> setup attribute pointers.
        // inside of the docs folder under Examples folder, learnopengl_render_pipeline.png describes a abstract diagram of this.

        // Create a buffer from the vertex data. the buffer is interleaved meaning that we store both the vertex data and the color data
        // for the vertex into the same line, and we can tell the gpu how to recognize whether its reading vertex data or color data by
        // setting stride and offset in vertexAttribPointer function given be WebGL API.

        this.buffer = ProgUtils.createBuffer(this.gl, this.data);
    
        // You can think of strides as the way gpu separates data, so for vertex 1 we have x,y coordinates and the color of that vertex
        // is rgb, so 2 * vertex data + 3 * color data is one single vertex. that way the gpu knows when a new vertex starts.
        const stride = 2 * Float32Array.BYTES_PER_ELEMENT + 3 * Float32Array.BYTES_PER_ELEMENT; 

        // This points to the vertex data, so we do not need to make an offset since the buffers first 2 elements are vertex coordinates
        // x and y. and we want this gpu to read the data of those 2 into aPosition inside the shader
        this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, stride, 0); // describes how gpu reads data in buffer
        this.gl.enableVertexAttribArray(0); 

        // change the offset to 2 * Float32Array, that way it starts pointing at r in the buffer and this reads into aColor.
        this.gl.vertexAttribPointer(1, 3, this.gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT);
        this.gl.enableVertexAttribArray(1);

        // Element buffer to draw by indices of vertices rather than by individual vertices. reason being to avoid duplicate vertices. for example if we wanted to draw a rectagnle
        // we would draw 2 triangles, meaning we will at most using 2 same vertices atleast 8 times, which just makes the buffer bigger than it needs to be. so EBO (Element buffer objects)
        // were made for this reason.
        this.setupElementBuffer();
    }

    // This function are operations that need to be done before drawing. i.e it begins a new frame.
    begin()
    {
        this.instanceCount = 0; // always reset the instance count before drawing.
        this.camera.update(); // make sure were in the correct coordinate system by updating the camera.

        this.gl.useProgram(this.program) // we already call this in initialize, and we only need to techinically call it once, but it doesn't hurt to do this just for sanity.
        this.gl.uniformMatrix4fv(this.projectionViewMatrixLocation, false, this.camera.projectionViewMatrix);

        // we need to bind the buffers that we are going to be using.
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.elementBuffer);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    }

    // This function will fill in the buffer with the vertex data, in otherwords we are literally 'drawing' on the canvas.
    /**
     * Adds one object instance (triangle) to the CPU-side batch buffer.
     * @param {number[]} vertices Interleaved vertex array [x,y,r,g,b] * 3.
     * @param {number[]|Float32Array} position World position [x,y].
     * @param {number} scale Uniform scale factor.
     * @param {number} rotation Rotation in radians.
     */
    draw(vertices, position,  scale, rotation)
    {
        this.fillVertexBuffer(vertices, position, scale, rotation);
    }

    // This function are operations that need to be done after drawing.
    end()
    {
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0); //rgba for black, this sets the color we want to reset to when we clear.
        this.gl.clear(this.gl.COLOR_BUFFER_BIT); // clears color.

        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.data);
        this.gl.drawElements(this.gl.TRIANGLES, 3 * this.instanceCount, this.gl.UNSIGNED_SHORT, 0);
        this.instanceCount = 0; // reset instanceCount.
        //this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
    }

    // Function for filling buffer with vertexdata,
    /**
     * CPU-side model transform:
     * - Rotate around triangle centroid (local pivot)
     * - Scale
     * - Translate to world, then to screen (canvas center)
     * Then writes final positions/colors into the shared Float32Array buffer.
     */
    fillVertexBuffer(vertices, position, scale, rotation)
    {
        let i = this.instanceCount * BUFFER_SIZE; // ensure we start at the correct position in the buffer. so if instanceCount is 0, we start at 0, and if its 1 we start 1 * BUFFER_SIZE.

        const x0 = vertices[0], y0 = vertices[1];
        const x1 = vertices[5], y1 = vertices[6];
        const x2 = vertices[10], y2 = vertices[11];

        const cx = (x0 + x1 + x2) / 3.0;
        const cy = (y0 + y1 + y2) / 3.0;

        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);

        const rot = (x, y, out) => 
        {
            // translate to pivot
            let dx = (x - cx) * scale;
            let dy = (y - cy) * scale;

            // rotate
            const rx = dx * cos - dy * sin;
            const ry = dx * sin + dy * cos;

            // translate back from pivot
            out[0] = rx + cx * scale;
            out[1] = ry + cy * scale;
        };

        rot(x0, y0, this.v0);
        rot(x1, y1, this.v1);
        rot(x2, y2, this.v2);

        // world to screen. the world is centered at canvas center.
        const ox = this.canvasCenterX + position[0];
        const oy = this.canvasCenterY + position[1];

        // v0
        this.data[0 + i] = this.v0[0] + ox;
        this.data[1 + i] = this.v0[1] + oy;
        this.data[2 + i] = vertices[2]; this.data[3 + i] = vertices[3]; this.data[4 + i] = vertices[4];

        // v1
        this.data[5 + i] = this.v1[0] + ox;
        this.data[6 + i] = this.v1[1] + oy;
        this.data[7 + i] = vertices[7]; this.data[8 + i] = vertices[8]; this.data[9 + i] = vertices[9];

        // v2
        this.data[10 + i] = this.v2[0] + ox;
        this.data[11 + i] = this.v2[1] + oy;
        this.data[12 + i] = vertices[12]; this.data[13 + i] = vertices[13]; this.data[14 + i] = vertices[14];

        this.instanceCount++; // increment instances after filling up all the data for one object.
    }

    setupElementBuffer()
    {
        const data = new Uint16Array(MAX_MESH_OBJECTS * INDICES_PER_SPRITE);

        for (let i = 0; i < MAX_MESH_OBJECTS; i++)
        {
            // i current count, + number of vertices + current vertex, so i * 3 + 0 = 0 if i = 0 is the index of vertex 0.
            // for a triagnle, 3 vertices, so 3 indices. its unnesccary for just a single triangle, but this will be needed when we have more complex shapes to draw like the asteroids
            // it will also likely have to change, for example we only need one triangle, the player ship, so this code is kind of pointless for the ship, we can just add another function
            // called  setupPlayerIndices or something like that. for now this works.
            data[i * INDICES_PER_SPRITE + 0] = i * 3 + 0; 
            data[i * INDICES_PER_SPRITE + 1] = i * 3 + 1;
            data[i * INDICES_PER_SPRITE + 2] = i * 3 + 2;
        }

        this.elementBuffer = ProgUtils.createIndexBuffer(this.gl, data);
    }
}