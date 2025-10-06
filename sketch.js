let myFilterShader;
let gui;
let backgroundImage = null;
let distortedImage = null; 
let canvasAspectRatio = 1; 
let imageScale = 1.0; // Масштаб изображения
let imageOffsetX = 0; // Смещение по X
let imageOffsetY = 0; // Смещение по Y

// Для drag перемещения изображения
let isDraggingImage = false;
let dragStartX = 0;
let dragStartY = 0;
let dragOffsetX = 0;
let dragOffsetY = 0;

// Текст для типографики (разделяется по символу /)
let TEXT_INPUT = "GENERATIVE/GRID/SYSTEM";

// Массив для хранения плашек с текстом
let textBlocks = [];
let draggingBlock = null;
let dragBlockOffsetX = 0;
let dragBlockOffsetY = 0;

// Цветовая палитра
const COLORS = {
  background: '#c9ccb7',      // светло-серо-зеленоватый фон
  lime: '#d8e17b',            // лаймово-жёлтый акцент
  greenGray: '#92b292',       // серо-зеленый квадрат
  orange: '#f05d30',          // оранжево-красный акцент
  warmGray: '#7b7f83',        // тёплый серый
  black: '#1a1a1a',           // чёрный текст
  nearWhite: '#e9eae4'        // почти белый
};

// Палитра для плашек
const PALETTE = ['#c9ccb7', '#d8e17b', '#92b292', '#f05d30', '#7b7f83', '#1a1a1a', '#e9eae4'];


const params = {
  regenerate: () => generateComposition(),
  gridDensity: 8,
  primitiveSize: 40,
  radialProbability: 0.7,
  showConstructionLines: true,
  lineWeight: 0.5,
  primitivesPerSection: 12,
  recursionDepth: 2,
  blendOpacity: 50,
  primitiveSizeMultiplier: 4.0, // Множитель размера примитивов относительно ячеек
  primitiveColor: 'nearWhite',     // Цвет примитивов из палитры
  // Typography params
  showTypography: true,
  typographyText: "GENERATIVE/GRID/SYSTEM",
  blockSizeContrast: 0.5, // Контраст размеров плашек (0 = одинаковые, 1 = максимальный)
  resetTextBlocks: () => {
    textBlocks = [];
    generateComposition();
  },
  // Image transform params
  imageScale: 1.0,
  imageOffsetX: 0,
  imageOffsetY: 0,
  resetImageTransform: () => {
    params.imageScale = 1.0;
    params.imageOffsetX = 0;
    params.imageOffsetY = 0;
    imageScale = 1.0;
    imageOffsetX = 0;
    imageOffsetY = 0;
    generateComposition();
  },
  // Distortion shader params
  useDistortion: true,
  distortionScale1: 0.3,
  distortionScale2: 3.5,
  distortionAmp: 20.0,
  distortionFreqX: 30.0,
  distortionFreqY: 30.0,
  animateDistortion: true
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
  
  // Базовые геометрические формы
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
    const baseSize = this.isRadial 
      ? (min(this.w, this.h) / 2 / this.density) * 1.5
      : min(this.cellW, this.cellH) * 0.9;
    
    // Умножаем на множитель (по умолчанию 4x)
    return baseSize * params.primitiveSizeMultiplier;
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
  
  // Получаем цвет для точек сетки
  const gridColor = COLORS.warmGray;
  
  // Рисуем конструктивные точки сетки (более заметные)
  if (params.showConstructionLines && grid.isRadial) {
    fill(gridColor);
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
    
    noFill();
  } else if (params.showConstructionLines) {
    // Типографическая сетка из квадратных точек
    fill(gridColor);
    noStroke();
    
    for (let i = 0; i <= params.gridDensity; i++) {
      for (let j = 0; j <= params.gridDensity; j++) {
        rectMode(CENTER);
        rect(sectionX + i * grid.cellW, sectionY + j * grid.cellH, 3, 3);
      }
    }
    
    noFill();
  }
  
  // Восстанавливаем цвет примитивов из параметров
  const primitiveColor = COLORS[params.primitiveColor] || COLORS.black;
  stroke(primitiveColor);
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
  stroke(255, 255, 255, opacity);
  
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
  // Если есть изображение, применяем к нему шейдер и сохраняем в буфер
  if (backgroundImage && params.useDistortion) {
    applyShaderToImage();
  }
  
  // Рисуем фоновое изображение
  if (backgroundImage) {
    if (params.useDistortion && distortedImage) {
      // Рисуем искаженное изображение
      image(distortedImage, 0, 0, width, height);
    } else {
      // Рисуем обычное изображение
      drawBackgroundImage();
    }
  } else {
    // Фон из палитры если нет изображения
    background(COLORS.background);
  }
  
  // Получаем цвет примитивов из палитры
  const primitiveColor = COLORS[params.primitiveColor] || COLORS.black;
  stroke(primitiveColor);
  fill(primitiveColor);
  noFill();
  
  const w = width / 2;
  const h = height / 2;
  
  // 4 секции
  generateSection(0, 0, w, h);       // Верхняя левая
  generateSection(w, 0, w, h);       // Верхняя правая
  generateSection(0, h, w, h);       // Нижняя левая
  generateSection(w, h, w, h);       // Нижняя правая
  
  // Рисуем разделительные линии между секциями
  stroke(COLORS.warmGray);
  strokeWeight(0.5);
  line(w, 0, w, height);
  line(0, h, width, h);
  
  // Рисуем типографику поверх всего
  if (params.showTypography && params.typographyText) {
    drawTextBlocks(params.typographyText);
  }
}

