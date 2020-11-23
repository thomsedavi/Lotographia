import { isOdd } from './VivaCityGrid';
import { TerrainType } from "./VivaCityTypes";

const MaxFailures: number = 10000;

const isFlatTop = (y: number, x: number) => {
  return y !== 0 && ((isOdd(y) && !isOdd(x)) || (!isOdd(y) && isOdd(x)));
}

const isFlatBottom = (y: number, x: number) => {
  return ((isOdd(y) && isOdd(x)) || (!isOdd(y) && !isOdd(x)));
}

const generateOceans = (terrainGrid: TerrainType[][], coordList: { y: number, x: number }[]) => {
  const maxOceans: number = Math.floor(coordList.length / 4) + Math.floor((Math.random() - 0.5) * (coordList.length / 8));
  let currentOceans: number = 0;
  let coordIndex: number = 0;
  let currentFailures: number = 0;

  while (currentOceans < maxOceans && currentFailures < MaxFailures) {
    const coord = coordList[coordIndex];

    // as more ocean tiles exist, less likely to start new region of ocean tiles
    if (Math.random() < Math.sqrt((maxOceans - (currentOceans * 200)) / maxOceans)) {
      terrainGrid[coord.y][coord.x] = TerrainType.ocean;
      coordList.splice(coordIndex, 1);
      currentOceans++;
      coordIndex = coordIndex % coordList.length;
      currentFailures = 0;
    } else if (Math.random() < Math.sqrt((maxOceans - currentOceans) / maxOceans) &&
      (coord.x === 0 || coord.x === terrainGrid[coord.y].length - 1 ||
        (coord.y === 0 && isOdd(coord.x)) || (coord.y === terrainGrid.length - 1 && isOdd(coord.x)))) {
      terrainGrid[coord.y][coord.x] = TerrainType.ocean;
      coordList.splice(coordIndex, 1);
      currentOceans++;
      coordIndex = coordIndex % coordList.length;
      currentFailures = 0;
    } else if (terrainGrid[coord.y][coord.x - 1] === TerrainType.ocean || terrainGrid[coord.y][coord.x + 1] === TerrainType.ocean ||
      (isFlatTop(coord.y, coord.x) && coord.y !== 0 && terrainGrid[coord.y - 1][coord.x] === TerrainType.ocean) ||
      (isFlatBottom(coord.y, coord.x) && coord.y !== terrainGrid.length - 1 && terrainGrid[coord.y + 1][coord.x] === TerrainType.ocean)) {
      terrainGrid[coord.y][coord.x] = TerrainType.ocean;
      coordList.splice(coordIndex, 1);
      currentOceans++;
      coordIndex = coordIndex % coordList.length;
      currentFailures = 0;
    }
    else {
      coordIndex = (coordIndex + 1) % coordList.length;
      currentFailures++;
    }
  }

}

