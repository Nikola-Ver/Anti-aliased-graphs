/* 
  Graphs = {
    canvas: null,
    context: null,
    points: null,
    topPoints: null,
    positiveTopPoints: null
  }
*/

const MIN_VAL = 0.5;

let graphWithoutCover = {};
let graphCover = {};

graphWithoutCover.multiple = false;
graphCover.multiple = false;

let ctrlKeyFlag = false;
let shiftKeyFlag = false;
let speed = 10;
let arrOfGraphs = [graphWithoutCover];

function ResizeWindow() {
  let width =
    document.documentElement.clientWidth > 700
      ? document.documentElement.clientWidth / 2 - 20
      : document.documentElement.clientWidth - 20;
  let height = document.documentElement.clientHeight / 1.55 - 20;

  let canvas = document.getElementById('canvas_without_cover');
  graphWithoutCover = {
    canvas,
    context: canvas.getContext('2d'),
    width,
    height,
  };
  canvas.width = width;
  canvas.height = height;

  canvas = document.getElementById('canvas_cover');
  graphCover = { canvas, context: canvas.getContext('2d'), width, height };
  canvas.width = width;
  canvas.height = height;
}

window.onresize = ResizeWindow;
ResizeWindow();

graphWithoutCover.grid = { x: 10, y: 10, width: 0.2 };
graphCover.grid = { x: 10, y: 10, width: 0.2 };

graphWithoutCover.canvas.ondblclick = () => {
  graphWithoutCover.link?.click();
};

let previousPoint = 0;

graphWithoutCover.canvas.onmousemove = (e) => {
  if (shiftKeyFlag && graphWithoutCover.coeffGraph) {
    const pointIndex = searchPointIndex(graphWithoutCover, e);
    previousPoint != pointIndex && showPoint(e, graphWithoutCover, pointIndex);
    previousPoint = pointIndex;
  }
};

graphCover.canvas.ondblclick = () => {
  graphCover.link?.click();
};

graphCover.canvas.onmousemove = (e) => {
  if (shiftKeyFlag && graphCover.coeffGraph) {
    const pointIndex = searchPointIndex(graphCover, e);
    previousPoint != pointIndex && showPoint(e, graphCover, pointIndex);
    previousPoint = pointIndex;
  }
};

function addNewGraph(graph) {
  if (ctrlKeyFlag) {
    graph.multiple = true;
    if (arrOfGraphs.includes(graph)) {
      arrOfGraphs.filter((e) => {
        if (e !== graph) return e;
      });
    } else {
      arrOfGraphs.push(graph);
      if (arrOfGraphs.length > 1) {
        equalizeGraphs();
        arrOfGraphs.forEach((e) => {
          Draw(e);
        });
      }
    }
  } else {
    graph.multiple = false;
    arrOfGraphs = [graph];
  }
}

document.getElementById('input_without_cover_from').onkeyup = (e) => {
  const value = Number(
    document.getElementById('input_without_cover_from').value
  );
  if (value !== NaN && value >= 0) {
    if (!graphWithoutCover.selectedPoints) {
      graphWithoutCover.selectedPoints = [];
    }
    graphWithoutCover.selectedPoints[0] =
      graphWithoutCover.positiveTopPoints[value];
    Draw(graphWithoutCover);
  }
};

document.getElementById('input_without_cover_to').onkeyup = (e) => {
  const value = Number(document.getElementById('input_without_cover_to').value);
  if (
    value !== NaN &&
    value >= 0 &&
    value > Number(document.getElementById('input_without_cover_from').value)
  ) {
    if (!graphWithoutCover.selectedPoints) {
      graphWithoutCover.selectedPoints = [];
    }
    graphWithoutCover.selectedPoints[1] =
      graphWithoutCover.positiveTopPoints[value];
    Draw(graphWithoutCover);
  }
};

document.getElementById('input_cover_from').onkeyup = (e) => {
  const value = Number(document.getElementById('input_cover_from').value);
  if (value !== NaN && value > 0) {
    if (!graphCover.selectedPoints) {
      graphCover.selectedPoints = [];
    }
    graphCover.selectedPoints[0] = graphCover.positiveTopPoints[value];
    Draw(graphCover);
  }
};

