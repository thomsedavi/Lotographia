import { GameOptionDetails } from "../../common/Interfaces";
import { FontFamily, LayerType, Orientation } from "../../common/Enums";

export const Industry: GameOptionDetails = {
  id: "industry",
  name: "Industry",
  prompt: "The relentless wheels of industry. Will you be able to find peace amongst the noise and motion of the machines in your factory?",
  footnote: "This projector is on display at the Roxy Cinema in Miramar, Wellington.",
  height: 900,
  width: 600,
  orientation: Orientation.Portrait,
  base: "Capricotta/Industry.png",
  lotoColour: "#fff",
  lotoBackground: "#f00",
  substituteTexts: [
    {
      displayedText: "factory",
      isRequired: true,
      variantTexts: [
        {
          shownText: "factories",
          hiddenText: "cinemas"
        },
        {
          shownText: "factory",
          hiddenText: "cinema"
        }
      ]
    }, // factory => cinema
    {
      displayedText: "machine",
      isRequired: true,
      variantTexts: [
        {
          shownText: "machinery",
          hiddenText: "projectors"
        },
        {
          shownText: "machine",
          hiddenText: "projector"
        }
      ]
    }, // machine => projector
    {
      displayedText: "noise",
      isRequired: true,
      variantTexts: [
        {
          shownText: "noise",
          hiddenText: "music"
        },
        {
          shownText: "noisy",
          hiddenText: "musical"
        }
      ]
    }, // noise => music
    {
      displayedText: "motion",
      isRequired: true,
      variantTexts: [
        {
          shownText: "motion",
          hiddenText: "action"
        }
      ]
    }, // motion => action
  ],
  layers: [
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "#000",
      textColor: "#ffb",
      horizontalPosition: 0.92,
      verticalPosition: 0.04,
      horizontalAlignment: 0,
      verticalAlignment: 0.5,
      fontSize: 14,
      fontFamily: FontFamily.Monospace,
      maximumLength: 25,
      rotation: 0,
    },
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "#000",
      textColor: "#ffb",
      horizontalPosition: 0.92,
      verticalPosition: 0.09,
      horizontalAlignment: 0,
      verticalAlignment: 0.5,
      fontSize: 14,
      fontFamily: FontFamily.Monospace,
      maximumLength: 22,
      rotation: 0,
    },
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "#000",
      textColor: "#ffb",
      horizontalPosition: 0.92,
      verticalPosition: 0.14,
      horizontalAlignment: 0,
      verticalAlignment: 0.5,
      fontSize: 14,
      fontFamily: FontFamily.Monospace,
      maximumLength: 22,
      rotation: 0,
    },
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "#000",
      textColor: "#ffb",
      horizontalPosition: 0.54,
      verticalPosition: 0.19,
      horizontalAlignment: 0,
      verticalAlignment: 0.5,
      fontSize: 14,
      fontFamily: FontFamily.Monospace,
      maximumLength: 9,
      rotation: 0,
    },
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "#000",
      textColor: "#ffb",
      horizontalPosition: 0.87,
      verticalPosition: 0.17,
      horizontalAlignment: 1,
      verticalAlignment: 0.5,
      fontSize: 14,
      fontFamily: FontFamily.Monospace,
      maximumLength: 11,
      rotation: 90,
    },
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "#000",
      textColor: "#ffb",
      horizontalPosition: 0.81,
      verticalPosition: 0.54,
      horizontalAlignment: 1,
      verticalAlignment: 0.5,
      fontSize: 14,
      fontFamily: FontFamily.Monospace,
      maximumLength: 15,
      rotation: 90,
    },
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "#000",
      textColor: "#ffb",
      horizontalPosition: 0.05,
      verticalPosition: 0.91,
      horizontalAlignment: 1,
      verticalAlignment: 0.5,
      fontSize: 14,
      fontFamily: FontFamily.Monospace,
      maximumLength: 18,
      rotation: 0,
    },
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "#000",
      textColor: "#ffb",
      horizontalPosition: 0.4,
      verticalPosition: 0.96,
      horizontalAlignment: 1,
      verticalAlignment: 0.5,
      fontSize: 14,
      fontFamily: FontFamily.Monospace,
      maximumLength: 18,
      rotation: 0,
    }
  ]
};
