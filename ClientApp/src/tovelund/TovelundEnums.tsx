// from https://www.nature.com/articles/nmeth.1618

export enum TovelundColor {
  Black = "rgb(0,0,0)",
  Orange = "rgb(230,159,0)",
  SkyBlue = "rgb(86,180,233)",
  BluishGreen = "rgb(0,158,115)",
  Yellow = "rgb(240,228,66)",
  Blue = "rgb(0,114,178)",
  Vermillion = "rgb(213,94,0)",
  ReddishPurple = "rgb(204,121,167)",
  White = "rgb(255,255,255)",
  Transparent = "transparent"
}

export enum TovelundElementType {
  None = "NONE",
  Destination = "DESTINATION",
  Route = "ROUTE",
  Zone = "ZONE"
}

export enum TovelundIndexType {
  None = "NONE",
  Feature = "FEATURE",
  Point = "POINT"
}

export enum TovelundFeatureSize {
  Small = "SMALL",
  Medium = "MEDIUM",
  Large = "LARGE"
}

export enum TovelundDestinationName {
  None = "NONE",
  Airfield = "AIRFIELD",
  Butcher = "BUTCHER",
  House = "HOUSE",
  Library = "LIBRARY",
  Lighthouse = "LIGHTHOUSE",
  Port = "PORT",
  Store = "STORE",
  Warehouse = "WAREHOUSE"
}

export enum TovelundZoneName {
  None = "NONE",
  Forest = "FOREST",
  Mountains = "MOUNTAINS",
  Water = "WATER"
}

export enum TovelundRouteName {
  None = "NONE",
  Road = "ROAD",
  Railway = "RAILWAY"
}

export interface TovelundPoint {
  x: number,
  y: number
}

export interface TovelundDestination {
  id: number,
  fixedName?: string,
  selectedName?: string,
  symbolColors: { [symbolName: string]: TovelundColor };
  point: TovelundPoint,
  angle: "HORIZONTAL" | "VERTICAL",
}

export interface TovelundRoute {
  id: number,
  name: string,
  points: TovelundPoint[]
}

export interface TovelundZoneFeature {
  point: TovelundPoint,
  shape: string
}

export interface TovelundZone {
  id: number,
  name: string,
  points?: TovelundPoint[],
  features: TovelundZoneFeature[]
}

export interface TovelundSymbol {
  type: string,
  name: string,
  symbol: string
}

export interface TovelundElementId {
  type: string,
  id: number
}

export interface TovelundGameDetails {
  id: number,
  title: string
}

export interface ITovelundRule {
  ruleType: string
}

export interface TovelundElementName {
  type: string,
  name: string
}

export interface TovelundRangeRule extends ITovelundRule {
  ruleType: "RANGE",
  element: TovelundElementName,
  min?: number,
  max?: number
}

export interface TovelundRelationshipRule extends ITovelundRule {
  ruleType: "RELATIONSHIP",
  mode: "INCLUDE" | "EXCLUDE"
  element: TovelundElementName,
  relationshipElements: TovelundElementName[]
}

export interface TovelundClue {
  description: string,
  rules: ITovelundRule[],
  passes?: boolean
}

export interface TovelundGame {
  scale: number,
  symbols: TovelundSymbol[],
  destinations: TovelundDestination[],
  routes: TovelundRoute[],
  zones: TovelundZone[],
  relationships: TovelundElementId[][],
  clues: TovelundClue[]
}