document.getElementById('input_cover_to').onkeyup = (e) => {
  const value = Number(document.getElementById('input_cover_to').value);
  if (
    value !== NaN &&
    value > 0 &&
    value > Number(document.getElementById('input_cover_from').value)
  ) {
    if (!graphCover.selectedPoints) {
      graphCover.selectedPoints = [];
    }
    graphCover.selectedPoints[1] = graphCover.positiveTopPoints[value];
    Draw(graphCover);
  }
};

graphWithoutCover.canvas.onclick = (e) => {
  if (shiftKeyFlag && graphWithoutCover.coeffGraph) {
    const pointIndex = searchPointIndex(graphWithoutCover, e);
    if (!graphWithoutCover.selectedPoints)
      graphWithoutCover.selectedPoints = [];

    if (graphWithoutCover.selectedPoints.length > 1) {
      graphWithoutCover.selectedPoints = [];
      document.getElementById('input_without_cover_from').value = '';
      document.getElementById('input_without_cover_to').value = '';
    } else {
      graphWithoutCover.selectedPoints.push(
        graphWithoutCover.positiveTopPoints[pointIndex]
      );

      let fromValue = document.getElementById('input_without_cover_from');
      let toValue = document.getElementById('input_without_cover_to');
      if (graphWithoutCover.selectedPoints.length > 1) {
        if (Number(fromValue.value) > pointIndex) {
          toValue.value = fromValue.value;
          fromValue.value = pointIndex;
        } else {
          toValue.value = pointIndex;
        }
      } else {
        fromValue.value = pointIndex;
      }
    }

    Draw(graphWithoutCover);
  }
  addNewGraph(graphWithoutCover);
};

document.getElementById('result_info').onmousemove = (e) => {
  hidePoint();
};

graphCover.canvas.onclick = (e) => {
  if (shiftKeyFlag && graphCover.coeffGraph) {
    const pointIndex = searchPointIndex(graphCover, e);
    if (!graphCover.selectedPoints) graphCover.selectedPoints = [];

    if (graphCover.selectedPoints.length > 1) {
      graphCover.selectedPoints = [];
      document.getElementById('input_cover_from').value = '';
      document.getElementById('input_cover_to').value = '';
    } else {
      graphCover.selectedPoints.push(graphCover.positiveTopPoints[pointIndex]);

      let fromValue = document.getElementById('input_cover_from');
      let toValue = document.getElementById('input_cover_to');
      if (graphCover.selectedPoints.length > 1) {
        if (Number(fromValue.value) > pointIndex) {
          toValue.value = fromValue.value;
          fromValue.value = pointIndex;
        } else {
          toValue.value = pointIndex;
        }
      } else {
        fromValue.value = pointIndex;
      }
    }

    Draw(graphCover);
  }
  addNewGraph(graphCover);
};

// Реализация отрисовки графиков

graphWithoutCover.link = document.getElementById('load_canvas_without_cover');
graphWithoutCover.link.addEventListener('change', function () {
  let fr = new FileReader();
  fr.onload = function () {
    let fileContent = this.result;
    let weedOutFlag = false;
    if (fileContent[0] === 'O') {
      weedOutFlag = true;
      fileContent = fileContent
        .replace(/^.*?(?=0\.000)/gs, '')
        ?.replace(/ (?= )/g, '')
        ?.replace(/^ */gm, '')
        ?.replace(/ *(?=$)/gm, '')
        ?.replace(/ [-0-9\.]*(?= )/g, '');
    }
    let points = fileContent.split(/ |\n/);

    points = points.map((element) => {
      return (element = Number(element));
    });

    let index = 1;
    while (weedOutFlag) {
      if (Math.abs(points[index]) > MIN_VAL) {
        weedOutFlag = false;
        points = points.slice(index + 1);
      }
      index += 2;
    }

    if (points.length % 2 !== 0) points.pop(); // Если для последнего X нет Y, иначе файл некорректно создан
    graphWithoutCover.points = [];
    for (let i = 0; i < points.length; i += 2) {
      graphWithoutCover.points.push({ x: points[i], y: points[i + 1] });
    }

    graphWithoutCover.correctionCoeff = {
      x: 1,
      offsetX: 0,
      y: 1,
      offsetY: 0,
    };
    graphWithoutCover.colorLine = 'rgb(88, 68, 140)';

    Draw(graphWithoutCover);
  };
  try {
    fr.readAsText(this.files[0]);
  } catch {}
});

