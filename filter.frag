#ifdef GL_ES
precision mediump float;
#endif

varying vec2 pos;

uniform sampler2D filter_background;
uniform vec2 filter_res;

// Custom uniforms controlled by lil-gui
uniform float u_saturation;
uniform float u_brightness;
uniform float u_contrast;
uniform vec3 u_colorTint;

void main() {
  vec4 col = texture2D(filter_background, pos);
  
  // Apply brightness
  col.rgb *= u_brightness;
  
  // Apply contrast
  col.rgb = (col.rgb - 0.5) * u_contrast + 0.5;
  
  // Apply saturation
  float gray = dot(col.rgb, vec3(0.299, 0.587, 0.114));
  col.rgb = mix(vec3(gray), col.rgb, u_saturation);
  
  // Apply color tint
  col.rgb *= u_colorTint;
  
  gl_FragColor = col;
}
