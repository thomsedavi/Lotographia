import { GameOptionDetails } from "../../common/Interfaces";
import { FontFamily, LayerType } from "../../common/Enums";

export const SpaceVoyage: GameOptionDetails = {
  id: "spacevoyage",
  name: "Space Voyage",
  prompt: "An adventure travelling between the stars",
  footnote: "Photo taken on the Devonport Ferry in Auckland, June 2019. I enjoyed the way the raindrops got caught in the camera flash.",
  substituteTexts: [
    {
      displayedText: "starship",
      isRequired: true,
      variantTexts: [
        {
          shownText: "starships",
          hiddenText: "ferries"
        },
        {
          shownText: "starship",
          hiddenText: "ferry"
        }
      ]
    },
    {
      displayedText: "stars",
      isRequired: true,
      variantTexts: [
        {
          shownText: "stars",
          hiddenText: "raindrops"
        }
      ]
    },
    {
      displayedText: "Milky Way",
      isRequired: true,
      variantTexts: [
        {
          shownText: "Milky Way",
          hiddenText: "Auckland Harbour"
        }
      ]
    },
    {
      displayedText: "flying",
      isRequired: true,
      variantTexts: [
        {
          shownText: "flying",
          hiddenText: "sailing"
        }
      ]
    },
    {
      displayedText: "alien",
      isRequired: false,
      variantTexts: [
        {
          shownText: "alien",
          hiddenText: "Aucklander"
        }
      ]
    },
    {
      displayedText: "planet",
      isRequired: false,
      variantTexts: [
        {
          shownText: "planet",
          hiddenText: "Island"
        }
      ]
    },
    {
      displayedText: "light speed",
      isRequired: false,
      variantTexts: [
        {
          shownText: "light speed",
          hiddenText: "cruising speed"
        }
      ]
    }
  ],
  layers: [
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "#000",
      horizontalPosition: 0.35,
      verticalPosition: 0.1,
      horizontalAlignment: 0.5,
      verticalAlignment: 0.5,
      fontSize: 8,
      textColor: "#fff",
      fontFamily: FontFamily.Monospace,
      maximumLength: 48
    },
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "#000",
      horizontalPosition: 0.6,
      verticalPosition: 0.35,
      horizontalAlignment: 0.5,
      verticalAlignment: 0.5,
      fontSize: 9,
      textColor: "#fff",
      fontFamily: FontFamily.Monospace,
      maximumLength: 60
    },
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "#000",
      horizontalPosition: 0.35,
      verticalPosition: 0.6,
      horizontalAlignment: 0.5,
      verticalAlignment: 0.5,
      fontSize: 10,
      textColor: "#fff",
      fontFamily: FontFamily.Monospace,
      maximumLength: 36
    },
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "#000",
      horizontalPosition: 0.5,
      verticalPosition: 0.8,
      horizontalAlignment: 0.5,
      verticalAlignment: 0.5,
      fontSize: 11,
      textColor: "#fff",
      fontFamily: FontFamily.Monospace,
      maximumLength: 36
    },
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "#000",
      horizontalPosition: 0.65,
      verticalPosition: 0.9,
      horizontalAlignment: 0.5,
      verticalAlignment: 0.5,
      fontSize: 12,
      textColor: "#fff",
      fontFamily: FontFamily.Monospace,
      maximumLength: 30
    }
  ],
  height: 600,
  width: 900,
  base: "MeticulousSkeleton/SpaceVoyage.png",
  lotoColour: "#fff",
  lotoBackground: "#000"
};
