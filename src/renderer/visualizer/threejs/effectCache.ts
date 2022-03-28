import { AdaptiveToneMappingPass } from 'three/examples/jsm/postprocessing/AdaptiveToneMappingPass.js'
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js'
import { ClearPass } from 'three/examples/jsm/postprocessing/ClearPass.js'
import { DotScreenPass } from 'three/examples/jsm/postprocessing/DotScreenPass.js'
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js'
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js'
import { HalftonePass } from 'three/examples/jsm/postprocessing/HalftonePass.js'
import { LUTPass } from 'three/examples/jsm/postprocessing/LUTPass.js'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { Vector2 } from 'three'

const effectCache = {
  Glitch: new GlitchPass(),
  AdaptiveToneMapping: new AdaptiveToneMappingPass(), // Maps colors to increase bit-depth for HDR displays
  Afterimage: new AfterimagePass(),
  // Bloom: new BloomPass(1, 1, 1),
  // Bokeh: new BokehPass(),
  Clear: new ClearPass(),
  // CubeTexture: new CubeTexturePass(),
  DotScreen: new DotScreenPass(),
  Film: new FilmPass(),
  Halftone: new HalftonePass(1, 1, {}),
  LUT: new LUTPass({}),
  // Mask: new MaskPass(), // I think this creates a mask layer of one scene over another
  // Outline: new OutlinePass(),
  // SAOPass: new SAOPass(),
  SMAA: new SMAAPass(1, 1),
  // SSAO: new SSAOPass(),
  // SSR: new SSRPass({}),
  // Save: new SavePass(),
  UnrealBloom: new UnrealBloomPass(new Vector2(1, 1), 0.5, 1, 0.5),
}

export default effectCache