// Функция отрисовки типографических блоков
function drawTextBlocks(inputString) {
  if (!inputString || inputString.trim() === '') {
    textBlocks = [];
    return;
  }
  
  // Разбиваем текст по символу /
  const lines = inputString.split('/').map(line => line.trim()).filter(line => line.length > 0);
  if (lines.length === 0) {
    textBlocks = [];
    return;
  }
  
  const nLines = lines.length;
  
  // Если количество строк изменилось или массив пуст - генерируем новые плашки
  if (textBlocks.length !== nLines) {
    textBlocks = [];
    
    lines.forEach((line, i) => {
      // Высота плашки с учетом контраста
      // Базовый размер
      const baseHeight = height / 9;
      // Вариация в зависимости от контраста
      const heightVariation = (height / 8 - height / 10) * params.blockSizeContrast;
      const blockHeight = baseHeight + random(-heightVariation, heightVariation);
      
      // Размер текста (первая строка крупнее, далее меньше)
      const fontSize = i === 0 ? width / 12 : width / (14 + i * 2);
      
      // Позиция по вертикали (равномерно распределяем)
      const yPos = (i + 0.5) * (height / nLines);
      
      // Случайный сдвиг по X (±5% ширины канваса)
      const xShift = random(-width * 0.05, width * 0.05);
      const xPos = width / 2 + xShift;
      
      // Случайный цвет из палитры
      const bgColor = random(PALETTE);
      
      // Генерируем случайные веса шрифта для каждого символа
      const charWeights = [];
      for (let c = 0; c < line.length; c++) {
        charWeights.push(random(['400', '500', '600', '700']));
      }
      
      textBlocks.push({
        text: line,
        x: xPos,
        y: yPos,
        fontSize: fontSize,
        blockHeight: blockHeight,
        bgColor: bgColor,
        padding: random(30, 60),
        charWeights: charWeights
      });
    });
  }
  
  // Настройки шрифта
  textAlign(CENTER, CENTER);
  
  // Рисуем каждую плашку из массива
  textBlocks.forEach((block) => {
    // Измеряем общую ширину текста для плашки
    textFont('PP Mori');
    textSize(block.fontSize);
    const tw = textWidth(block.text);
    const blockWidth = tw + block.padding * 2;
    
    // Сохраняем ширину в объект для проверки клика
    block.width = blockWidth;
    block.height = block.blockHeight;
    
    // Определяем цвет текста (черный или белый) в зависимости от яркости фона
    const bg = color(block.bgColor);
    const bgBrightness = brightness(bg);
    const textColor = bgBrightness > 70 ? '#1a1a1a' : '#e9eae4';
    
    // Рисуем плашку
    push();
    noStroke();
    fill(block.bgColor);
    rectMode(CENTER);
    rect(block.x, block.y, blockWidth, block.blockHeight);
    
    // Рисуем текст посимвольно с разными весами шрифта
    fill(textColor);
    textSize(block.fontSize);
    
    // Вычисляем стартовую позицию для центрированного текста
    const totalWidth = textWidth(block.text);
    let currentX = block.x - totalWidth / 2;
    
    for (let i = 0; i < block.text.length; i++) {
      const char = block.text[i];
      const weight = block.charWeights[i];
      
      // Устанавливаем вес шрифта через drawingContext
      push();
      drawingContext.font = `${weight} ${block.fontSize}px 'PP Mori', sans-serif`;
      textFont('PP Mori');
      
      const charWidth = textWidth(char);
      text(char, currentX + charWidth / 2, block.y);
      currentX += charWidth;
      pop();
    }
    
    pop();
  });
}