graphCover.link = document.getElementById('load_canvas_cover');
graphCover.link.addEventListener('change', function () {
  let fr = new FileReader();
  fr.onload = function () {
    let fileContent = this.result;
    let weedOutFlag = false;
    if (fileContent[0] === 'O') {
      weedOutFlag = true;
      fileContent = fileContent
        .replace(/^.*?(?=0\.000)/gs, '')
        ?.replace(/ (?= )/g, '')
        ?.replace(/^ */gm, '')
        ?.replace(/ *(?=$)/gm, '')
        ?.replace(/ [-0-9\.]*(?= )/g, '');
    }
    let points = fileContent.split(/ |\n/);

    points = points.map((element) => {
      return (element = Number(element));
    });

    let index = 1;
    while (weedOutFlag) {
      if (Math.abs(points[index]) > MIN_VAL) {
        weedOutFlag = false;
        points = points.slice(index + 1);
      }
      index += 2;
    }

    if (points.length % 2 !== 0) points.pop(); // Если для последнего X нет Y, иначе файл некорректно создан
    graphCover.points = [];
    for (let i = 0; i < points.length; i += 2) {
      graphCover.points.push({ x: points[i], y: points[i + 1] });
    }

    graphCover.correctionCoeff = {
      x: 1,
      offsetX: 0,
      y: 1,
      offsetY: 0,
    };
    graphCover.colorLine = 'rgb(68, 140, 127)';

    Draw(graphCover);
  };
  try {
    fr.readAsText(this.files[0]);
  } catch {}
});

let flagKey = 'x';

function equalizeGraphs() {
  const [{ correctionCoeff, grid, coeffGraph }] = arrOfGraphs;

  for (let i = 1; i < arrOfGraphs.length; ++i) {
    arrOfGraphs[i].correctionCoeff = Object.assign({}, correctionCoeff);
    arrOfGraphs[i].grid = Object.assign({}, grid);
    arrOfGraphs[i].coeffGraph = Object.assign({}, coeffGraph);
  }
}

// Реализация масштабирования графиков
document.addEventListener('keyup', (event) => {
  if (event.keyCode !== 17) ctrlKeyFlag = false;
});

document.getElementById('input_speed').onkeyup = () => {
  const newVal = Number(document.getElementById('input_speed').value);
  if (newVal > 0) speed = newVal;
};

document.addEventListener('keydown', (event) => {
  if (event.keyCode === 17) ctrlKeyFlag = true;
  if (event.code == 'ShiftLeft') {
    shiftKeyFlag = !shiftKeyFlag;
    if (!shiftKeyFlag) {
      hidePoint();
    }
  }

  if (event.code == 'ShiftRight') {
    for (let index = 0; index < arrOfGraphs.length; ++index) {
      if (arrOfGraphs[index].drawWithoutSmoothing) {
        arrOfGraphs[index].drawWithoutSmoothing = false;
      } else {
        arrOfGraphs[index].drawWithoutSmoothing = true;
      }
    }
  }

  if (event.ctrlKey && event.shiftKey && event.altKey) {
    const speedDiv = document.getElementById('input_speed');
    if (speedDiv.className === 'off') {
      speedDiv.className = '';
      speedDiv.focus();
    } else {
      speedDiv.className = 'off';
    }
  }

  if (!arrOfGraphs || arrOfGraphs.length === 0) return;

  arrOfGraphs.forEach((currentGraph) => {
    if (!currentGraph.context || !currentGraph.points) return;

    if (event.code == 'KeyY' && event.ctrlKey) {
      flagKey = 'y';
    }

    if (event.code == 'KeyX' && event.ctrlKey) {
      flagKey = 'x';
    }

    if (event.code == 'KeyI' && event.ctrlKey) {
      flagKey = 'w';
    }

    if (event.code == 'KeyA') {
      if (flagKey === 'x') currentGraph.correctionCoeff.x *= 0.8;
      if (flagKey === 'y') currentGraph.correctionCoeff.y *= 0.8;
      if (flagKey === 'w') currentGraph.grid.width += 0.1;
      if (arrOfGraphs.length > 1) equalizeGraphs();
    }

    if (event.code == 'KeyB') {
      if (flagKey === 'x') currentGraph.correctionCoeff.x *= 1.25;
      if (flagKey === 'y') currentGraph.correctionCoeff.y *= 1.25;
      if (flagKey === 'w' && currentGraph.grid.width > 0.11)
        currentGraph.grid.width -= 0.1;
      if (arrOfGraphs.length > 1) equalizeGraphs();
    }

    if (event.code == 'ArrowRight') {
      currentGraph.correctionCoeff.offsetX += speed;
      if (arrOfGraphs.length > 1) equalizeGraphs();
    }

    if (event.code == 'ArrowLeft') {
      if (currentGraph.correctionCoeff.offsetX >= speed)
        currentGraph.correctionCoeff.offsetX -= speed;
      if (arrOfGraphs.length > 1) equalizeGraphs();
    }

    if (event.code == 'ArrowUp') {
      currentGraph.correctionCoeff.offsetY += speed;
      if (arrOfGraphs.length > 1) equalizeGraphs();
    }

    if (event.code == 'ArrowDown') {
      currentGraph.correctionCoeff.offsetY -= speed;
      if (arrOfGraphs.length > 1) equalizeGraphs();
    }

    if (event.code == 'Equal') {
      if (flagKey === 'x') currentGraph.grid.x += 1;
      if (flagKey === 'y') currentGraph.grid.y += 1;
    }

    if (event.code == 'Minus') {
      if (flagKey === 'x' && currentGraph.grid.x > 1) currentGraph.grid.x -= 1;
      if (flagKey === 'y' && currentGraph.grid.y > 1) currentGraph.grid.y -= 1;
    }

    Draw(currentGraph);
  });
});

