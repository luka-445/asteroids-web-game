export class ProgUtils
{
    constructor()
    {

    }

        /**
     * create a webgl program
     * @param vertexShader - vertex shader
     * @param fragmentShader - fragment shader
     * @returns {WebGLProgram} - webgl program
     */
    static createProgram(gl, vertexShader, fragmentShader)
    {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        const success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!success)
        {
            console.error("program failed to link:" + gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
        }

        return program;
    }

    /**
     * create a shader
     * @param {number} shaderType - gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
     * @param {string} ShaderSource  - shader source code
     * @returns {WebGLShader} - webgl shader.
     */
    static createShader(gl, shaderType, shaderSource)
    {
        const shader = gl.createShader(shaderType);
        gl.shaderSource(shader, shaderSource);
        gl.compileShader(shader);

        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!success)
        {
            console.error("shader failed to compile" + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
        }

        return shader;
    }

    /**
     * create a buffer to store data to the gpu
     * @param {*} data  - data to store
     * @returns {WebGLBuffer}
     */
    static createBuffer(gl, data)
    {
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

        return buffer;
    }

    /**
     * A function to create an Element array buffer
     * @param  data - array of indices
     * @returns {WebGLBuffer}
     */
    static createIndexBuffer(gl, data)
    {
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), gl.STATIC_DRAW);

        return buffer;
    }
}