// Функция отрисовки типографических блоков для экспорта в HQ
function drawTextBlocksExport(canvas, inputString, scale) {
  if (!inputString || inputString.trim() === '') return;
  
  // Разбиваем текст по символу /
  const lines = inputString.split('/').map(line => line.trim()).filter(line => line.length > 0);
  if (lines.length === 0) return;
  
  const nLines = lines.length;
  const canvasSize = 1600; // HQ размер
  
  // Настройки шрифта
  canvas.textAlign(CENTER, CENTER);
  canvas.textFont('Arial, Helvetica, sans-serif');
  
  // Для каждой строки создаем плашку
  lines.forEach((line, i) => {
    // Случайная высота плашки (от 1/8 до 1/10 высоты канваса)
    const blockHeight = random(canvasSize / 10, canvasSize / 8);
    
    // Размер текста (первая строка крупнее, далее меньше)
    const fontSize = i === 0 ? canvasSize / 12 : canvasSize / (14 + i * 2);
    canvas.textSize(fontSize);
    
    // Измеряем ширину текста для плашки
    const tw = canvas.textWidth(line);
    const padding = random(30, 60) * scale;
    const blockWidth = tw + padding * 2;
    
    // Позиция по вертикали (равномерно распределяем)
    const yPos = (i + 0.5) * (canvasSize / nLines);
    
    // Случайный сдвиг по X (±5% ширины канваса)
    const xShift = random(-canvasSize * 0.05, canvasSize * 0.05);
    const xPos = canvasSize / 2 + xShift;
    
    // Случайный цвет из палитры
    const bgColor = random(PALETTE);
    
    // Определяем цвет текста (черный или белый) в зависимости от яркости фона
    const bg = color(bgColor);
    const bgBrightness = brightness(bg);
    const textColor = bgBrightness > 70 ? '#1a1a1a' : '#e9eae4';
    
    // Рисуем плашку
    canvas.push();
    canvas.noStroke();
    canvas.fill(bgColor);
    canvas.rectMode(CENTER);
    canvas.rect(xPos, yPos, blockWidth, blockHeight);
    
    // Рисуем текст
    canvas.fill(textColor);
    canvas.textStyle(BOLD);
    canvas.text(line, xPos, yPos);
    canvas.pop();
  });
}

