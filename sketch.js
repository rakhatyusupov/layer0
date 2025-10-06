let myFilterShader;
let gui;

const params = {
  regenerate: () => generateComposition(),
  gridDensity: 8,
  primitiveSize: 40,
  radialProbability: 0.7,
  showConstructionLines: true,
  lineWeight: 0.5,
  primitivesPerSection: 12
};

// Словарь примитивов
const PRIMITIVES = {
  // Базовые формы
  circle: function(x, y, size) {
    noFill();
    ellipse(x, y, size, size);
  },
  
  // ЭЛЛИПСЫ И ФИГУРЫ ВТОРОГО ПОРЯДКА
  ellipse_horizontal: function(x, y, size) {
    noFill();
    ellipse(x, y, size * 1.5, size);
  },
  
  ellipse_vertical: function(x, y, size) {
    noFill();
    ellipse(x, y, size, size * 1.5);
  },
  
  ellipse_rotated_45: function(x, y, size) {
    push();
    translate(x, y);
    rotate(QUARTER_PI);
    noFill();
    ellipse(0, 0, size * 1.4, size * 0.8);
    pop();
  },
  
  ellipse_thin_horizontal: function(x, y, size) {
    noFill();
    ellipse(x, y, size * 2, size * 0.5);
  },
  
  ellipse_thin_vertical: function(x, y, size) {
    noFill();
    ellipse(x, y, size * 0.5, size * 2);
  },
  
  // Концентрические окружности
  concentric_circles: function(x, y, size) {
    noFill();
    for (let i = 1; i <= 3; i++) {
      ellipse(x, y, size * i / 3, size * i / 3);
    }
  },
  
  // Концентрические эллипсы
  concentric_ellipses_h: function(x, y, size) {
    noFill();
    for (let i = 1; i <= 3; i++) {
      ellipse(x, y, size * 1.5 * i / 3, size * i / 3);
    }
  },
  
  // Касательные окружности
  tangent_circles: function(x, y, size) {
    noFill();
    const r = size / 4;
    ellipse(x - r, y, r * 2, r * 2);
    ellipse(x + r, y, r * 2, r * 2);
  },
  
  // Вписанные окружности
  inscribed_circles: function(x, y, size) {
    noFill();
    ellipse(x, y, size, size);
    ellipse(x, y, size * 0.6, size * 0.6);
    ellipse(x, y, size * 0.3, size * 0.3);
  },
  
  // Пересекающиеся окружности (Vesica Piscis)
  vesica_piscis: function(x, y, size) {
    noFill();
    const offset = size / 4;
    ellipse(x - offset, y, size, size);
    ellipse(x + offset, y, size, size);
  },
  
  // Парабола (аппроксимация)
  parabola: function(x, y, size) {
    noFill();
    beginShape();
    for (let i = -10; i <= 10; i++) {
      let px = x + i * size / 20;
      let py = y + (i * i) * size / 200;
      vertex(px, py);
    }
    endShape();
  },
  
  // Гипербола (аппроксимация)
  hyperbola: function(x, y, size) {
    noFill();
    beginShape();
    for (let i = 5; i <= 15; i++) {
      let px = x + i * size / 30;
      let py = y + size / (i / 5);
      vertex(px, py);
    }
    endShape();
  },
  
  square: function(x, y, size) {
    noFill();
    rectMode(CENTER);
    rect(x, y, size, size);
  },
  
  rectangle_h: function(x, y, size) {
    noFill();
    rectMode(CENTER);
    rect(x, y, size * 1.6, size * 0.6);
  },
  
  rectangle_v: function(x, y, size) {
    noFill();
    rectMode(CENTER);
    rect(x, y, size * 0.6, size * 1.6);
  },
  
  // Квадрат с вписанной окружностью
  square_inscribed_circle: function(x, y, size) {
    noFill();
    rectMode(CENTER);
    rect(x, y, size, size);
    ellipse(x, y, size, size);
  },
  
  // Квадрат с описанной окружностью
  square_circumscribed_circle: function(x, y, size) {
    noFill();
    rectMode(CENTER);
    rect(x, y, size, size);
    ellipse(x, y, size * 1.414, size * 1.414);
  },
  
  triangle: function(x, y, size) {
    noFill();
    const h = size * 0.866;
    triangle(x, y - h/2, x - size/2, y + h/2, x + size/2, y + h/2);
  },
  
  // Линии
  line_horizontal: function(x, y, size) {
    line(x - size/2, y, x + size/2, y);
  },
  
  line_vertical: function(x, y, size) {
    line(x, y - size/2, x, y + size/2);
  },
  
  // Линия с засечками (технический чертеж)
  construction_line_h: function(x, y, size) {
    line(x - size/2, y, x + size/2, y);
    line(x - size/2, y - 3, x - size/2, y + 3);
    line(x + size/2, y - 3, x + size/2, y + 3);
  },
  
  construction_line_v: function(x, y, size) {
    line(x, y - size/2, x, y + size/2);
    line(x - 3, y - size/2, x + 3, y - size/2);
    line(x - 3, y + size/2, x + 3, y + size/2);
  },
  
  cross: function(x, y, size) {
    line(x - size/2, y, x + size/2, y);
    line(x, y - size/2, x, y + size/2);
  },
  
  ring: function(x, y, size) {
    noFill();
    ellipse(x, y, size, size);
  },
  
  dot: function(x, y, size) {
    fill(0);
    ellipse(x, y, size * 0.15, size * 0.15);
    noFill();
  },
  
  // Точка с крестом (центр построения)
  center_mark: function(x, y, size) {
    fill(0);
    ellipse(x, y, size * 0.1, size * 0.1);
    noFill();
    line(x - size * 0.3, y, x + size * 0.3, y);
    line(x, y - size * 0.3, x, y + size * 0.3);
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
  
  // Дуги и секторы
  arc_tl: function(x, y, size) {
    noFill();
    arc(x, y, size, size, PI, PI + HALF_PI);
  },
  
  arc_tr: function(x, y, size) {
    noFill();
    arc(x, y, size, size, -HALF_PI, 0);
  },
  
  arc_bl: function(x, y, size) {
    noFill();
    arc(x, y, size, size, HALF_PI, PI);
  },
  
  arc_br: function(x, y, size) {
    noFill();
    arc(x, y, size, size, 0, HALF_PI);
  },
  
  semicircle_top: function(x, y, size) {
    noFill();
    arc(x, y, size, size, PI, TWO_PI);
  },
  
  semicircle_bottom: function(x, y, size) {
    noFill();
    arc(x, y, size, size, 0, PI);
  },
  
  semicircle_left: function(x, y, size) {
    noFill();
    arc(x, y, size, size, HALF_PI, PI + HALF_PI);
  },
  
  semicircle_right: function(x, y, size) {
    noFill();
    arc(x, y, size, size, -HALF_PI, HALF_PI);
  },
  
  // Радиальные линии (как на референсе)
  radial_lines_4: function(x, y, size) {
    for (let i = 0; i < 4; i++) {
      let angle = i * HALF_PI;
      line(x, y, x + cos(angle) * size/2, y + sin(angle) * size/2);
    }
  },
  
  radial_lines_6: function(x, y, size) {
    for (let i = 0; i < 6; i++) {
      let angle = i * TWO_PI / 6;
      line(x, y, x + cos(angle) * size/2, y + sin(angle) * size/2);
    }
  },
  
  radial_lines_8: function(x, y, size) {
    for (let i = 0; i < 8; i++) {
      let angle = i * TWO_PI / 8;
      line(x, y, x + cos(angle) * size/2, y + sin(angle) * size/2);
    }
  },
  
  // Спираль (как на референсе)
  spiral: function(x, y, size) {
    noFill();
    beginShape();
    for (let i = 0; i < 100; i++) {
      let angle = i * 0.3;
      let r = size * i / 200;
      vertex(x + cos(angle) * r, y + sin(angle) * r);
    }
    endShape();
  },
  
  // Звезда
  star_5: function(x, y, size) {
    noFill();
    beginShape();
    for (let i = 0; i < 10; i++) {
      let angle = i * TWO_PI / 10 - HALF_PI;
      let r = i % 2 === 0 ? size/2 : size/4;
      vertex(x + cos(angle) * r, y + sin(angle) * r);
    }
    endShape(CLOSE);
  },
  
  // Шестиугольник
  hexagon: function(x, y, size) {
    noFill();
    beginShape();
    for (let i = 0; i < 6; i++) {
      let angle = i * TWO_PI / 6;
      vertex(x + cos(angle) * size/2, y + sin(angle) * size/2);
    }
    endShape(CLOSE);
  },
  
  // Восьмиугольник
  octagon: function(x, y, size) {
    noFill();
    beginShape();
    for (let i = 0; i < 8; i++) {
      let angle = i * TWO_PI / 8;
      vertex(x + cos(angle) * size/2, y + sin(angle) * size/2);
    }
    endShape(CLOSE);
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
  const numPrimitives = floor(random(8, params.primitivesPerSection));
  
  push();
  strokeWeight(params.lineWeight);
  
  // Рисуем конструктивные линии сетки (если включено)
  if (params.showConstructionLines && grid.isRadial) {
    stroke(0, 0, 0, 30);
    const centerX = sectionX + sectionW / 2;
    const centerY = sectionY + sectionH / 2;
    const maxRadius = min(sectionW, sectionH) / 2;
    
    // Радиальные круги
    for (let i = 1; i <= params.gridDensity; i++) {
      noFill();
      ellipse(centerX, centerY, (maxRadius * 2 * i) / params.gridDensity, (maxRadius * 2 * i) / params.gridDensity);
    }
    
    // Радиальные лучи
    for (let i = 0; i < 12; i++) {
      let angle = i * TWO_PI / 12;
      line(centerX, centerY, centerX + cos(angle) * maxRadius, centerY + sin(angle) * maxRadius);
    }
    
    stroke(0);
  } else if (params.showConstructionLines) {
    // Типографическая сетка
    stroke(0, 0, 0, 20);
    const cellW = sectionW / params.gridDensity;
    const cellH = sectionH / params.gridDensity;
    
    for (let i = 0; i <= params.gridDensity; i++) {
      line(sectionX + i * cellW, sectionY, sectionX + i * cellW, sectionY + sectionH);
      line(sectionX, sectionY + i * cellH, sectionX + sectionW, sectionY + i * cellH);
    }
    
    stroke(0);
  }
  
  strokeWeight(params.lineWeight);
  
  // Рисуем примитивы
  for (let i = 0; i < numPrimitives; i++) {
    const point = grid.getRandomPoint();
    const primitiveName = random(PRIMITIVE_NAMES);
    const sizeVariation = random(0.5, 1.5);
    drawPrimitive(primitiveName, point.x, point.y, params.primitiveSize * sizeVariation);
  }
  
  pop();
}

// Главная функция генерации композиции
function generateComposition() {
  background(255);
  stroke(0);
  fill(0);
  noFill();
  
  const w = width / 2;
  const h = height / 2;
  
  // 4 секции
  generateSection(0, 0, w, h);       // Верхняя левая
  generateSection(w, 0, w, h);       // Верхняя правая
  generateSection(0, h, w, h);       // Нижняя левая
  generateSection(w, h, w, h);       // Нижняя правая
  
  // Рисуем разделительные линии между секциями
  stroke(150);
  strokeWeight(0.5);
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
  gui.add(params, 'gridDensity', 3, 12, 1).name('Grid Density').onChange(() => generateComposition());
  gui.add(params, 'primitiveSize', 20, 80, 1).name('Primitive Size').onChange(() => generateComposition());
  gui.add(params, 'primitivesPerSection', 5, 25, 1).name('Primitives per Section').onChange(() => generateComposition());
  gui.add(params, 'radialProbability', 0, 1, 0.1).name('Radial Probability').onChange(() => generateComposition());
  gui.add(params, 'showConstructionLines').name('Show Grid Lines').onChange(() => generateComposition());
  gui.add(params, 'lineWeight', 0.2, 2, 0.1).name('Line Weight').onChange(() => generateComposition());
  
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
