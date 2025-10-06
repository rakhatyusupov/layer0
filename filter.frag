#ifdef GL_ES
precision mediump float;
#endif

varying vec2 pos;

uniform sampler2D filter_background;
uniform vec2 filter_res;

// Distortion controls
uniform float u_distortionScale1;
uniform float u_distortionScale2;
uniform float u_distortionAmp;
uniform float u_distortionFreqX;
uniform float u_distortionFreqY;
uniform float u_time;

// --- noise functions from https://www.shadertoy.com/view/XslGRr
// Created by inigo quilez - iq/2013
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

mat3 m = mat3( 0.00,  0.80,  0.60,
              -0.80,  0.36, -0.48,
              -0.60, -0.48,  0.64 );

float hash( float n )
{
    return fract(sin(n)*43758.5453);
}

float noise( in vec3 x )
{
    vec3 p = floor(x);
    vec3 f = fract(x);

    f = f*f*(3.0-2.0*f);

    float n = p.x + p.y*57.0 + 113.0*p.z;

    float res = mix(mix(mix( hash(n+  0.0), hash(n+  1.0),f.x),
                        mix( hash(n+ 57.0), hash(n+ 58.0),f.x),f.y),
                    mix(mix( hash(n+113.0), hash(n+114.0),f.x),
                        mix( hash(n+170.0), hash(n+171.0),f.x),f.y),f.z);
    return res;
}

float fbm( vec3 p )
{
    float f;
    f  = 0.5000*noise( p ); p = m*p*2.02;
    f += 0.2500*noise( p ); p = m*p*2.03;
    f += 0.1250*noise( p ); p = m*p*2.01;
    f += 0.0625*noise( p ); 
    return f;
}

float mynoise ( vec3 p)
{
     return noise(p);
}

float myfbm( vec3 p )
{
    float f;
    f  = 0.5000*mynoise( p ); p = m*p*2.02;
    f += 0.2500*mynoise( p ); p = m*p*2.03;
    f += 0.1250*mynoise( p ); p = m*p*2.01;
    f += 0.0625*mynoise( p ); p = m*p*2.05;
    f += 0.0625/2.*mynoise( p ); p = m*p*2.02;
    f += 0.0625/4.*mynoise( p );
    return f;
}

void main() {
  vec2 uv = pos;
  vec2 fragCoord = pos * filter_res;
  
  // Apply distortion effect
  vec3 p = u_distortionScale2 * vec3(uv, 0.0) - u_time * vec3(1.0, 1.0, 1.0) * 0.1;
  float x = myfbm(p);
  vec3 v = (0.5 + 0.5 * sin(x * vec3(u_distortionFreqX, u_distortionFreqY, 1.0) * u_distortionScale1)) / u_distortionScale1;
  v *= u_distortionAmp;
  
  // Sample texture with distortion
  vec2 distortedUV = uv + 0.02 * v.xy / filter_res;
  vec4 col = texture2D(filter_background, distortedUV);
  
  gl_FragColor = col;
}