// Функция для применения шейдера только к изображению
function applyShaderToImage() {
  // Создаем графический буфер если его нет
  if (!distortedImage) {
    distortedImage = createGraphics(width, height);
  } else if (distortedImage.width !== width || distortedImage.height !== height) {
    distortedImage.resizeCanvas(width, height);
  }
  
  // Рисуем изображение в буфер
  distortedImage.push();
  distortedImage.clear();
  distortedImage.imageMode(CENTER);
  
  const imgAspect = backgroundImage.width / backgroundImage.height;
  const canvasAspect = width / height;
  
  let drawWidth, drawHeight;
  
  if (imgAspect > canvasAspect) {
    drawHeight = height;
    drawWidth = height * imgAspect;
  } else {
    drawWidth = width;
    drawHeight = width / imgAspect;
  }
  
  // Применяем масштаб и смещение
  drawWidth *= imageScale;
  drawHeight *= imageScale;
  
  distortedImage.image(
    backgroundImage, 
    width/2 + imageOffsetX, 
    height/2 + imageOffsetY, 
    drawWidth, 
    drawHeight
  );
  distortedImage.pop();
  
  // Применяем шейдер к буферу
  myFilterShader.setUniform("u_distortionScale1", params.distortionScale1);
  myFilterShader.setUniform("u_distortionScale2", params.distortionScale2);
  myFilterShader.setUniform("u_distortionAmp", params.distortionAmp);
  myFilterShader.setUniform("u_distortionFreqX", params.distortionFreqX);
  myFilterShader.setUniform("u_distortionFreqY", params.distortionFreqY);
  
  if (params.animateDistortion) {
    myFilterShader.setUniform("u_time", millis() / 1000.0);
  } else {
    myFilterShader.setUniform("u_time", 0.0);
  }
  
  distortedImage.filterShader(myFilterShader);
}

// Функция для отрисовки фонового изображения с сохранением aspect ratio
function drawBackgroundImage() {
  push();
  imageMode(CENTER);
  
  const imgAspect = backgroundImage.width / backgroundImage.height;
  const canvasAspect = width / height;
  
  let drawWidth, drawHeight;
  
  // Cover режим - изображение покрывает весь canvas
  if (imgAspect > canvasAspect) {
    // Изображение шире
    drawHeight = height;
    drawWidth = height * imgAspect;
  } else {
    // Изображение выше
    drawWidth = width;
    drawHeight = width / imgAspect;
  }
  
  image(backgroundImage, width/2, height/2, drawWidth, drawHeight);
  pop();
}

// Обработка загрузки изображения
function handleFile(file) {
  if (file.type === 'image') {
    loadImage(file.data, img => {
      backgroundImage = img;
      
      // Canvas всегда остается квадратным 800x800
      // Изображение будет масштабироваться внутри
      
      // Перегенерируем композицию
      generateComposition();
    });
  }
}

