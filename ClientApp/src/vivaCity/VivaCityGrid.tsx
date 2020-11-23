import * as React from 'react';
import { TerrainType, LocationType } from "./VivaCityTypes";
import { getBottom } from "./TerrainAssets";

type TerrainLocations = {
  [key in TerrainType]: LocationType[]
}

export const TerrainLocations: TerrainLocations = {
  [TerrainType.hills]: [LocationType.commercial, LocationType.residential],
  [TerrainType.ice]: [LocationType.sport, LocationType.services],
  [TerrainType.mountains]: [LocationType.resources, LocationType.sport],
  [TerrainType.ocean]: [LocationType.transportation],
  [TerrainType.plains]: [LocationType.residential],
  [TerrainType.river]: [LocationType.leisure],
  [TerrainType.rock]: [LocationType.industrial],
  [TerrainType.sand]: [LocationType.education],
  [TerrainType.none]: []
}

export interface Hint {
  maximum: number, // the maximum number of this type that the token can be next to
  displayed: number, // the currently displayed number that tokens of this type can be next to
  current: number // the current number of this type that the token is next to
}

export interface Token {
  id: number,
  locationType: LocationType,
  baseTerrainType: TerrainType,
  isLocked: boolean,
  terrainHints: { [type: string]: Hint; },
  locationHints: { [type: string]: Hint; },
  neighbours: { [id: number]: boolean; },
  isUnhappy: boolean,
  x: number,
  y: number
}

export interface Tile {
  isHover: boolean,
  token: Token | undefined
}

interface VivaCityGridProps {
  terrainGrid: TerrainType[][],
  tileGrid: Tile[][],
  onMouseEnter: (y: number, x: number) => void,
  onMouseLeave: (y: number, x: number) => void,
  onClick: (y: number, x: number, tokenId: number) => void,
  selectedTokenId: number
}

export const isOdd = (i: number) => {
  return (i % 2) === 1;
}

const getTerrainColour = (terrainType: TerrainType) => {
  switch (terrainType) {
    case TerrainType.hills:
      return "#340";
    case TerrainType.ice:
      return "#fff";
    case TerrainType.mountains:
      return "#122";
    case TerrainType.ocean:
      return "#03e";
    case TerrainType.plains:
      return "#3d2";
    case TerrainType.river:
      return "#4df";
    case TerrainType.rock:
      return "#e50";
    case TerrainType.sand:
      return "#ee3";
    case TerrainType.none:
    default:
      return "#f00"
  }
}

const getLocationShape = (locationType: LocationType) => {
  switch (locationType) {
    case LocationType.commercial:
      return "M 60,80 L 120,60 L 120,80 L 140,70 L 140,120 L 80,140 L 80,120 L 60,130 Z";
    case LocationType.education:
      return "M 100,80 L 140,60 L 140,120 L100,140 L60,120 L60,60 Z";
    case LocationType.entertainment:
      return "M 60,80 L 140,60 L 140,140 L 60,120 Z";
    case LocationType.industrial:
      return "M 60,70 L 100,60 L 100,70 L 140,60 L 140,140 L 60,140 Z";
    case LocationType.leisure:
      return "M 100,60 L 120,120 L 110,120 L 110,140 L 90,140 L 90,120 L 80, 120 Z";
    case LocationType.power:
      return "M 100,60 L 140,110 L 100,110 L 100,140 L 60,90 L 100, 90 Z";
    case LocationType.residential:
      return "M 100,60 L 140,100 L 120,100 L 120,140 L 80,140 L 80,100 L 60,100 Z";
    case LocationType.resources:
      return "M 100,60 L 140,70 L 140,130 L 100,140 L 60,130 L 60,70 Z";
    case LocationType.services:
      return "M 60,90 L 110,90 L 120,70 L 140,70 L 140,80 L 120,80 L 120,120 L 140,120 L 140,130 L 120,130 L 110, 110 L 60,110 Z";
    case LocationType.sport:
      return "M 100,60 L 130,70 L 140,100 L 130,130 L 100,140 L 70,130 L 60,100 L 70,70 Z";
    case LocationType.transportation:
    default:
      return "M 60,90 L 130,90 L 140,110 L 60,110 Z";
  }
}

