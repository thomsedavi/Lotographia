import { GameOptionDetails } from "../../common/Interfaces";
import { FontFamily, LayerType, Orientation } from "../../common/Enums";

export const ToyBox: GameOptionDetails = {
  id: "toybox",
  name: "Toy Box",
  prompt: "Playtime! What wonders can you achieve with a set of basic wooden blocks?",
  footnote: `Most other photos in this game were taken BY me, this is a photo OF me taken by Venetia King in February 2019. While I mostly remember Lego, Transformers and Micro Machines as my childhood toys because I collect them as an adult, I am still familiar with every scratch on the set of wooden blocks in this picture.`,
  height: 600,
  width: 900,
  orientation: Orientation.Landscape,
  base: "Capricotta/ToyBox.png",
  lotoColour: "#fff",
  lotoBackground: "none",
  substituteTexts: [
    {
      displayedText: "toy box",
      isRequired: true,
      variantTexts: [
        {
          shownText: "toy boxes",
          hiddenText: "deep subsconsciouses"
        },
        {
          shownText: "toy box",
          hiddenText: "deep subsconscious"
        }
      ]
    },
    {
      displayedText: "block",
      isRequired: true,
      variantTexts: [
        {
          shownText: "blocks",
          hiddenText: "whims"
        },
        {
          shownText: "block",
          hiddenText: "whim"
        }
      ]
    },
    {
      displayedText: "play",
      isRequired: true,
      variantTexts: [
        {
          shownText: "playing",
          hiddenText: "dreaming"
        },
        {
          shownText: "play",
          hiddenText: "dream"
        }
      ]
    },
    {
      displayedText: "wood",
      isRequired: true,
      variantTexts: [
        {
          shownText: "wooden",
          hiddenText: "evanescent"
        },
        {
          shownText: "wood",
          hiddenText: "evanescence"
        }
      ]
    }
  ],
  layers: [
    {
      "layerType": LayerType.Phrase,
      "isVisible": false,
      "backgroundColor": "#c1e02e",
      "textColor": "#000",
      "horizontalPosition": 0.05,
      "verticalPosition": 0.08,
      "horizontalAlignment": 0.9,
      "verticalAlignment": 0.5,
      "fontSize": 9,
      "fontFamily": FontFamily.SansSerif,
      "maximumLength": 17,
      "rotation": -5
    },
    {
      "layerType": LayerType.Phrase,
      "isVisible": false,
      "backgroundColor": "#c12e2e",
      "textColor": "#fff",
      "horizontalPosition": 0.05,
      "verticalPosition": 0.11,
      "horizontalAlignment": 1,
      "verticalAlignment": 0.5,
      "fontSize": 9,
      "fontFamily": FontFamily.SansSerif,
      "maximumLength": 21,
      "rotation": 5
    },
    {
      "layerType": LayerType.Phrase,
      "isVisible": false,
      "backgroundColor": "#087117",
      "textColor": "#fff",
      "horizontalPosition": 0.25,
      "verticalPosition": 0.22,
      "horizontalAlignment": 0,
      "verticalAlignment": 0.5,
      "fontSize": 9,
      "fontFamily": FontFamily.SansSerif,
      "maximumLength": 18,
      "rotation": -5
    },
    {
      "layerType": LayerType.Phrase,
      "isVisible": false,
      "backgroundColor": "#0f2ee0",
      "textColor": "#fff",
      "horizontalPosition": 0.25,
      "verticalPosition": 0.22,
      "horizontalAlignment": 1,
      "verticalAlignment": 0.5,
      "fontSize": 9,
      "fontFamily": FontFamily.SansSerif,
      "maximumLength": 27,
      "rotation": -5
    },
    {
      "layerType": LayerType.Phrase,
      "isVisible": false,
      "backgroundColor": "#ff4500",
      "textColor": "#fff",
      "horizontalPosition": 0.25,
      "verticalPosition": 0.6,
      "horizontalAlignment": 0,
      "verticalAlignment": 1,
      "fontSize": 9,
      "fontFamily": FontFamily.SansSerif,
      "maximumLength": 17,
      "rotation": 45
    },
    {
      "layerType": LayerType.Phrase,
      "isVisible": false,
      "backgroundColor": "#c1e02e",
      "textColor": "#000",
      "horizontalPosition": 0.25,
      "verticalPosition": 0.6,
      "horizontalAlignment": 1,
      "verticalAlignment": 1,
      "fontSize": 9,
      "fontFamily": FontFamily.SansSerif,
      "maximumLength": 29,
      "rotation": 15
    },
    {
      "layerType": LayerType.Phrase,
      "isVisible": false,
      "backgroundColor": "#0f2ee0",
      "textColor": "#fff",
      "horizontalPosition": 0.2,
      "verticalPosition": 0.75,
      "horizontalAlignment": 0,
      "verticalAlignment": 1,
      "fontSize": 9,
      "fontFamily": FontFamily.SansSerif,
      "maximumLength": 11,
      "rotation": 30
    },
    {
      "layerType": LayerType.Phrase,
      "isVisible": false,
      "backgroundColor": "#ff4500",
      "textColor": "#fff",
      "horizontalPosition": 0.2,
      "verticalPosition": 0.75,
      "horizontalAlignment": 1,
      "verticalAlignment": 1,
      "fontSize": 9,
      "fontFamily": FontFamily.SansSerif,
      "maximumLength": 23,
      "rotation": 10
    },
    {
      "layerType": LayerType.Phrase,
      "isVisible": false,
      "backgroundColor": "#c12e2e",
      "textColor": "#fff",
      "horizontalPosition": 0.8,
      "verticalPosition": 0.82,
      "horizontalAlignment": 1,
      "verticalAlignment": 0.5,
      "fontSize": 9,
      "fontFamily": FontFamily.SansSerif,
      "maximumLength": 14,
      "rotation": -10
    },
    {
      "layerType": LayerType.Phrase,
      "isVisible": false,
      "backgroundColor": "#087117",
      "textColor": "#fff",
      "horizontalPosition": 0.81,
      "verticalPosition": 0.91,
      "horizontalAlignment": 1,
      "verticalAlignment": 0.5,
      "fontSize": 9,
      "fontFamily": FontFamily.SansSerif,
      "maximumLength": 11,
      "rotation": -12
    }
  ]
};