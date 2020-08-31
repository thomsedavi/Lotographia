import { GameOptionDetails } from "../../common/Interfaces";
import { FontFamily, LayerType } from "../../common/Enums";

export const OfficeMeeting: GameOptionDetails = {
  id: "officemeeting",
  name: "Office Meeting",
  prompt: "You're at an important business meeting! Writing down important business notes. What have you written down?",
  footnote: "This is the first game where I've created an image deliberately for this game. Font is Journal by Fontourist",
  height: 600,
  width: 900,
  base: "Capricotta/OfficeMeeting.png",
  lotoColour: "#221",
  lotoBackground: "none",
  substituteTexts: [
    {
      displayedText: "goal",
      isRequired: true,
      variantTexts: [
        {
          shownText: "goal",
          hiddenText: "daydream"
        }
      ]
    }, // goal => daydream
    {
      displayedText: "asset",
      isRequired: true,
      variantTexts: [
        {
          shownText: "an asset",
          hiddenText: "a doodle"
        },
        {
          shownText: "asset",
          hiddenText: "doodle"
        }
      ]
    }, // figure => doodle
    {
      displayedText: "business/businesslike",
      isRequired: true,
      variantTexts: [
        {
          shownText: "business",
          hiddenText: "nonsense"
        },
        {
          shownText: "businesslike",
          hiddenText: "nonsensical"
        }
      ]
    }, // business => nonsense
    {
      displayedText: "dynamic",
      isRequired: true,
      variantTexts: [
        {
          shownText: "dynamically",
          hiddenText: "fancifully"
        },
        {
          shownText: "dynamic",
          hiddenText: "fancy"
        }
      ]
    }, // dynamic => fancy
    {
      displayedText: "disrupt",
      isRequired: true,
      variantTexts: [
        {
          shownText: "a disruption",
          hiddenText: "an imagination"
        },
        {
          shownText: "disruption",
          hiddenText: "imagination"
        },
        {
          shownText: "a disruptive",
          hiddenText: "an imaginative"
        },
        {
          shownText: "disruptive",
          hiddenText: "imaginative"
        },
        {
          shownText: "disrupt",
          hiddenText: "imagine"
        }
      ]
    } // disrupt => imagine
  ],
  layers: [
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "none",
      textColor: "#221",
      horizontalPosition: 0.45,
      verticalPosition: 0.185,
      horizontalAlignment: 1,
      verticalAlignment: 0.5,
      fontSize: 18,
      fontFamily: FontFamily.Journal,
      maximumLength: 27,
      rotation: 6,
    },
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "none",
      textColor: "#221",
      horizontalPosition: 0.73,
      verticalPosition: 0.303,
      horizontalAlignment: 0,
      verticalAlignment: 0.5,
      fontSize: 18,
      fontFamily: FontFamily.Journal,
      maximumLength: 17,
      rotation: 7.3,
    },
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "none",
      textColor: "#221",
      horizontalPosition: 0.77,
      verticalPosition: 0.31,
      horizontalAlignment: 1,
      verticalAlignment: 0.5,
      fontSize: 18,
      fontFamily: FontFamily.Journal,
      maximumLength: 8,
      rotation: 7.2,
    },
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "none",
      textColor: "#221",
      horizontalPosition: 0.235,
      verticalPosition: 0.318,
      horizontalAlignment: 0.75,
      verticalAlignment: 0.5,
      fontSize: 18,
      fontFamily: FontFamily.Journal,
      maximumLength: 27,
      rotation: 7.2,
    },
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "none",
      textColor: "#221",
      horizontalPosition: 0.33,
      verticalPosition: 0.402,
      horizontalAlignment: 0.5,
      verticalAlignment: 0.5,
      fontSize: 18,
      fontFamily: FontFamily.Journal,
      maximumLength: 25,
      rotation: 7.2,
    },
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "none",
      textColor: "#221",
      horizontalPosition: 0.21,
      verticalPosition: 0.444,
      horizontalAlignment: 0.75,
      verticalAlignment: 0.5,
      fontSize: 18,
      fontFamily: FontFamily.Journal,
      maximumLength: 24,
      rotation: 7.4,
    },
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "none",
      textColor: "#221",
      horizontalPosition: 0.77,
      verticalPosition: 0.62,
      horizontalAlignment: 0.25,
      verticalAlignment: 0.5,
      fontSize: 18,
      fontFamily: FontFamily.Journal,
      maximumLength: 31,
      rotation: 7.5,
    },
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "none",
      textColor: "#221",
      horizontalPosition: 0.635,
      verticalPosition: 0.661,
      horizontalAlignment: 0.5,
      verticalAlignment: 0.5,
      fontSize: 18,
      fontFamily: FontFamily.Journal,
      maximumLength: 31,
      rotation: 7.6,
    },
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "none",
      textColor: "#221",
      horizontalPosition: 0.744,
      verticalPosition: 0.751,
      horizontalAlignment: 0.25,
      verticalAlignment: 0.5,
      fontSize: 18,
      fontFamily: FontFamily.Journal,
      maximumLength: 30,
      rotation: 7.8,
    }
  ]
};