export const VivaCityGrid: React.StatelessComponent<VivaCityGridProps> = (props) => {
  const terrains: JSX.Element[] = [];

  for (let y = 0; y < props.terrainGrid.length; y++) {
    const row = props.terrainGrid[y];

    for (let x = 0; x < row.length; x++) {
      if ((!isOdd(y) && isOdd(x)) || (x !== 0 && x !== row.length - 1 && isOdd(y) && !isOdd(x))) {
        terrains.push(<g key={`terrain-x${x}y${y}`} transform={`matrix(1,0,0,1,${(x * 100) - 100},${y * 100})`}>
          <path d="M 0,0 L 200,0 L 100,100 Z" style={{ fill: getTerrainColour(props.terrainGrid[y][x]) }} />
        </g>);
      }

      if ((x !== 0 && x !== row.length - 1 && !isOdd(y) && !isOdd(x)) || (isOdd(y) && isOdd(x))) {
        terrains.push(<g key={`terrain-x${x}y${y}`} transform={`matrix(1,0,0,1,${(x * 100) - 100},${y * 100})`}>
          {getBottom(props.terrainGrid[y][x])}
        </g>);
      }

      if (x === 0 && isOdd(y)) {
        terrains.push(<g key={`terrain-x${x}y${y}`} transform={`matrix(1,0,0,1,0,${(y * 100)})`}>
          <path d="M 0,0 L 100,0 L 0,100 Z" style={{ fill: getTerrainColour(props.terrainGrid[y][x]) }} />
        </g>);
      }

      if (x === 0 && !isOdd(y)) {
        terrains.push(<g key={`terrain-x${x}y${y}`} transform={`matrix(1,0,0,1,0,${(y * 100)})`}>
          <path d="M 0,0 L 100,100 L 0,100 Z" style={{ fill: getTerrainColour(props.terrainGrid[y][x]) }} />
        </g>);
      }

      if (x === row.length - 1 && isOdd(y)) {
        terrains.push(<g key={`terrain-x${x}y${y}`} transform={`matrix(1,0,0,1,${(x * 100) - 100},${(y * 100)})`}>
          <path d="M 0,0 L 100,0 L 100,100 Z" style={{ fill: getTerrainColour(props.terrainGrid[y][x]) }} />
        </g>);
      }

      if (x === row.length - 1 && !isOdd(y)) {
        terrains.push(<g key={`terrain-x${x}y${y}`} transform={`matrix(1,0,0,1,${(x * 100) - 100},${(y * 100)})`}>
          <path d="M 100,0 L 100,100 L 0,100 Z" style={{ fill: getTerrainColour(props.terrainGrid[y][x]) }} />
        </g>);
      }
    }
  }

  const tokens: JSX.Element[] = [];

  for (let y = 0; y < props.tileGrid.length; y++) {
    const row = props.tileGrid[y];

    for (let x = 0; x < row.length; x++) {
      const tile = props.tileGrid[y][x];

      let tokenId = tile.token !== undefined ? tile.token.id : -1;

      tokens.push(<g key={`zone-x${x}y${y}`} transform={`matrix(1,0,0,1,${(isOdd(y) ? 100 : 0) + (x * 200)},${y * 100})`}>
        {tile.token !== undefined && <path
          fill={tile.token.id === props.selectedTokenId ? "#0f0" : (tile.token.isUnhappy ? "#f00" : (tile.token.isLocked ? "#0ff" : "#000"))}
          d={getLocationShape(tile.token.locationType)}
        />}
        <path
          d="M 100,0 L 200,100 L 100,200 L 0,100 Z"
          opacity={tile.isHover ? 0.2 : 0}
          onClick={() => props.onClick(y, x, tokenId)}
          onMouseLeave={() => props.onMouseLeave(y, x)}
          onMouseEnter={() => props.onMouseEnter(y, x)}
          style={{ cursor: "pointer" }}
        />
      </g>);
    }
  }

  return <svg
    width="100%"
    height="100%"
    viewBox={`0 0 ${props.tileGrid[0].length * 200} ${(props.tileGrid.length * 100) + 100}`}
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    xmlSpace="preserve"
    style={{ fillRule: "evenodd", clipRule: "evenodd", strokeLinejoin: "round", strokeMiterlimit: 2, width: "24em", maxWidth: "100%" }}>
    {terrains}
    {tokens}
  </svg>
}
