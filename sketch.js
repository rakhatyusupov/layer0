let myFilterShader;
let gui;

// GUI parameters
const params = {
  saturation: 1.0,
  brightness: 1.0,
  contrast: 1.0,
  colorTint: {
    r: 1.0,
    g: 1.0,
    b: 1.0
  },
  rotationSpeed: 1.0
};

let angle = 0;

function preload() {
  // Load the filter shader
  myFilterShader = loadShader("filter.vert", "filter.frag");
}

function setup() {
  createCanvas(800, 600, WEBGL);
  
  // Setup lil-gui
  gui = new lil.GUI();
  
  // Add controls
  gui.add(params, 'saturation', 0, 2).name('Saturation');
  gui.add(params, 'brightness', 0, 2).name('Brightness');
  gui.add(params, 'contrast', 0, 3).name('Contrast');
  
  const colorFolder = gui.addFolder('Color Tint');
  colorFolder.add(params.colorTint, 'r', 0, 1).name('Red');
  colorFolder.add(params.colorTint, 'g', 0, 1).name('Green');
  colorFolder.add(params.colorTint, 'b', 0, 1).name('Blue');
  colorFolder.open();
  
  gui.add(params, 'rotationSpeed', 0, 5).name('Rotation Speed');
}

function draw() {
  // Clear background
  background(20);
  
  // Enable lights for better 3D appearance
  ambientLight(60);
  directionalLight(255, 255, 255, 0.5, 0.5, -1);
  
  // Draw some animated 3D shapes
  push();
  rotateX(angle * 0.7);
  rotateY(angle);
  
  // Draw multiple boxes
  for (let i = 0; i < 5; i++) {
    push();
    translate(
      sin(angle + i) * 150,
      cos(angle + i * 0.5) * 100,
      sin(angle * 0.3 + i) * 50
    );
    
    // Colorful boxes
    fill(
      map(sin(angle + i), -1, 1, 100, 255),
      map(cos(angle + i * 1.5), -1, 1, 100, 255),
      map(sin(angle * 2 + i), -1, 1, 100, 255)
    );
    
    box(80);
    pop();
  }
  pop();
  
  // Draw a torus in the center
  push();
  rotateX(angle * 0.5);
  rotateZ(angle * 0.3);
  fill(255, 100, 150);
  torus(100, 30);
  pop();
  
  // Update rotation
  angle += 0.01 * params.rotationSpeed;
  
  // Set shader uniforms from GUI parameters
  myFilterShader.setUniform("u_saturation", params.saturation);
  myFilterShader.setUniform("u_brightness", params.brightness);
  myFilterShader.setUniform("u_contrast", params.contrast);
  myFilterShader.setUniform("u_colorTint", [
    params.colorTint.r,
    params.colorTint.g,
    params.colorTint.b
  ]);
  
  // Apply the filter shader
  filterShader(myFilterShader);
}
