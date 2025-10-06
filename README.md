# p5.filterShader with lil-gui

This project demonstrates how to use the [p5.filterShader](https://github.com/BarneyWhiteman/p5.filterShader) library with [lil-gui](https://lil-gui.georgealways.com/) for interactive shader controls.

## Features

- **p5.filterShader**: Apply post-processing effects to p5.js sketches
- **lil-gui**: Interactive GUI controls for real-time parameter adjustment
- **Custom Filter Shader**: Adjustable saturation, brightness, contrast, and color tint
- **3D Animation**: Animated 3D shapes (boxes and torus) to demonstrate the filter effects

## Getting Started

1. Open `index.html` in a web browser
2. Use the GUI controls on the right to adjust the filter parameters:
   - **Saturation**: Control color intensity (0 = grayscale, 2 = oversaturated)
   - **Brightness**: Adjust overall brightness
   - **Contrast**: Modify contrast levels
   - **Color Tint**: Apply RGB color tinting
   - **Rotation Speed**: Control animation speed

## Files

- `index.html` - Main HTML file with library includes
- `sketch.js` - p5.js sketch with 3D animation and GUI setup
- `filter.vert` - Vertex shader (generic for p5.filterShader)
- `filter.frag` - Fragment shader with custom color adjustments
- `README.md` - This file

## Libraries Used

- [p5.js](https://p5js.org/) v1.7.0
- [p5.filterShader](https://github.com/BarneyWhiteman/p5.filterShader) v0.0.3
- [lil-gui](https://lil-gui.georgealways.com/) v0.19

## How It Works

1. The sketch draws 3D shapes using p5.js WEBGL mode
2. After drawing, `filterShader()` applies the custom shader as a post-processing effect
3. lil-gui provides real-time controls that update shader uniforms
4. The shader modifies the rendered image based on the GUI parameters

## Customization

You can modify the fragment shader (`filter.frag`) to create different effects:
- Add new uniform parameters
- Implement different filter algorithms (blur, edge detection, chromatic aberration, etc.)
- Combine multiple effects

Update the GUI in `sketch.js` to match any new parameters you add.

## Resources

- [p5.filterShader Examples](https://editor.p5js.org/BarneyCodes/collections/qwCiTya1e)
- [p5.js Reference](https://p5js.org/reference/)
- [lil-gui Documentation](https://lil-gui.georgealways.com/)
- [GLSL Shader Reference](https://www.khronos.org/opengl/wiki/Core_Language_(GLSL))
