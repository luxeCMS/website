import { ShaderProgram } from "./shader-program";
import vertexShaderSource from "./shaders/vertex.glsl.ts";
import fragmentShaderSource from "./shaders/fragment.glsl.ts";
import { settings } from "./settings.ts";

export class PixelGridEffect {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private shaderProgram: ShaderProgram;
  private mouseX: number = window.innerWidth;
  private mouseY: number = window.innerHeight;
  private dpr: number;
  private startTime: number;
  private animationFrameId: number = 0;

  constructor() {
    this.canvas = document.createElement("canvas");
    document.body.appendChild(this.canvas);
    this.dpr = window.devicePixelRatio || 1;
    this.startTime = performance.now();

    this.gl = this.canvas.getContext("webgl", {
      antialias: false,
      preserveDrawingBuffer: false,
    })!;

    if (!this.gl) {
      throw new Error("WebGL not supported");
    }

    this.shaderProgram = new ShaderProgram(
      this.gl,
      vertexShaderSource,
      fragmentShaderSource,
    );
    this.init();
  }

  private init(): void {
    const vertices = new Float32Array([
      -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0,
    ]);

    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

    const positionLocation =
      this.shaderProgram.getAttributeLocation("a_position");
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(
      positionLocation,
      2,
      this.gl.FLOAT,
      false,
      0,
      0,
    );

    window.addEventListener("resize", () => this.resize());
    window.addEventListener("mousemove", this.handleMouseMove);

    this.resize();
    this.render();
  }

  private handleMouseMove = (e: MouseEvent): void => {
    this.mouseX = e.clientX * this.dpr;
    this.mouseY = e.clientY * this.dpr;
  };

  private resize(): void {
    this.dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.canvas.width = width * this.dpr;
    this.canvas.height = height * this.dpr;

    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  private render = (): void => {
    const currentTime = performance.now();
    const elapsedTime = currentTime - this.startTime;

    this.shaderProgram.use();

    // Update uniforms
    this.shaderProgram.setUniform2f(
      "u_resolution",
      this.canvas.width,
      this.canvas.height,
    );
    this.shaderProgram.setUniform2f(
      "u_mouse",
      this.mouseX,
      this.canvas.height - this.mouseY,
    );
    this.shaderProgram.setUniform1f(
      "u_pixelSize",
      settings.pixelSize * this.dpr,
    );
    this.shaderProgram.setUniform1f("u_gap", settings.pixelGap * this.dpr);
    this.shaderProgram.setUniform1f("u_circleRadius", settings.circleRadius);
    this.shaderProgram.setUniform1f("u_innerRadius", settings.innerRadius);
    this.shaderProgram.setUniform1f("u_falloffPower", settings.falloffPower);
    this.shaderProgram.setUniform1f("u_minIntensity", settings.minIntensity);
    this.shaderProgram.setUniform1f("u_maxIntensity", settings.maxIntensity);
    this.shaderProgram.setUniform3f("u_baseColor", ...settings.baseColor);
    this.shaderProgram.setUniform3f(
      "u_highlightColor",
      ...settings.highlightColor,
    );
    this.shaderProgram.setUniform1f("u_time", elapsedTime);

    // Draw
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

    this.animationFrameId = requestAnimationFrame(this.render);
  };

  public destroy(): void {
    window.removeEventListener("mousemove", this.handleMouseMove);
    cancelAnimationFrame(this.animationFrameId);
    this.canvas.remove();
  }
}