const generateRivers = (terrainGrid: TerrainType[][], coordList: { y: number, x: number }[]) => {
  const maxRivers: number = Math.floor(coordList.length / 8) + Math.floor((Math.random() - 0.5) * (coordList.length / 8));
  let currentRivers: number = 0;
  let currentFailures: number = 0;
  let coordIndex: number = 0;

  while (currentRivers < maxRivers && currentFailures < MaxFailures) {
    const coord = coordList[coordIndex];

    // as more river tiles exist, less likely to start new region of river tiles

    if (Math.random() < Math.sqrt((maxRivers - (currentRivers * 20)) / maxRivers) &&
      coord.x !== 0 && coord.x !== terrainGrid[coord.y].length - 1 && !((coord.y === 0 || coord.y === terrainGrid.length - 1) && isOdd(coord.x)) &&
      ((terrainGrid[coord.y][coord.x - 1] === TerrainType.ocean && terrainGrid[coord.y][coord.x + 1] === TerrainType.none && ((isFlatTop(coord.y, coord.x) && terrainGrid[coord.y - 1][coord.x] === TerrainType.none) || (isFlatBottom(coord.y, coord.x) && terrainGrid[coord.y + 1][coord.x] === TerrainType.none))) ||
        (terrainGrid[coord.y][coord.x - 1] === TerrainType.none && terrainGrid[coord.y][coord.x + 1] === TerrainType.ocean && ((isFlatTop(coord.y, coord.x) && terrainGrid[coord.y - 1][coord.x] === TerrainType.none) || (isFlatBottom(coord.y, coord.x) && terrainGrid[coord.y + 1][coord.x] === TerrainType.none))) ||
        (terrainGrid[coord.y][coord.x - 1] === TerrainType.none && terrainGrid[coord.y][coord.x + 1] === TerrainType.none && ((isFlatTop(coord.y, coord.x) && terrainGrid[coord.y - 1][coord.x] === TerrainType.ocean) || (isFlatBottom(coord.y, coord.x) && terrainGrid[coord.y + 1][coord.x] === TerrainType.ocean))))) {
      terrainGrid[coord.y][coord.x] = TerrainType.river;
      coordList.splice(coordIndex, 1);
      currentRivers++;
      coordIndex = coordIndex % coordList.length;
      currentFailures = 0;
    } else if (coord.x !== 0 && coord.x !== terrainGrid[coord.y].length - 1 && !((coord.y === 0 || coord.y === terrainGrid.length - 1) && isOdd(coord.x)) &&
      (


        (terrainGrid[coord.y][coord.x - 1] === TerrainType.river && terrainGrid[coord.y][coord.x + 1] === TerrainType.none &&
          (isFlatTop(coord.y, coord.x) ? terrainGrid[coord.y - 1][coord.x] === TerrainType.none : terrainGrid[coord.y + 1][coord.x] === TerrainType.none) &&
          ((coord.x !== 1 && terrainGrid[coord.y][coord.x - 2] === TerrainType.none) || (isFlatTop(coord.y, coord.x - 1) ? terrainGrid[coord.y - 1][coord.x - 1] === TerrainType.none : terrainGrid[coord.y + 1][coord.x - 1] === TerrainType.none)))

        ||


        (terrainGrid[coord.y][coord.x - 1] === TerrainType.none && terrainGrid[coord.y][coord.x + 1] === TerrainType.river &&
          (isFlatTop(coord.y, coord.x) ? terrainGrid[coord.y - 1][coord.x] === TerrainType.none : terrainGrid[coord.y + 1][coord.x] === TerrainType.none) &&
          ((coord.x !== terrainGrid[coord.y].length - 2 && terrainGrid[coord.y][coord.x + 2] === TerrainType.none) || (isFlatTop(coord.y, coord.x + 1) ? terrainGrid[coord.y - 1][coord.x + 1] === TerrainType.none : terrainGrid[coord.y + 1][coord.x + 1] === TerrainType.none)))

        ||


        (terrainGrid[coord.y][coord.x - 1] === TerrainType.none && terrainGrid[coord.y][coord.x + 1] === TerrainType.none && (
          (isFlatTop(coord.y, coord.x) && terrainGrid[coord.y - 1][coord.x] === TerrainType.river && (terrainGrid[coord.y - 1][coord.x - 1] === TerrainType.none || terrainGrid[coord.y - 1][coord.x + 1] === TerrainType.none)) ||
          (isFlatBottom(coord.y, coord.x) && terrainGrid[coord.y + 1][coord.x] === TerrainType.river && (terrainGrid[coord.y + 1][coord.x - 1] === TerrainType.none || terrainGrid[coord.y + 1][coord.x + 1] === TerrainType.none)))))) {
      terrainGrid[coord.y][coord.x] = TerrainType.river;
      coordList.splice(coordIndex, 1);
      currentRivers++;
      coordIndex = coordIndex % coordList.length;
      currentFailures = 0;
    } else {
      coordIndex = (coordIndex + 1) % coordList.length;
      currentFailures++;
    }
  }

}

