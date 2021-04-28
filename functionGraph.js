function CreateCoeff(
  points,
  width,
  height,
  correctionCoeff,
  multiple,
  coeffGraph
) {
  if (multiple) return coeffGraph;
  correctionCoeff.x = correctionCoeff.x === undefined ? 1 : correctionCoeff.x;
  correctionCoeff.y = correctionCoeff.y === undefined ? 1 : correctionCoeff.y;
  correctionCoeff.offsetX =
    correctionCoeff.offsetX === undefined ? 0 : correctionCoeff.offsetX;
  correctionCoeff.offsetY =
    correctionCoeff.offsetY === undefined ? 0 : correctionCoeff.offsetY;

  let coeff = {
    x: 0,
    y: 0,
    minX: 0,
    maxX: 0,
    offsetX: correctionCoeff.offsetX,
    minY: 0,
    maxY: 0,
    offsetY: correctionCoeff.offsetY,
    height: height,
    width: width,
    error: false,
  };

  try {
    coeff.minX = points[0].x;
    coeff.maxX = points[0].x;
    coeff.minY = points[0].y;
    coeff.maxY = points[0].y;

    for (let i = 1; i < points.length; i++) {
      coeff.minY = coeff.minY > points[i].y ? points[i].y : coeff.minY;
      coeff.maxY = coeff.maxY < points[i].y ? points[i].y : coeff.maxY;
      coeff.minX = coeff.minX > points[i].x ? points[i].x : coeff.minX;
      coeff.maxX = coeff.maxX < points[i].x ? points[i].x : coeff.maxX;
    }

    coeff.x = 1 / (((coeff.maxX - coeff.minX) / width) * correctionCoeff.x);
    coeff.y = 1 / (((coeff.maxY - coeff.minY) / height) * correctionCoeff.y);

    coeff.minX += correctionCoeff.offsetX / coeff.x;
    coeff.minY += correctionCoeff.offsetY / coeff.y;
  } catch (e) {
    coeff.error = true;
  }

  return coeff;
}

const pointerToPoint = {
  top: false,
  active: false
};

function showPoint(event, graph, pointIndex) {
  const showBox = document.getElementById('point_info_box');
  const showDiv = document.getElementById('point_info');
  showBox.style.display = 'block';

  const shiftX = event.clientX - event.offsetX;
  const shiftY = event.clientY - event.offsetY;

  const xPos =
    FixPoints(
      graph.positiveTopPoints[pointIndex].x,
      graph.coeffGraph,
      'create x'
    ) + shiftX;

  const yPos =
    FixPoints(
      graph.positiveTopPoints[pointIndex].y,
      graph.coeffGraph,
      'create y'
    ) + shiftY;

  if (xPos > 120) {
    if (document.body.clientWidth - 130 < xPos) {
      showBox.style.left = `${document.body.clientWidth - 220 - 30}px`;
      document.documentElement.style.setProperty('--after-left', `${xPos - (document.body.clientWidth - 220) + 20}px`);
      if (!pointerToPoint.active) pointerToPoint.active = true;
    } else {
      if (pointerToPoint.active) {
        document.documentElement.style.setProperty('--after-left', '110px');
        pointerToPoint.active = false;
      }
      showBox.style.left = `${xPos - 120}px`;
    }
  } else {
    document.documentElement.style.setProperty('--after-left', `${xPos - 20}px`);
    if (!pointerToPoint.active) pointerToPoint.active = true;
    showBox.style.left = `10px`;
  }

  if (yPos > 112) {
    if (pointerToPoint.top) {
      showDiv.classList.remove('top');
      pointerToPoint.top = false;
    }
    if (document.documentElement.clientHeight / 1.55 - 20 < yPos) {
      showBox.style.top = `${
        document.documentElement.clientHeight / 1.55 - 140
      }px`;
    } else {
      showBox.style.top = `${yPos - 113}px`;
    }
  } else {
    if (!pointerToPoint.top) {
      showDiv.classList.add('top');
      pointerToPoint.top = true;
    }

    if (yPos < 15) {
      showBox.style.top = `15px`;
    } else {
      showBox.style.top = `${yPos + 2}px`;
    }
  }

  showDiv.textContent = `${pointIndex} вершина по счету\nx: ${graph.positiveTopPoints[pointIndex].x}\ny: ${graph.positiveTopPoints[pointIndex].y}`;
}

function hidePoint() {
  document.getElementById('point_info_box').style.display = 'none';
}

function searchPointIndex(graph, event) {
  const [{ x, y }] = FixPoints(
    [{ x: event.offsetX, y: event.offsetY }],
    graph.coeffGraph,
    'default'
  );

  let index = 0;
  let distance = {
    currPoint: 0,
    prevPoint: 0,
    prev: 0,
    curr: 0,
  };

  do {
    distance.prevPoint = distance.currPoint;
    distance.currPoint = index;
    distance.prev = distance.curr;
    distance.curr = Math.abs(x - graph.positiveTopPoints[index].x);
    ++index;
  } while (
    graph.positiveTopPoints.length > index &&
    (distance.prev >= distance.curr || index === 1)
  );

  return distance.prevPoint;
}

