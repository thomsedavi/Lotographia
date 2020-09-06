import { GameOptionDetails } from "../../common/Interfaces";
import { FontFamily, LayerType } from "../../common/Enums";

export const FanTales: GameOptionDetails = {
  id: "fantales",
  name: "Fan Tales",
  prompt: "Share the tales of the fantail! (Or pīwakawaka as they are known in Aotearoa)",
  footnote: "This is a statue of Tainui at Virginia Lake in Whanganui. The story tells of how Tainui learned how to talk to the birds and how the lake was formed from her tears when the birds told her of the death of her lover.",
  caption: "Font: Gandhi Serif by Librerias Gandhi",
  height: 600,
  width: 900,
  base: "Capricotta/FanTales.png",
  lotoColour: "#fff",
  lotoBackground: "#065",
  substituteTexts: [
    {
      displayedText: "bird",
      isRequired: true,
      variantTexts: [
        {
          shownText: "bird",
          hiddenText: "statue"
        }
      ]
    }, // bird => statue
    {
      displayedText: "flock",
      isRequired: true,
      variantTexts: [
        {
          shownText: "flock",
          hiddenText: "pantheon"
        }
      ]
    }, // flock => pantheon
    {
      displayedText: "egg",
      isRequired: true,
      variantTexts: [
        {
          shownText: "egg",
          hiddenText: "imagination"
        }
      ]
    }, // egg => imagination
    {
      displayedText: "wing",
      isRequired: true,
      variantTexts: [
        {
          shownText: "wing",
          hiddenText: "legend"
        }
      ]
    }, // wing => legend
    {
      displayedText: "feather",
      isRequired: true,
      variantTexts: [
        {
          shownText: "feathers",
          hiddenText: "memories"
        },
        {
          shownText: "feather",
          hiddenText: "memory"
        }
      ]
    } // feather => memory
  ],
  layers: [
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "#065",
      textColor: "#fff",
      horizontalPosition: 0.2,
      verticalPosition: 0.09,
      horizontalAlignment: 0.65,
      verticalAlignment: 0.5,
      fontSize: 9,
      fontFamily: FontFamily.Gandhi,
      maximumLength: 39,
      rotation: 0,
    },
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "#056",
      textColor: "#fff",
      horizontalPosition: 0.14,
      verticalPosition: 0.22,
      horizontalAlignment: 0.5,
      verticalAlignment: 0.5,
      fontSize: 9,
      fontFamily: FontFamily.Gandhi,
      maximumLength: 17,
      rotation: 0,
    },
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "#074",
      textColor: "#fff",
      horizontalPosition: 0.25,
      verticalPosition: 0.35,
      horizontalAlignment: 0.48,
      verticalAlignment: 0.5,
      fontSize: 9,
      fontFamily: FontFamily.Gandhi,
      maximumLength: 36,
      rotation: 0,
    },
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "#065",
      textColor: "#fff",
      horizontalPosition: 0.14,
      verticalPosition: 0.48,
      horizontalAlignment: 0.5,
      verticalAlignment: 0.5,
      fontSize: 9,
      fontFamily: FontFamily.Gandhi,
      maximumLength: 18,
      rotation: 0,
    },
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "#074",
      textColor: "#fff",
      horizontalPosition: 0.84,
      verticalPosition: 0.52,
      horizontalAlignment: 0.5,
      verticalAlignment: 0.5,
      fontSize: 9,
      fontFamily: FontFamily.Gandhi,
      maximumLength: 20,
      rotation: 0,
    },
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "#065",
      textColor: "#fff",
      horizontalPosition: 0.81,
      verticalPosition: 0.65,
      horizontalAlignment: 0.55,
      verticalAlignment: 0.5,
      fontSize: 9,
      fontFamily: FontFamily.Gandhi,
      maximumLength: 24,
      rotation: 0,
    },
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "#056",
      textColor: "#fff",
      horizontalPosition: 0.85,
      verticalPosition: 0.78,
      horizontalAlignment: 0.4,
      verticalAlignment: 0.5,
      fontSize: 9,
      fontFamily: FontFamily.Gandhi,
      maximumLength: 24,
      rotation: 0,
    },
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "#074",
      textColor: "#fff",
      horizontalPosition: 0.76,
      verticalPosition: 0.91,
      horizontalAlignment: 0.7,
      verticalAlignment: 0.5,
      fontSize: 9,
      fontFamily: FontFamily.Gandhi,
      maximumLength: 23,
      rotation: 0,
    },
  ]
};
