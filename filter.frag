#ifdef GL_ES
precision mediump float;
#endif

varying vec2 pos;

uniform sampler2D filter_background;
uniform vec2 filter_res;

void main() {
  vec4 col = texture2D(filter_background, pos);
  gl_FragColor = col;
}
