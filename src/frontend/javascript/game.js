const vertexShaderSource = document.getElementById("vertex-shader-2d").textContent;
const fragmentShaderSource = document.getElementById("fragment-shader-2d").textContent;


import { Camera } from "./camera.js"


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

        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

        this.program = this.createProgram(vertexShader, fragmentShader);
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

        const x = 100;
        const y = 100;
        const w = 100; // width
        const h = 100; // height

        const buffer = this.createBuffer([
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

    /**
     * create a webgl program
     * @param vertexShader - vertex shader
     * @param fragmentShader - fragment shader
     * @returns {WebGLProgram} - webgl program
     */
    createProgram(vertexShader, fragmentShader)
    {
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        const success = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
        if (!success)
        {
            console.error("program failed to link:" + this.gl.getProgramInfoLog(program));
            this.gl.deleteProgram(program);
        }

        return program;
    }

    /**
     * create a shader
     * @param {number} shaderType - gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
     * @param {string} ShaderSource  - shader source code
     * @returns {WebGLShader} - webgl shader.
     */
    createShader(shaderType, shaderSource)
    {
        const shader = this.gl.createShader(shaderType);
        this.gl.shaderSource(shader, shaderSource);
        this.gl.compileShader(shader);

        const success = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
        if (!success)
        {
            console.error("shader failed to compile" + this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
        }

        return shader;
    }

    /**
     * create a buffer to store data to the gpu
     * @param {*} data  - data to store
     * @returns {WebGLBuffer}
     */
    createBuffer(data)
    {
        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);

        return buffer;
    }

    /**
     * A function to create an Element array buffer
     * @param  data - array of indices
     * @returns {WebGLBuffer}
     */
    createIndexBuffer(data)
    {
        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), this.gl.STATIC_DRAW);

        return buffer;
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