const generateMountains = (terrainGrid: TerrainType[][], coordList: { y: number, x: number }[]) => {
  const maxMountains: number = Math.floor(coordList.length / 8) + Math.floor((Math.random() - 0.5) * (coordList.length / 8));
  let currentMountains: number = 0;
  let currentFailures: number = 0;
  let coordIndex: number = 0;

  while (currentMountains < maxMountains && currentFailures < MaxFailures) {
    const coord = coordList[coordIndex];

    if (((coord.x !== 0 && terrainGrid[coord.y][coord.x - 1] === TerrainType.mountains) ||
      (coord.x !== terrainGrid[coord.y].length - 1 && terrainGrid[coord.y][coord.x + 1] === TerrainType.mountains) ||
      (isFlatTop(coord.y, coord.x) ? (coord.y !== 1 && terrainGrid[coord.y - 1][coord.x] === TerrainType.mountains) : (coord.y !== terrainGrid.length - 1 && terrainGrid[coord.y + 1][coord.x] === TerrainType.mountains)))) {
      terrainGrid[coord.y][coord.x] = TerrainType.mountains;
      coordList.splice(coordIndex, 1);
      currentMountains++;
      coordIndex = coordIndex % coordList.length;
      currentFailures = 0;
    } else if (Math.random() < Math.sqrt((maxMountains - (currentMountains * 5)) / maxMountains) && terrainGrid[coord.y][coord.x] === TerrainType.none) {
      terrainGrid[coord.y][coord.x] = TerrainType.mountains;
      coordList.splice(coordIndex, 1);
      currentMountains++;
      coordIndex = coordIndex % coordList.length;
      currentFailures = 0;
    } else if (coord.x !== 0 && coord.x !== terrainGrid[coord.y].length - 1 && !((coord.y === 0 || coord.y === terrainGrid.length - 1) && isOdd(coord.x)) &&

      (


        (terrainGrid[coord.y][coord.x - 1] === TerrainType.river && terrainGrid[coord.y][coord.x + 1] === TerrainType.none &&
          (isFlatTop(coord.y, coord.x) ? terrainGrid[coord.y - 1][coord.x] === TerrainType.none : terrainGrid[coord.y + 1][coord.x] === TerrainType.none) &&
          ((coord.x !== 1 && terrainGrid[coord.y][coord.x - 2] === TerrainType.none) || (isFlatTop(coord.y, coord.x - 1) ? terrainGrid[coord.y - 1][coord.x - 1] === TerrainType.none : terrainGrid[coord.y + 1][coord.x - 1] === TerrainType.none)))

        ||


        (terrainGrid[coord.y][coord.x - 1] === TerrainType.none && terrainGrid[coord.y][coord.x + 1] === TerrainType.river &&
          (isFlatTop(coord.y, coord.x) ? terrainGrid[coord.y - 1][coord.x] === TerrainType.none : terrainGrid[coord.y + 1][coord.x] === TerrainType.none) &&
          ((coord.x !== terrainGrid[coord.y].length - 2 && terrainGrid[coord.y][coord.x + 2] === TerrainType.none) || (isFlatTop(coord.y, coord.x + 1) ? terrainGrid[coord.y - 1][coord.x + 1] === TerrainType.none : terrainGrid[coord.y + 1][coord.x + 1] === TerrainType.none)))

        ||


        (terrainGrid[coord.y][coord.x - 1] === TerrainType.none && terrainGrid[coord.y][coord.x + 1] === TerrainType.none && (
          (isFlatTop(coord.y, coord.x) && terrainGrid[coord.y - 1][coord.x] === TerrainType.river && (terrainGrid[coord.y - 1][coord.x - 1] === TerrainType.none || terrainGrid[coord.y - 1][coord.x + 1] === TerrainType.none)) ||
          (isFlatBottom(coord.y, coord.x) && terrainGrid[coord.y + 1][coord.x] === TerrainType.river && (terrainGrid[coord.y + 1][coord.x - 1] === TerrainType.none || terrainGrid[coord.y + 1][coord.x + 1] === TerrainType.none)))))

    ) {
      terrainGrid[coord.y][coord.x] = TerrainType.mountains;
      coordList.splice(coordIndex, 1);
      currentMountains++;
      coordIndex = coordIndex % coordList.length;
      currentFailures = 0;
    } else {
      coordIndex = (coordIndex + 1) % coordList.length;
      currentFailures++;
    }
  }
}

const generateIce = (terrainGrid: TerrainType[][], coordList: { y: number, x: number }[]) => {
  const maxIces: number = Math.floor(coordList.length / 8) + Math.floor((Math.random() - 0.5) * (coordList.length / 8));
  let currentIces: number = 0;
  let currentFailures: number = 0;
  let coordIndex: number = 0;

  while (currentIces < maxIces && currentFailures < MaxFailures) {
    const coord = coordList[coordIndex];

    if (coord.y > (terrainGrid.length * 0.75)) { // TODO bias towards bottom of map
      terrainGrid[coord.y][coord.x] = TerrainType.ice;
      coordList.splice(coordIndex, 1);
      currentIces++;
      coordIndex = coordIndex % coordList.length;
      currentFailures = 0;
    } else {
      coordIndex = (coordIndex + 1) % coordList.length;
      currentFailures++;
    }
  }
}

const generateSand = (terrainGrid: TerrainType[][], coordList: { y: number, x: number }[]) => {
  const maxSands: number = Math.floor(coordList.length / 8) + Math.floor((Math.random() - 0.5) * (coordList.length / 8));
  let currentSands: number = 0;
  let currentFailures: number = 0;
  let coordIndex: number = 0;

  while (currentSands < maxSands && currentFailures < MaxFailures) {
    const coord = coordList[coordIndex];

    if (coord.y < (terrainGrid.length * 0.75) &&

      ((coord.x !== 0 && (terrainGrid[coord.y][coord.x - 1] === TerrainType.ocean || terrainGrid[coord.y][coord.x - 1] === TerrainType.sand)) ||
        (coord.x !== terrainGrid[coord.y].length - 1 && (terrainGrid[coord.y][coord.x + 1] === TerrainType.ocean || terrainGrid[coord.y][coord.x + 1] === TerrainType.sand)) ||
        (coord.y !== 0 && isFlatTop(coord.x, coord.y) && (terrainGrid[coord.y - 1][coord.x] === TerrainType.ocean || terrainGrid[coord.y - 1][coord.x] === TerrainType.sand)))) {
      terrainGrid[coord.y][coord.x] = TerrainType.sand;
      coordList.splice(coordIndex, 1);
      currentSands++;
      coordIndex = coordIndex % coordList.length;
      currentFailures = 0;
    } else {
      coordIndex = (coordIndex + 1) % coordList.length;
      currentFailures++;
    }
  }
}