// Функция высококачественного экспорта (2x разрешение)
function exportHighQuality() {
  // Создаем временный canvas с удвоенным разрешением
  const exportCanvas = createGraphics(1600, 1600);
  const scale = 2.0; // 2x разрешение
  
  // Сохраняем текущее состояние
  const oldWidth = width;
  const oldHeight = height;
  
  // Временно переключаемся на экспортный canvas
  exportCanvas.pixelDensity(1); // Для точного контроля размера
  
  // === РИСУЕМ ИЗОБРАЖЕНИЕ ===
  if (backgroundImage) {
    if (params.useDistortion) {
      // Создаем буфер для дисторсии в высоком разрешении
      let exportDistorted = createGraphics(1600, 1600);
      exportDistorted.pixelDensity(1);
      
      exportDistorted.push();
      exportDistorted.clear();
      exportDistorted.imageMode(CENTER);
      
      const imgAspect = backgroundImage.width / backgroundImage.height;
      const canvasAspect = 1; // Квадратный canvas
      
      let drawWidth, drawHeight;
      if (imgAspect > canvasAspect) {
        drawHeight = 1600;
        drawWidth = 1600 * imgAspect;
      } else {
        drawWidth = 1600;
        drawHeight = 1600 / imgAspect;
      }
      
      // Применяем масштаб и смещение
      drawWidth *= imageScale;
      drawHeight *= imageScale;
      
      exportDistorted.image(
        backgroundImage, 
        800 + imageOffsetX * scale, 
        800 + imageOffsetY * scale, 
        drawWidth, 
        drawHeight
      );
      exportDistorted.pop();
      
      // Применяем шейдер
      myFilterShader.setUniform("u_distortionScale1", params.distortionScale1);
      myFilterShader.setUniform("u_distortionScale2", params.distortionScale2);
      myFilterShader.setUniform("u_distortionAmp", params.distortionAmp);
      myFilterShader.setUniform("u_distortionFreqX", params.distortionFreqX);
      myFilterShader.setUniform("u_distortionFreqY", params.distortionFreqY);
      myFilterShader.setUniform("u_time", millis() / 1000.0);
      
      exportDistorted.filterShader(myFilterShader);
      exportCanvas.image(exportDistorted, 0, 0);
      exportDistorted.remove();
    } else {
      // Рисуем изображение без шейдера
      exportCanvas.push();
      exportCanvas.imageMode(CENTER);
      
      const imgAspect = backgroundImage.width / backgroundImage.height;
      let drawWidth, drawHeight;
      
      if (imgAspect > 1) {
        drawHeight = 1600;
        drawWidth = 1600 * imgAspect;
      } else {
        drawWidth = 1600;
        drawHeight = 1600 / imgAspect;
      }
      
      drawWidth *= imageScale;
      drawHeight *= imageScale;
      
      exportCanvas.image(
        backgroundImage, 
        800 + imageOffsetX * scale, 
        800 + imageOffsetY * scale, 
        drawWidth, 
        drawHeight
      );
      exportCanvas.pop();
    }
  } else {
    exportCanvas.background(COLORS.background);
  }
  
  // === РИСУЕМ ПРИМИТИВЫ ===
  const primitiveColor = COLORS[params.primitiveColor] || COLORS.nearWhite;
  exportCanvas.stroke(primitiveColor);
  exportCanvas.fill(primitiveColor);
  exportCanvas.noFill();
  
  // Функция для рисования примитива в экспортном canvas
  const drawPrimitiveExport = (name, x, y, size) => {
    const scaledX = x * scale;
    const scaledY = y * scale;
    const scaledSize = size * scale;
    
    exportCanvas.push();
    exportCanvas.strokeWeight(params.lineWeight * scale);
    
    // Вызываем оригинальную функцию примитива, но на экспортном canvas
    const oldP5 = window;
    // Временно подменяем p5 функции
    const originalEllipse = ellipse;
    const originalLine = line;
    const originalRect = rect;
    const originalArc = arc;
    const originalBeginShape = beginShape;
    const originalEndShape = endShape;
    const originalVertex = vertex;
    const originalBezierVertex = bezierVertex;
    const originalQuadraticVertex = quadraticVertex;
    const originalCurveVertex = curveVertex;
    const originalPush = push;
    const originalPop = pop;
    const originalTranslate = translate;
    const originalRotate = rotate;
    const originalNoFill = noFill;
    
    // Переопределяем функции для экспорта
    window.ellipse = (a, b, c, d) => exportCanvas.ellipse(a, b, c, d);
    window.line = (a, b, c, d) => exportCanvas.line(a, b, c, d);
    window.rect = (a, b, c, d) => exportCanvas.rect(a, b, c, d);
    window.arc = (a, b, c, d, e, f, g) => exportCanvas.arc(a, b, c, d, e, f, g);
    window.beginShape = (a) => exportCanvas.beginShape(a);
    window.endShape = (a) => exportCanvas.endShape(a);
    window.vertex = (a, b) => exportCanvas.vertex(a, b);
    window.bezierVertex = (a, b, c, d, e, f) => exportCanvas.bezierVertex(a, b, c, d, e, f);
    window.quadraticVertex = (a, b, c, d) => exportCanvas.quadraticVertex(a, b, c, d);
    window.curveVertex = (a, b) => exportCanvas.curveVertex(a, b);
    window.push = () => exportCanvas.push();
    window.pop = () => exportCanvas.pop();
    window.translate = (a, b) => exportCanvas.translate(a, b);
    window.rotate = (a) => exportCanvas.rotate(a);
    window.noFill = () => exportCanvas.noFill();
    
    PRIMITIVES[name](scaledX, scaledY, scaledSize);
    
    // Восстанавливаем оригинальные функции
    window.ellipse = originalEllipse;
    window.line = originalLine;
    window.rect = originalRect;
    window.arc = originalArc;
    window.beginShape = originalBeginShape;
    window.endShape = originalEndShape;
    window.vertex = originalVertex;
    window.bezierVertex = originalBezierVertex;
    window.quadraticVertex = originalQuadraticVertex;
    window.curveVertex = originalCurveVertex;
    window.push = originalPush;
    window.pop = originalPop;
    window.translate = originalTranslate;
    window.rotate = originalRotate;
    window.noFill = originalNoFill;
    
    exportCanvas.pop();
  };
  
  // Функция для рисования секции в экспорте
  const generateSectionExport = (startX, startY, sectionWidth, sectionHeight) => {
    const useRadial = random() < params.radialProbability;
    const grid = new Grid(startX, startY, sectionWidth, sectionHeight, params.gridDensity, useRadial);
    
    exportCanvas.strokeWeight(params.lineWeight * scale);
    exportCanvas.stroke(COLORS.warmGray);
    
    if (params.showConstructionLines) {
      const points = grid.getAllPoints();
      points.forEach(p => {
        if (useRadial && grid.ring === 0) {
          exportCanvas.rect(p.x * scale - 2 * scale, p.y * scale - 2 * scale, 4 * scale, 4 * scale);
        } else {
          exportCanvas.rect(p.x * scale - 1.5 * scale, p.y * scale - 1.5 * scale, 3 * scale, 3 * scale);
        }
      });
    }
    
    exportCanvas.stroke(primitiveColor);
    
    for (let i = 0; i < params.primitivesPerSection; i++) {
      const cell = grid.getRandomCell();
      const primitiveName = random(PRIMITIVE_NAMES);
      const size = grid.getCellSize();
      
      drawPrimitiveExport(primitiveName, cell.x, cell.y, size);
      
      if (params.recursionDepth > 0) {
        drawPrimitiveRecursiveExport(primitiveName, cell.x, cell.y, size, params.recursionDepth, grid, drawPrimitiveExport);
      }
    }
  };
  
  // Рекурсивная функция для экспорта
  const drawPrimitiveRecursiveExport = (primitiveName, x, y, size, depth, grid, drawFunc) => {
    if (depth <= 0) return;
    
    const neighbors = grid.getNeighboringCell(x, y);
    if (neighbors.length > 0) {
      const neighbor = random(neighbors);
      const newSize = grid.getCellSize();
      const opacity = map(depth, 0, params.recursionDepth, 50, params.blendOpacity);
      
      exportCanvas.push();
      exportCanvas.drawingContext.globalAlpha = opacity / 100;
      
      drawFunc(primitiveName, neighbor.x, neighbor.y, newSize);
      
      exportCanvas.pop();
      
      const newPrimitive = random() < 0.3 ? random(PRIMITIVE_NAMES) : primitiveName;
      drawPrimitiveRecursiveExport(newPrimitive, neighbor.x, neighbor.y, newSize, depth - 1, grid, drawFunc);
    }
  };
  
  // Рисуем 4 секции
  const w = 1600 / 2;
  const h = 1600 / 2;
  
  generateSectionExport(0, 0, w, h);
  generateSectionExport(w, 0, w, h);
  generateSectionExport(0, h, w, h);
  generateSectionExport(w, h, w, h);
  
  // Разделительные линии
  exportCanvas.stroke(COLORS.warmGray);
  exportCanvas.strokeWeight(0.5 * scale);
  exportCanvas.line(w, 0, w, 1600);
  exportCanvas.line(0, h, 1600, h);
  
  // Рисуем типографику для экспорта
  if (params.showTypography && params.typographyText) {
    drawTextBlocksExport(exportCanvas, params.typographyText, scale);
  }
  
  // Сохраняем
  saveCanvas(exportCanvas, 'generative_grid_HQ', 'png');
  
  // Удаляем временный canvas
  exportCanvas.remove();
  
  console.log('High-quality export (1600x1600) saved!');
}

