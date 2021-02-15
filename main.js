function fitnessFunc(x, y) {
  return x ** 2 * Math.sin(y);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1)); // случайный индекс от 0 до i

    [array[i], array[j]] = [array[j], array[i]];
  }
}

function showGenerationByField(generation, field) {
  console.log("\n");
  generation.forEach((ind) =>
    console.log(`${ind.name}: ${field} = ${ind[field]}`)
  );
  console.log("\n");
}

function showGenerationAll(generation) {
  console.log("=====================================");

  generation.forEach((ind) => {
    console.log("\n");
    console.log(`${ind.name}`);

    for (const key in ind) {
      if (key != "name") console.log(`${key}: ${ind[key]}`);
    }
    console.log("\n");
  });

  console.log("=====================================");
}

function createGeneration(a, b, c, d, k) {
  let netNumb = []; // количество точек разбиения по осям
  const generation = [];
  const xStart = []; // разбиение по Х
  const yStart = []; // разбиение по У

  for (let i = 1; i < parseInt(Math.sqrt(k) + 1); i++) {
    if (!(k % i)) {
      netNumb.push([i, parseInt(k / i)]);
    }
  }

  netNumb = netNumb[netNumb.length - 1];

  const netMax = Math.max(...netNumb);
  const netMin = Math.min(...netNumb);

  let deltaX; // расстояние между точками по оси Х
  let deltaY; // расстояние между точками по оси У

  if (b - a > d - c) {
    // если по оси Х длиннее
    deltaX = (b - a) / (netMax + 1);
    deltaY = (d - c) / (netMin + 1);
  } else {
    deltaX = (b - a) / (netMin + 1);
    deltaY = (d - c) / (netMax + 1);
  }

  for (let i = deltaX; i < b - a - 0.01; i += deltaX) {
    xStart.push(i + a);
  }

  for (let i = deltaY; i < d - c - 0.01; i += deltaY) {
    yStart.push(i + c);
  }

  let i = 0;

  for (const x of xStart) {
    for (const y of yStart) {
      generation.push({
        name: `ind ${i}`,
        x: x,
        y: y,
        f: null,
        chromX: null,
        chromY: null,
        weight: null,
        rangeForWheel: [],
      });

      i++;
    }
  }

  if (generation.length != k) {
    throw new Error(
      "Количество индивидуумов не совпадает. Поменяйте точность в строках 66, 70."
    );
  }

  generation.forEach((ind) => (ind.f = fitnessFunc(ind.x, ind.y))); // вычисляем фитнес-функции

  return generation;
}

function setChromosomes(generation, a, c, lx, ly, hx, hy) {
  generation.forEach((ind) => {
    ind.chromX = Math.ceil((ind.x - a) / hx)
      .toString(2)
      .split("");

    ind.chromY = Math.ceil((ind.y - c) / hy)
      .toString(2)
      .split("");

    while (ind.chromX.length != lx) {
      ind.chromX.unshift("0");
    }

    while (ind.chromY.length != ly) {
      ind.chromY.unshift("0");
    }

    ind.chromX = ind.chromX.join("");
    ind.chromY = ind.chromY.join("");
  });
}

function changeNegativeFitness(generation) {
  let fNegative = generation.filter((ind) => ind.f < 0);

  if (fNegative.length == 0) return;

  let fMin = Math.min(...fNegative.map((ind) => ind.f));

  generation.forEach((ind) => {
    ind.f = ind.f + 2 * Math.abs(fMin);
  });
}

function selection(generation) {
  let F = generation.reduce((sum, currentInd) => sum + currentInd.f, 0);

  generation.forEach((ind) => (ind.weight = (ind.f / F) * 100)); // тета для каждого индивидуума
  generation.sort((a, b) => a.weight - b.weight);

  generation[0].rangeForWheel.push(0, generation[0].weight);

  let temp1;
  let temp2 = generation[0].weight;

  for (let i = 1; i < generation.length; i++) {
    temp1 = temp2;
    temp2 = temp1 + generation[i].weight;

    generation[i].rangeForWheel.push(temp1, temp2);
  }

  const selected = [];

  for (let i = 0; i < generation.length; i++) {
    let gamma = Math.random() * 100;
    let chosenInd = generation.find(
      (ind) => gamma > ind.rangeForWheel[0] && gamma <= ind.rangeForWheel[1]
    );

    selected.push(chosenInd);
  }

  return selected;
}