// Расчеты формул
let buttonCalcWithoutCover = document.getElementById('button_without_cover');
buttonCalcWithoutCover.onclick = () => {
  try {
    let fromPoint = Number(
      document.getElementById('input_without_cover_from').value
    );
    let toPoint = Number(
      document.getElementById('input_without_cover_to').value
    );
    if (toPoint > 1)
      if (graphWithoutCover.positiveTopPoints) {
        let A1 = graphWithoutCover.positiveTopPoints[fromPoint].y;
        let An = graphWithoutCover.positiveTopPoints[toPoint].y;
        let sigma = (1 / (toPoint - fromPoint + 1)) * Math.log(A1 / An);
        graphWithoutCover.sigma = sigma;

        let div = document.getElementById('sigma_without_cover');
        div.textContent = 'G = ' + sigma;

        let coef = 2 * sigma;
        div = document.getElementById('coef_without_cover');
        div.textContent = 'K = ' + coef;
      }
  } catch (e) {}
};

let buttonCalcCover = document.getElementById('button_cover');
buttonCalcCover.onclick = () => {
  try {
    let fromPoint = Number(document.getElementById('input_cover_from').value);
    let toPoint = Number(document.getElementById('input_cover_to').value);
    if (toPoint > 1)
      if (graphCover.positiveTopPoints) {
        let A1 = graphCover.positiveTopPoints[fromPoint].y;
        let An = graphCover.positiveTopPoints[toPoint].y;
        let sigma = (1 / (toPoint - fromPoint + 1)) * Math.log(A1 / An);
        graphCover.sigma = sigma;

        let div = document.getElementById('sigma_cover');
        div.textContent = 'G = ' + sigma;

        let coef = 2 * sigma;
        div = document.getElementById('coef_cover');
        div.textContent = 'K = ' + coef;
      }
  } catch (e) {}
};

let buttonResult = document.getElementById('button_result');
buttonResult.onclick = () => {
  if (graphWithoutCover.sigma && graphCover.sigma) {
    try {
      let c = {
        V: null,
        E: Number(document.getElementById('c_input_E').value),
        w: Number(document.getElementById('c_input_w').value),
        h: Number(document.getElementById('c_input_h').value),
        l: Number(document.getElementById('c_input_l').value),
      };

      let p = {
        V: null,
        E: Number(document.getElementById('p_input_E').value),
        w: Number(document.getElementById('p_input_w').value),
        h: Number(document.getElementById('p_input_h').value),
        l: Number(document.getElementById('p_input_l').value),
      };

      if (c.w && c.h && c.l && c.E && p.w && p.h && p.l && p.E) {
        c.V = c.w * c.h * c.l;
        p.V = p.w * p.h * p.l;

        let div = document.getElementById('coef_result');
        div.textContent =
          'K = ' +
          String(
            (2 * (graphWithoutCover.sigma - graphCover.sigma) * c.E * c.V) /
              (6 * p.E * p.V)
          );
      }
    } catch (e) {}
  }
};

document.getElementById('info_button').onclick = () => {
  document.getElementById('about_program').classList.toggle('off');
}