const generateHills = (terrainGrid: TerrainType[][], coordList: { y: number, x: number }[]) => {
  const maxHills: number = Math.floor(coordList.length / 8) + Math.floor((Math.random() - 0.5) * (coordList.length / 8));
  let currentHills: number = 0;
  let currentFailures: number = 0;
  let coordIndex: number = 0;
  const maxNewHills: number = 20; //TODO set this based on size of map
  let currentNewHills: number = 0;

  while (currentHills < maxHills && currentFailures < MaxFailures) {
    const coord = coordList[coordIndex];

    if (currentNewHills < maxNewHills) {
      terrainGrid[coord.y][coord.x] = TerrainType.hills;
      coordList.splice(coordIndex, 1);
      currentHills++;
      currentNewHills++;
      coordIndex = coordIndex % coordList.length;
      currentFailures = 0;
    } else if ((coord.x !== 0 && terrainGrid[coord.y][coord.x - 1] === TerrainType.hills) ||
      (coord.x !== terrainGrid[coord.y].length - 1 && terrainGrid[coord.y][coord.x + 1] === TerrainType.hills)) {
      terrainGrid[coord.y][coord.x] = TerrainType.hills;
      coordList.splice(coordIndex, 1);
      currentHills++;
      coordIndex = coordIndex % coordList.length;
      currentFailures = 0;
    } else {
      coordIndex = (coordIndex + 1) % coordList.length;
      currentFailures++;
    }
  }
}


const generateRock = (terrainGrid: TerrainType[][], coordList: { y: number, x: number }[]) => {
  const maxRock: number = Math.floor(coordList.length / 8) + Math.floor((Math.random() - 0.5) * (coordList.length / 8));
  let currentRock: number = 0;
  let currentFailures: number = 0;
  let coordIndex: number = 0;
  const maxNewRock: number = 20; //TODO set this based on size of map
  let currentNewRock: number = 0; 

  while (currentRock < maxRock && currentFailures < MaxFailures) {
    const coord = coordList[coordIndex];

    if (currentNewRock < maxNewRock) {
      terrainGrid[coord.y][coord.x] = TerrainType.rock;
      coordList.splice(coordIndex, 1);
      currentRock++;
      currentNewRock++;
      coordIndex = coordIndex % coordList.length;
      currentFailures = 0;
    } else if ((coord.x !== 0 && terrainGrid[coord.y][coord.x - 1] === TerrainType.rock) ||
      (coord.x !== terrainGrid[coord.y].length - 1 && terrainGrid[coord.y][coord.x + 1] === TerrainType.rock)) {
      terrainGrid[coord.y][coord.x] = TerrainType.rock;
      coordList.splice(coordIndex, 1);
      currentRock++;
      coordIndex = coordIndex % coordList.length;
      currentFailures = 0;
    } else {
      coordIndex = (coordIndex + 1) % coordList.length;
      currentFailures++;
    }
  }
}

export const generateTerrainGrid = (size: number) => {
  let terrainGrid: TerrainType[][] = [];
  const terrainWidth = (size * 2) + 1;
  const terrainHeight = size * 2;

  const unshuffledCoordList: { y: number, x: number }[] = [];

  for (let y = 0; y < terrainHeight; y++) {
    const row: TerrainType[] = [];

    for (let x = 0; x < terrainWidth; x++) {
      row.push(TerrainType.none);
      unshuffledCoordList.push({ y: y, x: x });
    }

    terrainGrid.push(row);
  }

  let coordList: { y: number, x: number }[] = [];

  while (unshuffledCoordList.length > 0) {
    coordList.push(unshuffledCoordList.splice(Math.floor(Math.random() * Math.floor(unshuffledCoordList.length)), 1)[0]);
  }

  generateOceans(terrainGrid, coordList);
  generateRivers(terrainGrid, coordList);
  generateMountains(terrainGrid, coordList);
  generateIce(terrainGrid, coordList);
  generateSand(terrainGrid, coordList);
  generateHills(terrainGrid, coordList);
  generateRock(terrainGrid, coordList);

  // fill in the rest with plains!

  for (var i = 0; i < coordList.length; i++) {
    const coord = coordList[i];

    terrainGrid[coord.y][coord.x] = TerrainType.plains;
  }

  return terrainGrid;
}