// Функция для сброса изображения
function clearBackgroundImage() {
  backgroundImage = null;
  // Canvas уже квадратный 800x800, не меняем размер
  
  // Сбрасываем трансформацию изображения
  imageScale = 1.0;
  imageOffsetX = 0;
  imageOffsetY = 0;
  params.imageScale = 1.0;
  params.imageOffsetX = 0;
  params.imageOffsetY = 0;
  
  cursor('pointer');
  generateComposition();
}

function preload() {
  // Load the filter shader
  myFilterShader = loadShader("filter.vert", "filter.frag");
}

function setup() {
  createCanvas(800, 800);
  
  // Включаем drag and drop для изображений
  let canvas = document.querySelector('canvas');
  
  canvas.addEventListener('dragenter', (e) => {
    e.preventDefault();
    e.stopPropagation();
    canvas.classList.add('dragover');
  });
  
  canvas.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    canvas.classList.remove('dragover');
  });
  
  canvas.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
  
  canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    canvas.classList.remove('dragover');
    
    if (e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          handleFile({ type: 'image', data: event.target.result });
        };
        reader.readAsDataURL(file);
      }
    }
  });
  
  // Setup lil-gui
  gui = new lil.GUI();
  
  // Image controls
  const imgFolder = gui.addFolder('Image');
  imgFolder.add({ loadImage: () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          handleFile({ type: 'image', data: event.target.result });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }}, 'loadImage').name('📁 Load Image');
  
  imgFolder.add({ clearImage: clearBackgroundImage }, 'clearImage').name('🗑️ Clear Image');
  imgFolder.add({ exportHQ: exportHighQuality }, 'exportHQ').name('💾 Export HQ (2x)');
  imgFolder.add(params, 'imageScale', 0.1, 3, 0.05).name('🔍 Scale').onChange((value) => {
    imageScale = value;
    generateComposition();
  });
  imgFolder.add(params, 'imageOffsetX', -width, width, 5).name('↔️ Offset X').onChange((value) => {
    imageOffsetX = value;
    generateComposition();
  });
  imgFolder.add(params, 'imageOffsetY', -height, height, 5).name('↕️ Offset Y').onChange((value) => {
    imageOffsetY = value;
    generateComposition();
  });
  imgFolder.add(params, 'resetImageTransform').name('🔄 Reset Transform');
  imgFolder.open();
  
  // Composition controls
  const compFolder = gui.addFolder('Composition');
  compFolder.add(params, 'regenerate').name('🔄 Regenerate');
  compFolder.add(params, 'gridDensity', 3, 15, 1).name('Grid Density').onChange(() => generateComposition());
  compFolder.add(params, 'primitiveSizeMultiplier', 1, 8, 0.5).name('Primitive Scale').onChange(() => generateComposition());
  compFolder.add(params, 'primitivesPerSection', 3, 20, 1).name('Primitives per Section').onChange(() => generateComposition());
  compFolder.add(params, 'recursionDepth', 0, 4, 1).name('Recursion Depth').onChange(() => generateComposition());
  compFolder.add(params, 'blendOpacity', 20, 150, 5).name('Blend Opacity').onChange(() => generateComposition());
  compFolder.add(params, 'radialProbability', 0, 1, 0.1).name('Radial Probability').onChange(() => generateComposition());
  compFolder.add(params, 'showConstructionLines').name('Show Grid Points').onChange(() => generateComposition());
  compFolder.add(params, 'lineWeight', 0.2, 2, 0.1).name('Line Weight').onChange(() => generateComposition());
  compFolder.add(params, 'primitiveColor', ['black', 'orange', 'lime', 'greenGray', 'warmGray', 'nearWhite']).name('Primitive Color').onChange(() => generateComposition());
  compFolder.open();
  
  // Typography controls
  const typoFolder = gui.addFolder('Typography');
  typoFolder.add(params, 'showTypography').name('✏️ Show Typography').onChange(() => generateComposition());
  typoFolder.add(params, 'typographyText').name('📝 Text (use /)').onChange((value) => {
    TEXT_INPUT = value;
    textBlocks = []; // Сбрасываем плашки при изменении текста
    generateComposition();
  });
  typoFolder.add(params, 'blockSizeContrast', 0, 1, 0.05).name('📏 Size Contrast').onChange(() => {
    textBlocks = []; // Пересоздаем плашки с новыми размерами
    generateComposition();
  });
  typoFolder.add(params, 'resetTextBlocks').name('🔄 Reset Positions');
  typoFolder.open();
  
  // Distortion shader controls
  const distFolder = gui.addFolder('Distortion Effect');
  distFolder.add(params, 'useDistortion').name('Enable Distortion');
  distFolder.add(params, 'animateDistortion').name('Animate');
  distFolder.add(params, 'distortionAmp', 0, 50, 0.5).name('Amplitude');
  distFolder.add(params, 'distortionScale1', 0.1, 2, 0.05).name('Scale 1');
  distFolder.add(params, 'distortionScale2', 0.5, 10, 0.1).name('Scale 2');
  distFolder.add(params, 'distortionFreqX', 1, 100, 1).name('Frequency X');
  distFolder.add(params, 'distortionFreqY', 1, 100, 1).name('Frequency Y');
  distFolder.open();
  
  // Первая генерация
  generateComposition();
}

