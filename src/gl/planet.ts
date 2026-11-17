// 360° tiny planet (ANIMATION-SPEC H10): one full-screen triangle; the fragment shader ray-casts an equirectangular
// texture (the city strip on a 4096 × 2048 canvas) from a camera that moves from outside the sphere to its centre.
// WebGL2 uses textureGrad to hide the longitude seam; WebGL1 falls back to texture2D. Loaded with import().
import { drawSVG } from "@/lib/drawSVG";
import { panoSVG } from "@/lib/pano";
import { dpr, lose, program } from "./util";

const TW = 4096, TH = 2048, PW = 2400, G = 468;

function texture() {
  const c = document.createElement("canvas");
  c.width = TW;
  c.height = TH;
  const x = c.getContext("2d")!, latY = (l: number) => TH / 2 - (l / 90) * (TH / 2), K = TW / PW;
  x.fillStyle = "#fff";
  x.fillRect(0, 0, TW, TH / 2);
  x.fillStyle = "#EEF0F4";
  x.fillRect(0, TH / 2, TW, TH / 2);
  x.fillStyle = "#fff";
  x.fillRect(0, latY(-19), TW, 40);
  for (const sx of [80, 560, 1130, 1580, 2040]) x.fillRect(sx * K - 18, latY(-19), 36, TH);
  x.strokeStyle = "#B9BDC8";
  x.lineWidth = 3;
  x.setLineDash([26, 26]);
  x.beginPath();
  x.moveTo(0, latY(-19) + 20);
  x.lineTo(TW, latY(-19) + 20);
  x.stroke();
  x.setLineDash([]);
  drawSVG(x, panoSVG({ planet: true }), K, 0, TH / 2 - G * K);
  x.fillStyle = "#1A1A1F";
  x.fillRect(0, TH / 2 - 2, TW, 4);
  return c;
}

export type PlanetView = { W: number[]; R: number[]; U: number[]; d: number; s: number; off: number[] };

/** returns null without WebGL (the page keeps the flat strip) */
export function createPlanet(cv: HTMLCanvasElement) {
  let gl: WebGLRenderingContext | WebGL2RenderingContext | null = cv.getContext("webgl2", { antialias: false, alpha: false });
  const v2 = !!gl;
  if (!gl) gl = cv.getContext("webgl", { antialias: false, alpha: false });
  if (!gl) return null;
  const body = `vec2 p=((gl_FragCoord.xy-RES*.5)/(min(RES.x,RES.y)*.5)-OFF)*S;
vec3 dv=(1.+D)*W+p.x*R+p.y*U;float a=dot(dv,dv),b=-D*(1.+D),c=D*D-1.;
float t=(-b+sqrt(max(b*b-a*c,0.)))/a;vec3 s=normalize(-D*W+t*dv);
float v=.5-asin(clamp(s.y,-1.,1.))/PI;float l1=atan(s.x,s.z)/(2.*PI)+.5;`;
  const hdr = "uniform sampler2D T;uniform vec3 W,R,U;uniform float D,S;uniform vec2 RES,OFF;const float PI=3.14159265;";
  const vs = v2 ? "#version 300 es\nin vec2 aP;void main(){gl_Position=vec4(aP,0.,1.);}" : "attribute vec2 aP;void main(){gl_Position=vec4(aP,0.,1.);}";
  const fs = v2
    ? `#version 300 es\nprecision highp float;${hdr}out vec4 o;void main(){${body}
float l2=atan(-s.x,-s.z)/(2.*PI);vec2 ax=dFdx(vec2(l1,v)),ay=dFdy(vec2(l1,v)),bx=dFdx(vec2(l2,v)),by=dFdy(vec2(l2,v));
bool q=abs(ax.x)+abs(ay.x)>abs(bx.x)+abs(by.x);o=textureGrad(T,vec2(l1,v),q?bx:ax,q?by:ay);}`
    : `precision highp float;${hdr}void main(){${body}gl_FragColor=texture2D(T,vec2(l1,v));}`;
  let pr: WebGLProgram;
  try {
    pr = program(gl, vs, fs);
  } catch (err) {
    console.warn("Tiny planet shader failed", err);
    return null;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aP = gl.getAttribLocation(pr, "aP");
  gl.enableVertexAttribArray(aP);
  gl.vertexAttribPointer(aP, 2, gl.FLOAT, false, 0, 0);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture());
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const an = gl.getExtension("EXT_texture_filter_anisotropic");
  if (an) gl.texParameterf(gl.TEXTURE_2D, an.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(an.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
  const u = Object.fromEntries(["T", "W", "R", "U", "D", "S", "RES", "OFF"].map((k) => [k, gl.getUniformLocation(pr, k)]));
  gl.uniform1i(u.T, 0);
  const g = gl;

  return {
    dispose: () => lose(g),
    /** CSS size of the canvas; drawing buffer capped at 1.5× */
    size() {
      const W = cv.clientWidth, H = cv.clientHeight, k = dpr(1.5);
      cv.width = Math.round(W * k);
      cv.height = Math.round(H * k);
      g.viewport(0, 0, cv.width, cv.height);
      return { W, H };
    },
    draw(v: PlanetView) {
      g.uniform3fv(u.W, v.W);
      g.uniform3fv(u.R, v.R);
      g.uniform3fv(u.U, v.U);
      g.uniform1f(u.D, v.d);
      g.uniform1f(u.S, v.s);
      g.uniform2f(u.RES, cv.width, cv.height);
      g.uniform2f(u.OFF, v.off[0], v.off[1]);
      g.drawArrays(g.TRIANGLES, 0, 3);
    },
  };
}
