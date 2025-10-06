let myFilterShader;
let gui;

const params = {
  regenerate: () => generateComposition(),
  gridDensity: 8,
  primitiveSize: 40,
  radialProbability: 0.7,
  showConstructionLines: true,
  lineWeight: 0.5,
  primitivesPerSection: 12,
  recursionDepth: 2,
  blendOpacity: 50
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
    this.cellW = this.w / this.density;
    this.cellH = this.h / this.density;
    this.usedCells = new Set();
  }
  
  // Получить размер ячейки для привязки размера примитивов
  getCellSize() {
    if (this.isRadial) {
      const maxRadius = min(this.w, this.h) / 2;
      return (maxRadius / this.density) * 1.5;
    } else {
      return min(this.cellW, this.cellH) * 0.9;
    }
  }
  
  // Получить случайную начальную ячейку
  getRandomCell() {
    if (this.isRadial) {
      const rings = this.density;
      const ring = floor(random(rings));
      const pointsInRing = max(6, ring * 6);
      const angleIndex = floor(random(pointsInRing));
      return { ring, angleIndex, pointsInRing };
    } else {
      const col = floor(random(this.density));
      const row = floor(random(this.density));
      return { col, row };
    }
  }
  
  // Получить координаты центра ячейки
  getCellCenter(cell) {
    if (this.isRadial) {
      const centerX = this.x + this.w / 2;
      const centerY = this.y + this.h / 2;
      const maxRadius = min(this.w, this.h) / 2;
      const radius = ((cell.ring + 1) * maxRadius) / this.density;
      const angleStep = TWO_PI / cell.pointsInRing;
      const angle = cell.angleIndex * angleStep;
      
      return {
        x: centerX + cos(angle) * radius,
        y: centerY + sin(angle) * radius
      };
    } else {
      return {
        x: this.x + cell.col * this.cellW + this.cellW / 2,
        y: this.y + cell.row * this.cellH + this.cellH / 2
      };
    }
  }
  
  // Получить соседнюю ячейку
  getNeighboringCell(cell) {
    if (this.isRadial) {
      // Радиальная сетка: соседи = соседнее кольцо или соседний угол
      const choice = random();
      
      if (choice < 0.33 && cell.ring > 0) {
        // Внутреннее кольцо
        const newRing = cell.ring - 1;
        const newPointsInRing = max(6, newRing * 6);
        return {
          ring: newRing,
          angleIndex: floor(random(newPointsInRing)),
          pointsInRing: newPointsInRing
        };
      } else if (choice < 0.66 && cell.ring < this.density - 1) {
        // Внешнее кольцо
        const newRing = cell.ring + 1;
        const newPointsInRing = max(6, newRing * 6);
        return {
          ring: newRing,
          angleIndex: floor(random(newPointsInRing)),
          pointsInRing: newPointsInRing
        };
      } else {
        // Соседний угол на том же кольце
        const offset = random() < 0.5 ? -1 : 1;
        const newAngleIndex = (cell.angleIndex + offset + cell.pointsInRing) % cell.pointsInRing;
        return {
          ring: cell.ring,
          angleIndex: newAngleIndex,
          pointsInRing: cell.pointsInRing
        };
      }
    } else {
      // Типографическая сетка: 4 направления (вверх, вниз, влево, вправо)
      const directions = [
        { col: cell.col - 1, row: cell.row },     // влево
        { col: cell.col + 1, row: cell.row },     // вправо
        { col: cell.col, row: cell.row - 1 },     // вверх
        { col: cell.col, row: cell.row + 1 }      // вниз
      ];
      
      // Фильтруем только валидные соседние ячейки
      const validNeighbors = directions.filter(d => 
        d.col >= 0 && d.col < this.density && 
        d.row >= 0 && d.row < this.density
      );
      
      if (validNeighbors.length > 0) {
        return random(validNeighbors);
      } else {
        return cell; // Если нет соседей, возвращаем текущую
      }
    }
  }
  
  // Получить путь из ячеек (начальная + соседние)
  getCellPath(length = 2) {
    const path = [];
    let currentCell = this.getRandomCell();
    path.push(currentCell);
    
    for (let i = 1; i < length; i++) {
      currentCell = this.getNeighboringCell(currentCell);
      path.push(currentCell);
    }
    
    return path;
  }
}