function draw() {
  // Если анимация дисторсии включена и есть изображение, перерисовываем
  if (params.animateDistortion && params.useDistortion && backgroundImage) {
    generateComposition();
  }
}

function mousePressed() {
  // Проверяем клик на плашку с текстом (проверяем в обратном порядке - сверху вниз)
  if (params.showTypography && textBlocks.length > 0) {
    for (let i = textBlocks.length - 1; i >= 0; i--) {
      const block = textBlocks[i];
      // Проверяем попадание в прямоугольник плашки
      if (mouseX > block.x - block.width / 2 && 
          mouseX < block.x + block.width / 2 &&
          mouseY > block.y - block.height / 2 && 
          mouseY < block.y + block.height / 2) {
        draggingBlock = block;
        dragBlockOffsetX = mouseX - block.x;
        dragBlockOffsetY = mouseY - block.y;
        cursor('grabbing');
        return false;
      }
    }
  }
  
  // Начинаем перемещение изображения только если есть изображение и нажата левая кнопка мыши
  if (backgroundImage && mouseButton === LEFT) {
    isDraggingImage = true;
    dragStartX = mouseX;
    dragStartY = mouseY;
    dragOffsetX = imageOffsetX;
    dragOffsetY = imageOffsetY;
    cursor('grabbing');
    return false; // Предотвращаем стандартное поведение
  }
}

