export enum TovelundElementType {
  None = "NONE",
  Rectangle = "RECTANGLE",
  Point = "POINT",
  Line = "LINE",
  Vertex = "VERTEX"
}

export enum TovelundPointSize {
  Small = "SMALL",
  Large = "LARGE"
}

export enum TovelundFeatureType {
  None = "NONE",
  Airport = "AIRPORT",
  Forest = "FOREST",
  House = "HOUSE",
  Lighthouse = "LIGHTHOUSE",
  Mountain = "MOUNTAIN",
  Plains = "PLAINS",
  Railway = "RAILWAY",
  Road = "ROAD",
  Seaport = "SEAPORT",
  Station = "STATION",
  Store = "STORE",
  Warehouse = "WAREHOUSE",
  Water = "WATER"
}

export interface TovelundPoint {
  id: string,
  attributes: { [key: string]: any; },
  x: number,
  y: number
}

export interface TovelundLine {
  id: string,
  attributes: { [key: string]: any; },
  vertices: { id: string, x: number, y: number }[]
}

export interface ITovelundRule {
  id: string,
  type: string
}

export interface TovelundQuantityRule extends ITovelundRule {
  id: string,
  type: "QUANTITY",
  featureIds: string[],
  quantities: number[]
}

export interface TovelundRelationshipRule extends ITovelundRule {
  id: string,
  type: "RELATIONSHIP",
  entityGroupTypeIds: string[],
  mode: string,
  logic: string,
  featureStartIds: string[],
  featureEndIds: string[]
}

export interface TovelundDistanceRule extends ITovelundRule {
  id: string,
  type: "DISTANCE",
  entityGroupTypeIds: string[],
  mode: string,
  distances?: number[],
  featureStartIds: string[],
  featureMiddleIds: string[],
  featureEndIds: string[]
}

export interface TovelundSequenceRule extends ITovelundRule {
  id: string,
  type: "SEQUENCE",
  entityGroupTypeIds: string[],
  mode: string,
  canRevisit: boolean,
  featureIds: string[][]
}

export interface TovelundFeature {
  id: string,
  type: string,
  name: string,
  symbol: string
}

export interface TovelundFeatureCollection {
  id: string,
  name: string,
  color: string,
  set: TovelundFeature[]
}

export interface TovelundEntityGroup {
  id: string,
  entityGroupTypeId: string,
  entityIds: string[]
}

export interface TovelundClue {
  id: string,
  description: string,
  rules: ITovelundRule[],
  passes?: boolean,
  checked?: boolean
}

export interface TovelundEntity {
  id: string,
  name: string,
  fixedFeatureId?: string,
  selectedFeatureId?: string,
  rectangle?: { id: string, attributes: { [key: string]: any; }, x: number, y: number },
  points: TovelundPoint[],
  lines: TovelundLine[],
  innerPencilFeatureIds?: string[],
  outerPencilFeatureIds?: string[],
  featureCollectionId: string
}

export interface TovelundPuzzleDesign {
  scale: number,
  entities: TovelundEntity[],
  entityGroups: TovelundEntityGroup[],
  clues: TovelundClue[],
  featureCollections: TovelundFeatureCollection[],
  entityGroupTypes: { id: string, name: string }[]
}
