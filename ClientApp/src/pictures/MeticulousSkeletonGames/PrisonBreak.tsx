import { GameOptionDetails } from "../../common/Interfaces";
import { FontFamily, LayerType } from "../../common/Enums";

export const PrisonBreak: GameOptionDetails = {
  id: "prisonbreak",
  name: "Prison Break",
  prompt: `"I want to break free," sang Queen. Probably not in relation to literal incarceration though.`,
  footnote: "This was the sunset in Gisborne on the 31st of December 2019. I also saw the first light near here on the 1st of January 2000. Gisborne seems to be a bookend for the decades.",
  substituteTexts: [
    {
      displayedText: "guard",
      isRequired: true,
      variantTexts: [
        {
          shownText: "guard",
          hiddenText: "dolphin"
        }
      ]
    },
    {
      displayedText: "handcuffs",
      isRequired: true,
      variantTexts: [
        {
          shownText: "handcuffs",
          hiddenText: "moorings"
        }
      ]
    },
    {
      displayedText: "lock pick",
      isRequired: true,
      variantTexts: [
        {
          shownText: "lock pick",
          hiddenText: "life preserver"
        }
      ]
    },
    {
      displayedText: "security camera",
      isRequired: true,
      variantTexts: [
        {
          shownText: "security cameras",
          hiddenText: "dusk skies"
        },
        {
          shownText: "security camera",
          hiddenText: "dusk sky"
        }
      ]
    },
    {
      displayedText: "prison",
      isRequired: false,
      variantTexts: [
        {
          shownText: "prisoner",
          hiddenText: "mariner"
        },
        {
          shownText: "prison",
          hiddenText: "harbour"
        }
      ]
    },
    {
      displayedText: "lock",
      isRequired: false,
      variantTexts: [
        {
          shownText: "locks",
          hiddenText: "lives"
        },
        {
          shownText: "lock",
          hiddenText: "life"
        }
      ]
    },
    {
      displayedText: "pick",
      isRequired: false,
      variantTexts: [
        {
          shownText: "pick",
          hiddenText: "save"
        }
      ]
    }
  ],
  layers: [
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "#59e",
      textColor: "#fff",
      horizontalPosition: 0.78,
      verticalPosition: 0.05,
      horizontalAlignment: 0,
      verticalAlignment: 0.5,
      fontSize: 8,
      fontFamily: FontFamily.Serif,
      maximumLength: 76,
      rotation: -2.5,
    },
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "#6ad",
      textColor: "#fff",
      horizontalPosition: 0.81,
      verticalPosition: 0.091,
      horizontalAlignment: 0,
      verticalAlignment: 0.5,
      fontSize: 9,
      fontFamily: FontFamily.Serif,
      maximumLength: 66,
      rotation: -2.5,
    },
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "#7bc",
      textColor: "#fff",
      horizontalPosition: 0.84,
      verticalPosition: 0.138,
      horizontalAlignment: 0,
      verticalAlignment: 0.5,
      fontSize: 10,
      fontFamily: FontFamily.Serif,
      maximumLength: 54,
      rotation: -2.5,
    },
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "#eb8",
      textColor: "#fff",
      horizontalPosition: 0.87,
      verticalPosition: 0.192,
      horizontalAlignment: 0,
      verticalAlignment: 0.5,
      fontSize: 11,
      fontFamily: FontFamily.Serif,
      maximumLength: 38,
      rotation: -2.5,
    },
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "#e96",
      textColor: "#fff",
      horizontalPosition: 0.9,
      verticalPosition: 0.25,
      horizontalAlignment: 0,
      verticalAlignment: 0.5,
      fontSize: 12,
      fontFamily: FontFamily.Serif,
      maximumLength: 19,
      rotation: -2.5,
    }
  ],
  height: 600,
  width: 900,
  base: "MeticulousSkeleton/PrisonBreak.png",
  lotoColour: "#037",
  lotoBackground: "#fec"
};