function mouseDragged() {
  // Перемещаем плашку если она выбрана
  if (draggingBlock) {
    draggingBlock.x = mouseX - dragBlockOffsetX;
    draggingBlock.y = mouseY - dragBlockOffsetY;
    generateComposition();
    return false;
  }
  
  // Перемещаем изображение если активен drag
  if (isDraggingImage && backgroundImage) {
    const deltaX = mouseX - dragStartX;
    const deltaY = mouseY - dragStartY;
    
    imageOffsetX = dragOffsetX + deltaX;
    imageOffsetY = dragOffsetY + deltaY;
    
    // Обновляем параметры GUI
    params.imageOffsetX = imageOffsetX;
    params.imageOffsetY = imageOffsetY;
    
    generateComposition();
    return false;
  }
}

function mouseReleased() {
  // Завершаем перемещение плашки
  if (draggingBlock) {
    draggingBlock = null;
    cursor('auto');
    return false;
  }
  
  // Завершаем перемещение изображения
  if (isDraggingImage) {
    isDraggingImage = false;
    cursor(backgroundImage ? 'grab' : 'pointer');
  }
}

function mouseMoved() {
  // Проверяем наведение на плашку с текстом
  if (params.showTypography && textBlocks.length > 0) {
    let overBlock = false;
    for (let i = textBlocks.length - 1; i >= 0; i--) {
      const block = textBlocks[i];
      if (mouseX > block.x - block.width / 2 && 
          mouseX < block.x + block.width / 2 &&
          mouseY > block.y - block.height / 2 && 
          mouseY < block.y + block.height / 2) {
        cursor('grab');
        overBlock = true;
        return;
      }
    }
    if (!overBlock && !isDraggingImage && !draggingBlock) {
      cursor(backgroundImage ? 'grab' : 'auto');
    }
  } else {
    // Меняем курсор в зависимости от наличия изображения
    if (backgroundImage && !isDraggingImage && !draggingBlock) {
      cursor('grab');
    } else if (!isDraggingImage && !draggingBlock) {
      cursor('auto');
    }
  }
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
  
  // Нажмите 'r' для сброса трансформации изображения
  if ((key === 'r' || key === 'R') && backgroundImage) {
    params.resetImageTransform();
  }
}