function FixPoints(points, coeff, whatToDo) {
  let newPoints = 0;
  try {
    switch (whatToDo) {
      case 'create x':
        newPoints = (points - coeff.minX) * coeff.x;
        break;

      case 'create y':
        newPoints = coeff.height - (points - coeff.minY) * coeff.y;
        break;

      case 'default x':
        newPoints = points / coeff.x + coeff.minX;
        break;

      case 'default y':
        newPoints = (coeff.height - points) / coeff.y + coeff.minY;
        break;

      case 'default':
        newPoints = [];
        for (let i = 0; i < points.length; i++) {
          let x = points[i].x / coeff.x + coeff.minX;
          let y = (coeff.height - points[i].y) / coeff.y + coeff.minY;
          newPoints.push({ x, y });
        }
        break;

      case 'create':
      default:
        newPoints = [];
        for (let i = 0; i < points.length; i++) {
          let x = (points[i].x - coeff.minX) * coeff.x;
          let y = coeff.height - (points[i].y - coeff.minY) * coeff.y;
          newPoints.push({ x, y });
        }
        break;
    }
  } catch (e) {
    coeff.error = true;
  }
  return newPoints;
}

function DrawXY(coeff, ctx, colorText) {
  let zeroX = 0;
  let zeroY = 0;

  if (coeff.minY <= 0 && coeff.maxY >= 0) {
    zeroY = FixPoints(0, coeff, 'create y');
  } else {
    if (coeff.maxY <= 0) {
      zeroY = 0;
    } else {
      zeroY = coeff.height;
    }
  }

  if (coeff.minX < 0 && coeff.maxX >= 0) {
    zeroX = FixPoints(0, coeff, 'create x');
  } else {
    if (coeff.maxX >= 0) {
      zeroX = 2;
    } else {
      zeroX = coeff.width;
    }
  }

  ctx.beginPath();
  ctx.moveTo(0, zeroY);
  ctx.lineTo(coeff.width, zeroY);
  ctx.lineTo(coeff.width - 5, zeroY - 5);
  ctx.moveTo(coeff.width, zeroY);
  ctx.lineTo(coeff.width - 5, zeroY + 5);

  ctx.moveTo(zeroX, coeff.height);
  ctx.lineTo(zeroX, 2);
  ctx.lineTo(zeroX - 5, 7);
  ctx.moveTo(zeroX, 0);
  ctx.lineTo(zeroX + 5, 7);
  ctx.stroke();
  ctx.font = '20px arial';
  ctx.fillStyle = colorText;
  ctx.fillText('A', zeroX + 5, 25);
  ctx.font = '22px arial';
  ctx.fillText('t', coeff.width - 22, zeroY - 7);
  ctx.stroke();
}

function SearchMaxPoints(points) {
  let newPoints = [];
  newPoints.push({ x: points[0].x, y: points[0].y });

  let flagGrow = points[1].y > 0 ? true : false;
  let currentY = 1;

  for (let i = 1; i < points.length; i++) {
    if ((flagGrow && points[i].y < 0) || (!flagGrow && points[i].y > 0)) {
      flagGrow = !flagGrow;
      newPoints.push({ x: points[currentY].x, y: points[currentY].y });
    }

    if (flagGrow) {
      if (points[currentY].y < points[i].y) currentY = i;
    } else {
      if (points[currentY].y > points[i].y) currentY = i;
    }
  }

  return newPoints;
}

function DrawGrid(coeff, countX, countY, ctx, colorText) {
  ctx.beginPath();
  ctx.font = '12px arial';
  ctx.fillStyle = colorText;
  let countTextX = countX > 20 ? (countX > 25 ? (countX > 30 ? 3 : 4) : 5) : 7;
  let countTextY = 6;
  let offsetX = coeff.width / countX;
  let offsetY = coeff.height / countY;
  for (let i = 1; i < countX; i++) {
    let x = i * offsetX;
    let defaultX = FixPoints(x, coeff, 'default x');
    ctx.fillText(
      String(defaultX).slice(0, countTextX),
      x + 5,
      coeff.height - 5
    );
    ctx.moveTo(x, 0);
    ctx.lineTo(x, coeff.height);
  }

  ctx.fillText(
    String(FixPoints(0, coeff, 'default x')).slice(0, countTextX),
    5,
    coeff.height - 5
  );

  for (let i = 1; i < countY; i++) {
    let y = i * offsetY;
    let defaultY = FixPoints(y, coeff, 'default y');
    ctx.fillText(String(defaultY).slice(0, countTextY), coeff.width - 40, y);
    ctx.moveTo(0, y);
    ctx.lineTo(coeff.width, y);
  }

  ctx.stroke();
}

function bzCurve(ctx, points, f, t) {
  function gradient(a, b) {
    return (b.y - a.y) / (b.x - a.x);
  }

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  let m = 0;
  let dx1 = 0;
  let dy1 = 0;

  let preP = points[0];
  for (let i = 1; i < points.length; i++) {
    let curP = points[i];
    nexP = points[i + 1];
    if (nexP) {
      m = gradient(preP, nexP);
      dx2 = (nexP.x - curP.x) * -f;
      dy2 = dx2 * m * t;
    } else {
      dx2 = 0;
      dy2 = 0;
    }
    ctx.bezierCurveTo(
      preP.x - dx1,
      preP.y - dy1,
      curP.x + dx2,
      curP.y + dy2,
      curP.x,
      curP.y
    );
    dx1 = dx2;
    dy1 = dy2;
    preP = curP;
  }
  ctx.stroke();
}

function drawWithoutSmoothing(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; ++i) {
    ctx.lineTo(points[i].x, points[i].y);
  }

  ctx.stroke();
}
