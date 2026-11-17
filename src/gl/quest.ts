// Minimal glTF (GLB) PBR renderer for the hero Quest 3 (reference Q3GL, no libraries). One mesh, one primitive,
// quantized attributes (KHR_mesh_quantization: the accessor's type and `normalized` flag go straight to the GPU),
// WebP textures (EXT_texture_webp). WebGL2 only. Loaded with import() after the hero intro, when the browser is idle.
import { M4, lose, program } from "./util";

const VS = `#version 300 es
in vec3 aP;in vec3 aN;in vec2 aU;uniform mat4 uM,uVP;out vec3 vW;out vec3 vN;out vec2 vU;
void main(){vec4 w=uM*vec4(aP,1.);vW=w.xyz;vN=mat3(uM)*aN;vU=aU;gl_Position=uVP*w;}`;
const FS = `#version 300 es
precision highp float;in vec3 vW;in vec3 vN;in vec2 vU;uniform sampler2D tB,tN,tO;uniform vec3 uCam;uniform float uExp;out vec4 o;
const float PI=3.14159265;
vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
float D(float a,float nh){float a2=a*a;float d=nh*nh*(a2-1.)+1.;return a2/(PI*d*d);}
float Gs(float k,float x){return x/(x*(1.-k)+k);}
vec3 light(vec3 N,vec3 V,vec3 L,vec3 C,vec3 base,float r,float m,vec3 F0){
 vec3 H=normalize(V+L);float nl=max(dot(N,L),0.),nv=max(dot(N,V),1e-3),nh=max(dot(N,H),0.),vh=max(dot(V,H),0.);
 vec3 F=F0+(1.-F0)*pow(1.-vh,5.);float k=(r+1.)*(r+1.)/8.;float spec=D(r*r,nh)*Gs(k,nl)*Gs(k,nv)/(4.*nv*max(nl,1e-3));
 return ((1.-F)*(1.-m)*base/PI+F*spec)*C*nl;}
void main(){
 vec3 N=normalize(vN);if(!gl_FrontFacing)N=-N;
 vec3 tn=texture(tN,vU).xyz*2.-1.;
 vec3 dp1=dFdx(vW),dp2=dFdy(vW);vec2 du1=dFdx(vU),du2=dFdy(vU);
 vec3 dp2p=cross(dp2,N),dp1p=cross(N,dp1);vec3 T=dp2p*du1.x+dp1p*du2.x,B=dp2p*du1.y+dp1p*du2.y;
 float im=inversesqrt(max(max(dot(T,T),dot(B,B)),1e-20));N=normalize(mat3(T*im,-B*im,N)*tn);
 vec3 base=pow(texture(tB,vU).rgb,vec3(2.2));vec3 orm=texture(tO,vU).rgb;float ao=orm.r,r=clamp(orm.g,.06,1.),m=orm.b;
 vec3 V=normalize(uCam-vW);vec3 F0=mix(vec3(.04),base,m);
 vec3 c=light(N,V,normalize(vec3(-.6,.7,.6)),vec3(3.4),base,r,m,F0)
       +light(N,V,normalize(vec3(.85,.15,.5)),vec3(.8),base,r,m,F0)
       +light(N,V,normalize(vec3(.2,.55,-1.)),vec3(2.2),base,r,m,F0);
 float hy=N.y*.5+.5;vec3 amb=mix(vec3(.3,.31,.34),vec3(.78,.8,.86),hy);
 vec3 R=reflect(-V,N);vec3 env=mix(vec3(.42),vec3(1.2),smoothstep(-.3,.7,R.y));
 vec3 Fa=F0+(max(vec3(1.-r),F0)-F0)*pow(1.-max(dot(N,V),0.),5.);
 c+=(amb*base*(1.-m)*(1.-Fa)+env*Fa*mix(1.,.35,r))*ao;
 o=vec4(pow(aces(c*uExp),vec3(1./2.2)),1.);}`;

type Json = {
  images: { bufferView: number; mimeType: string }[];
  bufferViews: { byteOffset?: number; byteLength: number; byteStride?: number }[];
  accessors: { bufferView: number; componentType: number; type: keyof typeof SZ; normalized?: boolean; byteOffset?: number; count: number }[];
  meshes: { primitives: { attributes: Record<string, number>; indices: number }[] }[];
  nodes: { translation?: number[]; scale?: number[] }[];
  materials: { pbrMetallicRoughness: { baseColorTexture: { index: number }; metallicRoughnessTexture: { index: number } }; normalTexture: { index: number } }[];
  textures: { source?: number; extensions?: { EXT_texture_webp?: { source: number } } }[];
};
const SZ = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };
export type Model = { js: Json; buf: ArrayBuffer; bo: number; imgs: ImageBitmap[] };

