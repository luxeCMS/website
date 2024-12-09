export class ShaderProgram {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;

  constructor(
    gl: WebGLRenderingContext,
    vertexSource: string,
    fragmentSource: string,
  ) {
    this.gl = gl;
    const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.createShader(
      gl.FRAGMENT_SHADER,
      fragmentSource,
    );
    this.program = this.createProgram(vertexShader, fragmentShader);
  }

  private createShader(type: number, source: string): WebGLShader {
    const shader = this.gl.createShader(type)!;
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      throw new Error(
        `Shader compile error: ${this.gl.getShaderInfoLog(shader)}`,
      );
    }

    return shader;
  }

  private createProgram(
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader,
  ): WebGLProgram {
    const program = this.gl.createProgram()!;
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      throw new Error(
        `Program link error: ${this.gl.getProgramInfoLog(program)}`,
      );
    }

    return program;
  }

  use(): void {
    this.gl.useProgram(this.program);
  }

  setUniform2f(name: string, x: number, y: number): void {
    const location = this.gl.getUniformLocation(this.program, name);
    this.gl.uniform2f(location, x, y);
  }

  setUniform1f(name: string, value: number): void {
    const location = this.gl.getUniformLocation(this.program, name);
    this.gl.uniform1f(location, value);
  }

  setUniform3f(name: string, x: number, y: number, z: number): void {
    const location = this.gl.getUniformLocation(this.program, name);
    this.gl.uniform3f(location, x, y, z);
  }

  getAttributeLocation(name: string): number {
    return this.gl.getAttribLocation(this.program, name);
  }
}