// Функция генерации композиции в одной секции
function generateSection(sectionX, sectionY, sectionW, sectionH) {
  const grid = new Grid(sectionX, sectionY, sectionW, sectionH, params.gridDensity);
  const numPrimitives = floor(random(8, params.primitivesPerSection));
  const cellSize = grid.getCellSize();
  
  push();
  strokeWeight(params.lineWeight);
  
  // Рисуем конструктивные точки сетки (более заметные)
  if (params.showConstructionLines && grid.isRadial) {
    fill(0);
    noStroke();
    const centerX = sectionX + sectionW / 2;
    const centerY = sectionY + sectionH / 2;
    const maxRadius = min(sectionW, sectionH) / 2;
    
    // Радиальные точки на кольцах
    for (let ring = 0; ring < params.gridDensity; ring++) {
      const radius = ((ring + 1) * maxRadius) / params.gridDensity;
      const pointsInRing = max(6, ring * 6);
      
      for (let i = 0; i < pointsInRing; i++) {
        let angle = i * TWO_PI / pointsInRing;
        let px = centerX + cos(angle) * radius;
        let py = centerY + sin(angle) * radius;
        rectMode(CENTER);
        rect(px, py, 3, 3);
      }
    }
    
    // Центральная точка
    rectMode(CENTER);
    rect(centerX, centerY, 4, 4);
    
    stroke(0);
    noFill();
  } else if (params.showConstructionLines) {
    // Типографическая сетка из квадратных точек
    fill(0);
    noStroke();
    
    for (let i = 0; i <= params.gridDensity; i++) {
      for (let j = 0; j <= params.gridDensity; j++) {
        rectMode(CENTER);
        rect(sectionX + i * grid.cellW, sectionY + j * grid.cellH, 3, 3);
      }
    }
    
    stroke(0);
    noFill();
  }
  
  strokeWeight(params.lineWeight);
  
  // Рисуем примитивы используя новую логику сетки
  for (let i = 0; i < numPrimitives; i++) {
    // Генерируем путь из 1-3 соседних ячеек
    const pathLength = floor(random(1, 4));
    const cellPath = grid.getCellPath(pathLength);
    
    // Рисуем примитив в каждой ячейке пути
    const primitiveName = random(PRIMITIVE_NAMES);
    
    for (let j = 0; j < cellPath.length; j++) {
      const cell = cellPath[j];
      const point = grid.getCellCenter(cell);
      
      // Размер привязан к размеру ячейки с вариацией
      const sizeVariation = random() < 0.3 ? random(0.4, 0.7) : random(0.8, 1.4);
      const primitiveSize = cellSize * sizeVariation;
      
      // Рекурсивное наложение с уменьшением прозрачности
      drawPrimitiveRecursive(primitiveName, point.x, point.y, primitiveSize, params.recursionDepth);
    }
  }
  
  pop();
}

// Рекурсивная функция рисования с наложением
function drawPrimitiveRecursive(primitiveName, x, y, size, depth) {
  if (depth <= 0 || size < 5) return;
  
  // Устанавливаем прозрачность для эффекта смешивания
  const opacity = map(depth, 0, params.recursionDepth, 50, params.blendOpacity);
  stroke(0, 0, 0, opacity);
  
  // Рисуем текущий примитив
  drawPrimitive(primitiveName, x, y, size);
  
  // Рекурсивно рисуем уменьшенные версии со смещением
  if (depth > 1) {
    const newSize = size * 0.7;
    const offset = size * 0.15;
    
    // Случайно выбираем, сколько рекурсивных вызовов делать (1-3)
    const recursiveCalls = floor(random(1, 4));
    
    for (let i = 0; i < recursiveCalls; i++) {
      const angle = random(TWO_PI);
      const newX = x + cos(angle) * offset;
      const newY = y + sin(angle) * offset;
      
      // Иногда меняем примитив для разнообразия
      const newPrimitive = random() < 0.3 ? random(PRIMITIVE_NAMES) : primitiveName;
      
      drawPrimitiveRecursive(newPrimitive, newX, newY, newSize, depth - 1);
    }
  }
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
  gui.add(params, 'gridDensity', 3, 15, 1).name('Grid Density').onChange(() => generateComposition());
  gui.add(params, 'primitivesPerSection', 3, 20, 1).name('Primitives per Section').onChange(() => generateComposition());
  gui.add(params, 'recursionDepth', 0, 4, 1).name('Recursion Depth').onChange(() => generateComposition());
  gui.add(params, 'blendOpacity', 20, 150, 5).name('Blend Opacity').onChange(() => generateComposition());
  gui.add(params, 'radialProbability', 0, 1, 0.1).name('Radial Probability').onChange(() => generateComposition());
  gui.add(params, 'showConstructionLines').name('Show Grid Points').onChange(() => generateComposition());
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