function geneticOperators(
  selected,
  newGeneration,
  lx,
  ly,
  pCross,
  pMutat,
  locus
) {
  for (let i = 0; i < selected.length; i += 2) {
    let gamma = Math.random();

    if (gamma < pCross) {
      // скрещиваем
      let chromX1 = selected[i].chromX.split("");
      let chromY1 = selected[i].chromY.split("");
      let chromX2 = selected[i + 1].chromX.split("");
      let chromY2 = selected[i + 1].chromY.split("");

      newGeneration[i].chromX = chromX1.splice(0, locus);
      newGeneration[i].chromY = chromY1.splice(0, locus);
      newGeneration[i + 1].chromX = chromX2.splice(0, locus);
      newGeneration[i + 1].chromY = chromY2.splice(0, locus);

      newGeneration[i].chromX.push(...chromX2);
      newGeneration[i].chromY.push(...chromY2);
      newGeneration[i + 1].chromX.push(...chromX1);
      newGeneration[i + 1].chromY.push(...chromY1);

      newGeneration[i].chromX = newGeneration[i].chromX.join("");
      newGeneration[i].chromY = newGeneration[i].chromY.join("");
      newGeneration[i + 1].chromX = newGeneration[i + 1].chromX.join("");
      newGeneration[i + 1].chromY = newGeneration[i + 1].chromY.join("");
    } else {
      // не скрещиваем
      newGeneration[i].chromX = selected[i].chromX;
      newGeneration[i].chromY = selected[i].chromY;
      newGeneration[i + 1].chromX = selected[i + 1].chromX;
      newGeneration[i + 1].chromY = selected[i + 1].chromY;
    }
  }

  for (let i = 0; i < newGeneration.length; i++) {
    let gamma = Math.random();

    if (gamma < pMutat) {
      // мутируем по х
      let randomGeneX = Math.ceil(Math.random() * lx) - 1;

      newGeneration[i].chromX = newGeneration[i].chromX.split("");

      newGeneration[i].chromX[randomGeneX] = String(
        Math.abs(+newGeneration[i].chromX[randomGeneX] - 1)
      );

      newGeneration[i].chromX = newGeneration[i].chromX.join("");
    }
  }

  for (let i = 0; i < newGeneration.length; i++) {
    let gamma = Math.random();

    if (gamma < pMutat) {
      // мутируем по y
      let randomGeneY = Math.ceil(Math.random() * ly) - 1;

      newGeneration[i].chromY = newGeneration[i].chromY.split("");

      newGeneration[i].chromY[randomGeneY] = String(
        Math.abs(+newGeneration[i].chromY[randomGeneY] - 1)
      );

      newGeneration[i].chromY = newGeneration[i].chromY.join("");
    }
  }
}

function decoding(newGeneration, a, c, hx, hy) {
  for (const ind of newGeneration) {
    let num10X = +("0b" + ind.chromX);
    let num10Y = +("0b" + ind.chromY);

    ind.x = a + hx * num10X;
    ind.y = c + hy * num10Y;

    ind.f = fitnessFunc(ind.x, ind.y);
  }
}

function main() {
  const trace = {
    x: [],
    y: [],
    type: "scatter",
  };

  const a = -2;
  const b = 3;
  const c = 0;
  const d = 4;

  const eps = 0.1;
  const qEps = -Math.log10(eps);

  const k = 1000; //! количество индивидуумов (четное)
  const n = 100; //! количество итераций

  const pCross = 0.95;
  const pMutat = 0.025;
  const locus = 2;

  const lx = Math.ceil(Math.log2((b - a) * 10 ** qEps + 1));
  const ly = Math.ceil(Math.log2((d - c) * 10 ** qEps + 1));

  const hx = (b - a) / (2 ** lx - 1);
  const hy = (d - c) / (2 ** ly - 1);

  let generation = createGeneration(a, b, c, d, k);

  setChromosomes(generation, a, c, lx, ly, hx, hy);

  let fAverage =
    generation.reduce((sum, currentInd) => sum + currentInd.f, 0) / k;

  changeNegativeFitness(generation);

  trace.x.push(0);
  trace.y.push(fAverage);

  let selected = selection(generation);
  shuffle(selected);

  let newGeneration = [];

  for (let i = 0; i < k; i++) {
    newGeneration.push({
      name: `ind* ${i}`,
      x: null,
      y: null,
      f: null,
      chromX: null,
      chromY: null,
      weight: null,
      rangeForWheel: [],
    });
  }

  geneticOperators(selected, newGeneration, lx, ly, pCross, pMutat, locus); // newGeneration получила хромосомы

  decoding(newGeneration, a, c, hx, hy); // newGeneration получила х, у и f

  for (let j = 1; j <= n; j++) {
    generation = newGeneration;
    newGeneration = [];

    fAverage =
      generation.reduce((sum, currentInd) => sum + currentInd.f, 0) / k;

    if (j % 1 == 0) {
      trace.x.push(j);
      trace.y.push(fAverage);
    }

    changeNegativeFitness(generation);

    selected = selection(generation);
    shuffle(selected);

    for (let i = 0; i < k; i++) {
      newGeneration.push({
        name: `ind* ${i}`,
        x: null,
        y: null,
        f: null,
        chromX: null,
        chromY: null,
        weight: null,
        rangeForWheel: [],
      });
    }

    geneticOperators(selected, newGeneration, lx, ly, pCross, pMutat, locus); // newGeneration получила хромосомы

    decoding(newGeneration, a, c, hx, hy); // newGeneration получила х, у и f
  }

  Plotly.newPlot("plot", [trace]);

  let max = Math.max(...newGeneration.map((ind) => ind.f));
  result.innerHTML = String(max).slice(0, 6);
}

main();