const bytes = new Map<string, Promise<ArrayBuffer>>(); // the hero re-mounts on navigation: download once per visit
export async function loadModel(url: string): Promise<Model> {
  if (!bytes.has(url))
    bytes.set(
      url,
      fetch(url).then((r) => {
        if (!r.ok) throw new Error(`model ${r.status}`);
        return r.arrayBuffer();
      }),
    );
  const buf = await bytes.get(url)!.catch((err) => {
    bytes.delete(url);
    throw err;
  });
  const dv = new DataView(buf);
  if (dv.getUint32(0, true) !== 0x46546c67) throw new Error("not a GLB");
  const jl = dv.getUint32(12, true);
  const js = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 20, jl))) as Json;
  const bo = 20 + jl + 8; // BIN chunk data starts after its 8-byte header
  const imgs = await Promise.all(
    js.images.map((im) => {
      const v = js.bufferViews[im.bufferView];
      return createImageBitmap(new Blob([new Uint8Array(buf, bo + (v.byteOffset || 0), v.byteLength)], { type: im.mimeType }), { premultiplyAlpha: "none", colorSpaceConversion: "none" });
    }),
  );
  return { js, buf, bo, imgs };
}

export type Pose = { zoom?: number; q?: number[]; x?: number; y?: number; yaw?: number; pitch?: number; roll?: number };

export function createQuest(cv: HTMLCanvasElement, model: Model, opt: { fov: number; dist: number; exp?: number }) {
  const gl = cv.getContext("webgl2", { alpha: true, premultipliedAlpha: false, antialias: true, preserveDrawingBuffer: false });
  if (!gl) return null;
  const pr = program(gl, VS, FS);
  const { js, buf, bo, imgs } = model, prim = js.meshes[0].primitives[0], node = js.nodes[0];
  gl.bindVertexArray(gl.createVertexArray());
  const attr = (name: string, loc: number) => {
    const a = js.accessors[prim.attributes[name]], v = js.bufferViews[a.bufferView];
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(buf, bo + (v.byteOffset || 0), v.byteLength), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, SZ[a.type], a.componentType, !!a.normalized, v.byteStride || 0, a.byteOffset || 0);
  };
  attr("POSITION", gl.getAttribLocation(pr, "aP"));
  attr("NORMAL", gl.getAttribLocation(pr, "aN"));
  attr("TEXCOORD_0", gl.getAttribLocation(pr, "aU"));
  const ia = js.accessors[prim.indices], iv = js.bufferViews[ia.bufferView];
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(buf, bo + (iv.byteOffset || 0), iv.byteLength), gl.STATIC_DRAW);
  const mat = js.materials[0];
  const texIdx: [string, number][] = [
    ["tB", mat.pbrMetallicRoughness.baseColorTexture.index],
    ["tN", mat.normalTexture.index],
    ["tO", mat.pbrMetallicRoughness.metallicRoughnessTexture.index],
  ];
  const aniso = gl.getExtension("EXT_texture_filter_anisotropic");
  texIdx.forEach(([u, ti], unit) => {
    const t = js.textures[ti], src = t.source ?? t.extensions?.EXT_texture_webp?.source ?? 0;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgs[src]);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
    gl.uniform1i(gl.getUniformLocation(pr, u), unit);
  });
  imgs.forEach((im) => im.close());
  const U = Object.fromEntries(["uM", "uVP", "uCam", "uExp"].map((k) => [k, gl.getUniformLocation(pr, k)]));
  const base = M4.trs(node.translation || [0, 0, 0], (node.scale || [1])[0]);
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0, 0, 0, 0);
  let fb: WebGLFramebuffer | null = null, fw = 0, fh = 0;

  const R = {
    gl,
    dispose: () => lose(gl),
    /** [scale, offsetX, offsetY] in clip space so the fixed pose fills the visor box */
    fit: [1, 0, 0],
    draw(pose: Pose, w: number, h: number, target: WebGLFramebuffer | null = null) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target);
      gl.viewport(0, 0, w, h);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      const model = M4.mul(M4.trs([pose.x || 0, pose.y || 0, 0], pose.zoom || 1), M4.mul(M4.quat(pose.q || [0, 0, 0, 1]), M4.mul(M4.rotX(pose.pitch || 0), M4.mul(M4.rotY(pose.yaw || 0), M4.mul(M4.rotZ(pose.roll || 0), base)))));
      const cam = [0, 0, opt.dist], f = R.fit, nd = [f[0], 0, 0, 0, 0, f[0], 0, 0, 0, 0, 1, 0, f[1], f[2], 0, 1];
      const vp = M4.mul(nd, M4.mul(M4.persp(opt.fov, w / h, 0.05, 10), M4.tr(-cam[0], -cam[1], -cam[2])));
      gl.uniformMatrix4fv(U.uM, false, new Float32Array(model));
      gl.uniformMatrix4fv(U.uVP, false, new Float32Array(vp));
      gl.uniform3fv(U.uCam, cam);
      gl.uniform1f(U.uExp, opt.exp ?? 0.92);
      gl.drawElements(gl.TRIANGLES, ia.count, ia.componentType, 0);
    },
    /** render the pose off-screen and read back RGBA (bottom row first) */
    snapshot(pose: Pose, w: number, h: number) {
      if (!fb || fw !== w || fh !== h) {
        fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.activeTexture(gl.TEXTURE3);
        const ct = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, ct);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, ct, 0);
        const db = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, db);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, db);
        fw = w;
        fh = h;
      }
      R.draw(pose, w, h, fb);
      const px = new Uint8Array(w * h * 4);
      gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return px;
    },
  };
  return R;
}
export type Quest = NonNullable<ReturnType<typeof createQuest>>;
