const vertexShaderSource = document.getElementById("vertex-shader-2d").textContent;
const fragmentShaderSource = document.getElementById("fragment-shader-2d").textContent;


import { Camera } from "./camera.js"
import { ProgUtils } from "./program-utilities.js"


export class Game
{
    constructor()
    {


    }

    async initialize()
    {
        this.canvas = document.getElementById('canvas');
        this.gl = this.canvas.getContext('webgl2');
        this.camera = new Camera(this.canvas.width, this.canvas.height);

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
        // setting stride and offset in vertexAttribPointer.

        // We need to edit this after adding a projection matrix, since coordinates are no longer normalized to -1 and 1 on the canvas, these values are being drawn, but they 
        // are to small to even see.

        const x = 0;
        const y = 0;
        const w = 100; // width
        const h = 100; // height

        const buffer = ProgUtils.createBuffer(this.gl, [
         // x,     y,         r, g, b
            x,     y,         1, 1, 1, // top of triangle
            x + w, y + h,     1, 1, 1, // bottom right corner
            x - w, y + h,     1, 1, 1 // bottom left corner
        ])

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
    }



    Render()
    {
        this.camera.update();

        this.gl.clearColor(0.0, 0.0, 0.0, 1.0); //rgba for black, this sets the color we want to reset to when we clear.
        this.gl.clear(this.gl.COLOR_BUFFER_BIT); // clears color.

        this.gl.uniformMatrix4fv(this.projectionViewMatrixLocation, false, this.camera.projectionViewMatrix);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);

    }
}