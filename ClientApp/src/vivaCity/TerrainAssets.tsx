import * as React from "react";
import { TerrainType } from "./VivaCityTypes";

export const getBottom = (terrainType: TerrainType) => {
  switch (terrainType) {
    case TerrainType.hills:
      return BottomHills;
    case TerrainType.ice:
      return BottomIce;
    case TerrainType.mountains:
      return BottomMountains;
    case TerrainType.ocean:
      return BottomOcean;
    case TerrainType.plains:
      return BottomPlains;
    case TerrainType.river:
      return BottomRiver;
    case TerrainType.rock:
      return BottomRock;
    case TerrainType.sand:
      return BottomSand;
    case TerrainType.none:
    default:
      return <path d="M 100,0 L 200,100 L 0,100 Z" style={{ fill: "#f00" }} />;
  }
}

const BottomHills = <>
  <path d="M 100,0 L 200,100 L 0,100 Z" style={{ fill: "#340" }} />
</>;

const BottomIce = <>
  <path d="M 100,0 L 200,100 L 0,100 Z" style={{ fill: "#fff" }} />
  <g transform="matrix(1,0,0,0.75,0,22.5)">
    <path d="M30,90L40,70L70,70L60,90L30,90Z" style={{ fill: "#adf" }} />
  </g>
  <g transform="matrix(1,0,0,0.75,50,-17.5)">
    <path d="M30,90L40,70L70,70L60,90L30,90Z" style={{ fill: "#adf" }} />
  </g>
  <g transform="matrix(-1,0,0,0.75,190,17.5)">
    <path d="M30,90L40,70L70,70L60,90L30,90Z" style={{ fill: "#adf" }} />
  </g>
  <g transform="matrix(-1,0,0,0.75,140,7.5)">
    <path d="M30,90L40,70L70,70L60,90L30,90Z" style={{ fill: "#adf" }} />
  </g>
</>;

const BottomMountains = <>
  <path d="M 100,0 L 200,100 L 0,100 Z" style={{ fill: "#122" }} />
  <g transform="matrix(2,0,0,1.5,0,0)">
    <path d="M25,40L30,60L20,60L25,40Z" style={{ fill: "#fff" }} />
  </g>
  <g transform="matrix(2,0,0,1.5,90,-10)">
    <path d="M25,40L30,60L20,60L25,40Z" style={{ fill: "#fff" }} />
  </g>
  <g transform="matrix(2,0,0,1.5,40,0)">
    <path d="M25,40L30,60L20,60L25,40Z" style={{ fill: "#fff" }} />
  </g>
  <g transform="matrix(2,0,0,1.5,60,-30)">
    <path d="M25,40L30,60L20,60L25,40Z" style={{ fill: "#fff" }} />
  </g>
</>;

const BottomOcean = <>
  <path d="M 100,0 L 200,100 L 0,100 Z" style={{ fill: "#03e" }} />
</>;

const BottomPlains = <>
  <path d="M 100,0 L 200,100 L 0,100 Z" style={{ fill: "#3d2" }} />
  <g transform="matrix(1,0,0,1,130,30)">
    <path d="M25,40L30,60L20,60L25,40Z" style={{ fill: "#270" }} />
  </g>
  <g transform="matrix(1,0,0,1,90,-10)">
    <path d="M25,40L30,60L20,60L25,40Z" style={{ fill: "#270" }} />
  </g>
  <g transform="matrix(1,0,0,1,110,20)">
    <path d="M25,40L30,60L20,60L25,40Z" style={{ fill: "#270" }} />
  </g>
  <g transform="matrix(1,0,0,1,70,-20)">
    <path d="M25,40L30,60L20,60L25,40Z" style={{ fill: "#270" }} />
  </g>
  <g transform="matrix(1,0,0,1,50,10)">
    <path d="M25,40L30,60L20,60L25,40Z" style={{ fill: "#270" }} />
  </g>
  <g transform="matrix(1,0,0,1,70,20)">
    <path d="M25,40L30,60L20,60L25,40Z" style={{ fill: "#270" }} />
  </g>
  <g transform="matrix(1,0,0,1,20,30)">
    <path d="M25,40L30,60L20,60L25,40Z" style={{ fill: "#270" }} />
  </g>
</>;

const BottomRiver = <>
  <path d="M 100,0 L 200,100 L 0,100 Z" style={{ fill: "#4df" }} />
</>;

const BottomRock = <>
  <path d="M 100,0 L 200,100 L 0,100 Z" style={{ fill: "#e50" }} />
  <path d="M30,90L40,70L70,70L60,90L30,90Z" style={{ fill: "#762" }} />
  <g transform="matrix(1,0,0,1,40,-35)">
    <path d="M30,90L40,70L70,70L60,90L30,90Z" style={{ fill: "#762" }} />
  </g>
  <g transform="matrix(-1,0,0,1,180,-5)">
    <path d="M30,90L40,70L70,70L60,90L30,90Z" style={{ fill: "#762" }} />
  </g>
</>;

const BottomSand = <>
  <path d="M 100,0 L 200,100 L 0,100 Z" style={{ fill: "#ee3" }} />
</>;
