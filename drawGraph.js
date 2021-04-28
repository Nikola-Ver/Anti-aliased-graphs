function drawPoint([{ x, y }], ctx) {
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
}

function Draw(graph) {
  graph.context.clearRect(0, 0, graph.width, graph.height);

  if (graph.childs) {
    graph.coeffGraph = CreateCoeff(
      graph.childs.graphWithoutCover.points,
      graph.width,
      graph.height,
      graph.correctionCoeff
    );

    graph.context.setLineDash([0]);
    graph.context.lineWidth = 3;
    graph.context.strokeStyle = 'white';
    DrawXY(graph.coeffGraph, graph.context, 'white');

    let pointsToDraw = FixPoints(
      graph.childs.graphWithoutCover.topPoints,
      graph.coeffGraph,
      'create'
    );
    graph.context.setLineDash([0]);
    graph.context.lineWidth = 2;
    graph.context.strokeStyle = graph.childs.graphWithoutCover.colorLine;
    bzCurve(graph.context, pointsToDraw, 0.4, 0);

    pointsToDraw = FixPoints(
      graph.childs.graphCover.topPoints,
      graph.coeffGraph,
      'create'
    );
    graph.context.setLineDash([0]);
    graph.context.lineWidth = 2;
    graph.context.strokeStyle = graph.childs.graphCover.colorLine;
    bzCurve(graph.context, pointsToDraw, 0.4, 0);
  } else {
    graph.coeffGraph = CreateCoeff(
      graph.points,
      graph.width,
      graph.height,
      graph.correctionCoeff,
      graph.multiple,
      graph.coeffGraph
    );

    graph.context.setLineDash([0]);
    graph.context.lineWidth = 3;
    graph.context.strokeStyle = 'white';
    DrawXY(graph.coeffGraph, graph.context, 'white');

    graph.topPoints = SearchMaxPoints(graph.points);
    graph.positiveTopPoints = graph.topPoints.filter(
      (e, i) => e.y > 0 && i > 0
    );
    graph.context.setLineDash([0]);
    graph.context.lineWidth = 2;
    graph.context.strokeStyle = graph.colorLine;
    if (graph.drawWithoutSmoothing) {
      let pointsToDraw = FixPoints(graph.points, graph.coeffGraph, 'create');
      drawWithoutSmoothing(graph.context, pointsToDraw);
    } else {
      let pointsToDraw = FixPoints(graph.topPoints, graph.coeffGraph, 'create');
      bzCurve(graph.context, pointsToDraw, 0.4, 0);
    }
  }

  graph.context.lineWidth = graph.grid.width;
  graph.context.strokeStyle = 'white';
  DrawGrid(
    graph.coeffGraph,
    graph.grid.x,
    graph.grid.y,
    graph.context,
    'white'
  );

  graph.selectedPoints?.forEach((e) => {
    drawPoint(FixPoints([e], graph.coeffGraph, 'create'), graph.context);
  });
}
