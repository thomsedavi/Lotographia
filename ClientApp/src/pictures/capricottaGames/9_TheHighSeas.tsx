import { GameOptionDetails } from "../../common/Interfaces";
import { FontFamily, LayerType, Orientation } from "../../common/Enums";

export const TheHighSeas: GameOptionDetails = {
  id: "thehighseas",
  name: "The High Seas",
  prompt: "Prepare for nautical adventure! Raise the anchor, stow the cargo crates and get ready to explore the ocean with nothing but a packet of ship's biscuit.",
  footnote: "I took this photo in Lyall Bay in Wellington, was disappointed to discover an identical ship in Ōpunake! I feel like playgrounds should be unique, not come from kit sets.",
  height: 900,
  width: 600,
  orientation: Orientation.Portrait,
  base: "Capricotta/TheHighSeas.png",
  lotoColour: "#f00",
  lotoBackground: "#ff6",
  substituteTexts: [
    {
      displayedText: "anchor",
      isRequired: true,
      variantTexts: [
        {
          shownText: "anchor",
          hiddenText: "transformer"
        }
      ]
    }, // anchor => transformer
    {
      displayedText: "cargo crates",
      isRequired: true,
      variantTexts: [
        {
          shownText: "cargo crates",
          hiddenText: "lego bricks"
        }
      ]
    }, // cargo crates => lego bricks
    {
      displayedText: "ship's biscuit",
      isRequired: true,
      variantTexts: [
        {
          shownText: "ship's biscuits",
          hiddenText: "silly putties"
        },
        {
          shownText: "ship's biscuit",
          hiddenText: "silly putty"
        }
      ]
    }, // ship's biscuit => silly putty
    {
      displayedText: "nautical",
      isRequired: true,
      variantTexts: [
        {
          shownText: "nautical",
          hiddenText: "playmobil"
        }
      ]
    }, // nautical => playmobil
    {
      displayedText: "ocean",
      isRequired: true,
      variantTexts: [
        {
          shownText: "ocean",
          hiddenText: "playground"
        }
      ]
    }, // ocean => playground
  ],
  layers: [
    {
      "layerType": LayerType.Phrase,
      "isVisible": false,
      "backgroundColor": "#ddb",
      "textColor": "#000",
      "horizontalPosition": 0.1,
      "verticalPosition": 0.06,
      "horizontalAlignment": 0.95,
      "verticalAlignment": 0.5,
      "fontSize": 10,
      "fontFamily": FontFamily.Gandhi,
      "maximumLength": 44,
      "rotation": -2
    },
    {
      "layerType": LayerType.Phrase,
      "isVisible": false,
      "backgroundColor": "#ccb",
      "textColor": "#000",
      "horizontalPosition": 0.1,
      "verticalPosition": 0.085,
      "horizontalAlignment": 1,
      "verticalAlignment": 0.5,
      "fontSize": 10,
      "fontFamily": FontFamily.Gandhi,
      "maximumLength": 42,
      "rotation": 2
    },
    {
      "layerType": LayerType.Phrase,
      "isVisible": false,
      "backgroundColor": "#cba",
      "textColor": "#000",
      "horizontalPosition": 0.45,
      "verticalPosition": 0.15,
      "horizontalAlignment": 0,
      "verticalAlignment": 0.5,
      "fontSize": 10,
      "fontFamily": FontFamily.Gandhi,
      "maximumLength": 19,
      "rotation": 2
    },
    {
      "layerType": LayerType.Phrase,
      "isVisible": false,
      "backgroundColor": "#cba",
      "textColor": "#000",
      "horizontalPosition": 0.57,
      "verticalPosition": 0.153,
      "horizontalAlignment": 1,
      "verticalAlignment": 0.5,
      "fontSize": 10,
      "fontFamily": FontFamily.Gandhi,
      "maximumLength": 18,
      "rotation": 2
    },
    {
      "layerType": LayerType.Phrase,
      "isVisible": false,
      "backgroundColor": "#ddb",
      "textColor": "#000",
      "horizontalPosition": 0.45,
      "verticalPosition": 0.195,
      "horizontalAlignment": 0,
      "verticalAlignment": 0.5,
      "fontSize": 10,
      "fontFamily": FontFamily.Gandhi,
      "maximumLength": 19,
      "rotation": -2
    },
    {
      "layerType": LayerType.Phrase,
      "isVisible": false,
      "backgroundColor": "#ddb",
      "textColor": "#000",
      "horizontalPosition": 0.9,
      "verticalPosition": 0.185,
      "horizontalAlignment": 0,
      "verticalAlignment": 0.5,
      "fontSize": 10,
      "fontFamily": FontFamily.Gandhi,
      "maximumLength": 16,
      "rotation": -2
    },
    {
      "layerType": LayerType.Phrase,
      "isVisible": false,
      "backgroundColor": "#9cf",
      "textColor": "#000",
      "horizontalPosition": 0.5,
      "verticalPosition": 0.76,
      "horizontalAlignment": 0,
      "verticalAlignment": 0.5,
      "fontSize": 11,
      "fontFamily": FontFamily.Gandhi,
      "maximumLength": 20,
      "rotation": 4
    },
    {
      "layerType": LayerType.Phrase,
      "isVisible": false,
      "backgroundColor": "#9ef",
      "textColor": "#000",
      "horizontalPosition": 0.5,
      "verticalPosition": 0.81,
      "horizontalAlignment": 0.5,
      "verticalAlignment": 0.5,
      "fontSize": 11,
      "fontFamily": FontFamily.Gandhi,
      "maximumLength": 40,
      "rotation": 4
    },
    {
      "layerType": LayerType.Phrase,
      "isVisible": false,
      "backgroundColor": "#8df",
      "textColor": "#000",
      "horizontalPosition": 0.5,
      "verticalPosition": 0.86,
      "horizontalAlignment": 1,
      "verticalAlignment": 0.5,
      "fontSize": 11,
      "fontFamily": FontFamily.Gandhi,
      "maximumLength": 20,
      "rotation": 4
    },
    {
      "layerType": LayerType.Phrase,
      "isVisible": false,
      "backgroundColor": "#9cf",
      "textColor": "#000",
      "horizontalPosition": 0.5,
      "verticalPosition": 0.91,
      "horizontalAlignment": 0.5,
      "verticalAlignment": 0.5,
      "fontSize": 11,
      "fontFamily": FontFamily.Gandhi,
      "maximumLength": 40,
      "rotation": 4
    }
  ]
};
