let myFilterShader;
let gui;

const params = {
  regenerate: () => generateComposition(),
  gridDensity: 8,
  primitiveSize: 20,
  radialProbability: 0.5
};

// Словарь примитивов
const PRIMITIVES = {
  circle: function(x, y, size) {
    ellipse(x, y, size, size);
  },
  
  square: function(x, y, size) {
    rectMode(CENTER);
    rect(x, y, size, size);
  },
  
  triangle: function(x, y, size) {
    const h = size * 0.866; // высота равностороннего треугольника
    triangle(x, y - h/2, x - size/2, y + h/2, x + size/2, y + h/2);
  },
  
  line_horizontal: function(x, y, size) {
    line(x - size/2, y, x + size/2, y);
  },
  
  line_vertical: function(x, y, size) {
    line(x, y - size/2, x, y + size/2);
  },
  
  cross: function(x, y, size) {
    line(x - size/2, y, x + size/2, y);
    line(x, y - size/2, x, y + size/2);
  },
  
  ring: function(x, y, size) {
    noFill();
    strokeWeight(2);
    ellipse(x, y, size, size);
    fill(0);
    strokeWeight(1);
  },
  
  dot: function(x, y, size) {
    ellipse(x, y, size * 0.3, size * 0.3);
  },
  
  diagonal_tl_br: function(x, y, size) {
    line(x - size/2, y - size/2, x + size/2, y + size/2);
  },
  
  diagonal_tr_bl: function(x, y, size) {
    line(x + size/2, y - size/2, x - size/2, y + size/2);
  },
  
  x_shape: function(x, y, size) {
    line(x - size/2, y - size/2, x + size/2, y + size/2);
    line(x + size/2, y - size/2, x - size/2, y + size/2);
  },
  
  arc_tl: function(x, y, size) {
    noFill();
    strokeWeight(2);
    arc(x, y, size, size, PI, PI + HALF_PI);
    fill(0);
    strokeWeight(1);
  },
  
  arc_tr: function(x, y, size) {
    noFill();
    strokeWeight(2);
    arc(x, y, size, size, -HALF_PI, 0);
    fill(0);
    strokeWeight(1);
  },
  
  arc_bl: function(x, y, size) {
    noFill();
    strokeWeight(2);
    arc(x, y, size, size, HALF_PI, PI);
    fill(0);
    strokeWeight(1);
  },
  
  arc_br: function(x, y, size) {
    noFill();
    strokeWeight(2);
    arc(x, y, size, size, 0, HALF_PI);
    fill(0);
    strokeWeight(1);
  }
};

// Массив имен примитивов для рандомного выбора
const PRIMITIVE_NAMES = Object.keys(PRIMITIVES);

// Функция вызова примитива
function drawPrimitive(primitiveName, x, y, size) {
  if (PRIMITIVES[primitiveName]) {
    PRIMITIVES[primitiveName](x, y, size);
  }
}

// Класс для генерации сетки
class Grid {
  constructor(x, y, w, h, density) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.density = density;
    this.isRadial = random() < params.radialProbability;
  }
  
  // Получить рандомную точку из сетки
  getRandomPoint() {
    if (this.isRadial) {
      return this.getRadialPoint();
    } else {
      return this.getTypographicPoint();
    }
  }
  
  // Типографическая сетка
  getTypographicPoint() {
    const cellW = this.w / this.density;
    const cellH = this.h / this.density;
    
    const col = floor(random(this.density));
    const row = floor(random(this.density));
    
    return {
      x: this.x + col * cellW + cellW / 2,
      y: this.y + row * cellH + cellH / 2
    };
  }
  
  // Радиальная сетка
  getRadialPoint() {
    const centerX = this.x + this.w / 2;
    const centerY = this.y + this.h / 2;
    const maxRadius = min(this.w, this.h) / 2;
    
    const rings = this.density;
    const ring = floor(random(rings));
    const radius = (ring + 1) * (maxRadius / rings);
    
    const pointsInRing = max(6, ring * 6);
    const angleStep = TWO_PI / pointsInRing;
    const angle = floor(random(pointsInRing)) * angleStep;
    
    return {
      x: centerX + cos(angle) * radius,
      y: centerY + sin(angle) * radius
    };
  }
}

// Функция генерации композиции в одной секции
function generateSection(sectionX, sectionY, sectionW, sectionH) {
  const grid = new Grid(sectionX, sectionY, sectionW, sectionH, params.gridDensity);
  const numPrimitives = floor(random(5, 15));
  
  push();
  // Ограничиваем рисование областью секции
  
  for (let i = 0; i < numPrimitives; i++) {
    const point = grid.getRandomPoint();
    const primitiveName = random(PRIMITIVE_NAMES);
    drawPrimitive(primitiveName, point.x, point.y, params.primitiveSize);
  }
  
  pop();
}

// Главная функция генерации композиции
function generateComposition() {
  background(255);
  stroke(0);
  fill(0);
  strokeWeight(1);
  
  const w = width / 2;
  const h = height / 2;
  
  // 4 секции
  generateSection(0, 0, w, h);       // Верхняя левая
  generateSection(w, 0, w, h);       // Верхняя правая
  generateSection(0, h, w, h);       // Нижняя левая
  generateSection(w, h, w, h);       // Нижняя правая
  
  // Рисуем разделительные линии
  stroke(200);
  line(w, 0, w, height);
  line(0, h, width, h);
  stroke(0);
}

function preload() {
  // Load the filter shader
  myFilterShader = loadShader("filter.vert", "filter.frag");
}

function setup() {
  createCanvas(800, 800);
  
  // Setup lil-gui
  gui = new lil.GUI();
  
  gui.add(params, 'regenerate').name('🔄 Regenerate');
  gui.add(params, 'gridDensity', 4, 16, 1).name('Grid Density').onChange(() => generateComposition());
  gui.add(params, 'primitiveSize', 10, 50, 1).name('Primitive Size').onChange(() => generateComposition());
  gui.add(params, 'radialProbability', 0, 1, 0.1).name('Radial Probability').onChange(() => generateComposition());
  
  // Первая генерация
  generateComposition();
}

function draw() {
  // Статичная композиция, не перерисовываем каждый фрейм
  // Можно раскомментировать для применения фильтра
  // filterShader(myFilterShader);
}

function keyPressed() {
  // Нажмите пробел для регенерации
  if (key === ' ') {
    generateComposition();
  }
  
  // Нажмите 's' для сохранения
  if (key === 's' || key === 'S') {
    saveCanvas('generative_grid', 'png');
  }
}
