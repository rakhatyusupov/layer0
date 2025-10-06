# 📝 Changelog - Image Transform Update

## Новые возможности ✨

### 1. 🔍 Масштабирование изображения через слайдер
- **Scale slider** (0.1 - 3.0) в GUI → Image
- Увеличение/уменьшение от 10% до 300%
- По умолчанию: 1.0 (100%)
- Автоматическое обновление композиции

### 2. 🖱️ Drag & Drop перемещение изображения
- Зажмите левую кнопку мыши на canvas
- Перетаскивайте изображение в любом направлении
- Курсор меняется: `grab` → `grabbing`
- Плавное перемещение в реальном времени

### 3. ↔️↕️ Точная настройка позиции через слайдеры
- **Offset X** - горизонтальное смещение
- **Offset Y** - вертикальное смещение
- Диапазон: от -width до +width (от -height до +height)
- Шаг: 5px для точного контроля

### 4. 🔄 Сброс трансформации
- Кнопка **Reset Transform** в GUI
- Горячая клавиша **R**
- Возврат к: Scale = 1.0, Offset X = 0, Offset Y = 0

### 5. 🎯 Синхронизация drag и sliders
- Drag обновляет слайдеры автоматически
- Слайдеры обновляют позицию изображения
- Двусторонняя синхронизация в реальном времени

## Технические изменения 🔧

### Добавленные переменные:
```javascript
let imageScale = 1.0;        // Масштаб изображения
let imageOffsetX = 0;        // Смещение по X
let imageOffsetY = 0;        // Смещение по Y
let isDraggingImage = false; // Флаг drag состояния
let dragStartX/Y = 0;        // Начальная точка drag
let dragOffsetX/Y = 0;       // Offset на момент начала drag
```

### Новые параметры в params:
```javascript
imageScale: 1.0,
imageOffsetX: 0,
imageOffsetY: 0,
resetImageTransform: () => { ... }
```

### Обновлённые функции:
- `applyShaderToImage()` - теперь применяет scale и offset
- `clearBackgroundImage()` - сбрасывает трансформацию
- `draw()` - без изменений
- `generateComposition()` - использует transform параметры

### Новые функции:
```javascript
mousePressed()   // Начало drag
mouseDragged()   // Перемещение при drag
mouseReleased()  // Окончание drag
mouseMoved()     // Изменение курсора
```

### GUI обновления:
- 4 новых контрола в Image папке:
  - Scale slider (0.1-3, step 0.05)
  - Offset X slider (динамический диапазон)
  - Offset Y slider (динамический диапазон)
  - Reset Transform button

### HTML/CSS изменения:
- Добавлен `user-select: none` для canvas
- Курсор меняется динамически (pointer → grab → grabbing)

## Использование 📖

### Базовый workflow:
```javascript
1. Загрузите изображение (drag & drop или кнопка)
2. Настройте масштаб через Scale slider
3. Переместите drag'ом мыши или через Offset слайдеры
4. Regenerate композицию (пробел)
5. Сброс при необходимости (R или Reset Transform)
```

### Координаты трансформации:
```javascript
// В applyShaderToImage():
drawWidth *= imageScale;
drawHeight *= imageScale;

distortedImage.image(
  backgroundImage,
  width/2 + imageOffsetX,  // Центр + offset
  height/2 + imageOffsetY,
  drawWidth,
  drawHeight
);
```

## Документация 📚

### Новые файлы:
- **IMAGE_TRANSFORM.md** - Полное руководство по трансформации
- **HOW_TO_USE.md** - Практические примеры использования

### Обновлённые файлы:
- **README.md** - Добавлена секция Image controls
- **QUICKSTART.md** - Обновлены горячие клавиши и примеры

## Обратная совместимость ✅

- Все старые параметры работают без изменений
- Дефолтные значения = поведению до обновления
- Существующие композиции генерируются идентично
- Шейдер применяется к трансформированному изображению

## Производительность ⚡

- Drag очень отзывчивый (перерисовка в реальном времени)
- Нет задержек при изменении слайдеров
- Трансформация не влияет на рендеринг примитивов
- Работает плавно даже с большими изображениями

## Известные особенности 🔍

1. **Transform + Shader**:
   - Шейдер применяется к уже трансформированному изображению
   - Это означает distortion работает в новых координатах

2. **Offset range**:
   - Ограничен размерами canvas
   - Можно выйти за пределы (создаёт интересные эффекты)

3. **Cursor индикация**:
   - `pointer` - нет изображения
   - `grab` - можно перемещать
   - `grabbing` - активное перемещение

4. **Независимость примитивов**:
   - Примитивы НЕ зависят от трансформации изображения
   - Grid привязана к canvas, не к изображению

## Roadmap (возможные улучшения) 🚀

- [ ] Ограничение drag области (чтобы не выходить за canvas)
- [ ] Zoom gesture support (pinch на touchpad)
- [ ] История трансформаций (undo/redo)
- [ ] Keyboard navigation (стрелки для точного сдвига)
- [ ] Transform animations (плавный zoom/pan)
- [ ] Snap to grid при перемещении
- [ ] Rotate функционал
- [ ] Flip horizontal/vertical

---

**Версия**: 1.1.0  
**Дата**: 6 октября 2025  
**Автор**: GitHub Copilot + User collaboration
