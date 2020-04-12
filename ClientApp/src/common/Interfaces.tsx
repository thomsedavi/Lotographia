import { TextType, TextComponentType, FontFamily, LayerType } from "./Enums";

export interface VariantText {
  shownText: string,
  hiddenText: string
}

export interface TextComponent {
  type: TextComponentType,
  variantText?: VariantText,
}

export interface TextElement {
  type: TextType,
  placeholder?: string,
  text?: string
}

export interface ProcessedText {
  remainderFraction: number,
  shownText: string,
  hiddenText: string,
  displayRemainder: boolean
}

export interface ProcessedTextsState {
  isTooLong: boolean,
  processedTexts: ProcessedText[]
}

export interface GetProcessedTextsBody {
  textComponents: TextComponent[],
  lines: Line[],
}

export interface Line {
  fontFamily: FontFamily,
  maximumLength: number
}

export interface LoadedImage {
  src: string,
  objectUrl?: string
}

export interface SubstituteTexts {
  isRequired: boolean,
  displayedText: string,
  variantTexts: VariantText[]
}

// should reduce to base layer and implement with layer types
// or in some other way not leave it as a Frankenstein
export interface Layer {
  layerType: LayerType,
  isVisible: boolean,
  fileName?: string,
  horizontalPosition?: number,
  verticalPosition?: number,
  horizontalAlignment?: number,
  verticalAlignment?: number,
  rotation?: number,
  backgroundColor?: string,
  fontFamily?: FontFamily,
  fontSize?: number,
  textColor?: string,
  deleted?: boolean,
  isDirty?: boolean,
  requiredOption?: string,
  maximumLength?: number,
  shownText?: string,
  hiddenText?: string,
  displayRemainder?: boolean,
  remainderFraction?: number
}

export interface Option {
  isSelected: boolean,
  id: string
}

export interface RequiredText {
  isMissing: boolean,
  text: string
}

export interface GameDetails {
  base: string,
  layers: Layer[],
  height: number,
  width: number,
  lotoBackground: string,
  lotoColour: string,
  substituteTexts: SubstituteTexts[]
}

export interface GameOptionDetails extends GameDetails {
  id: string,
  name: string,
  prompt: string,
  footnote: string
}
