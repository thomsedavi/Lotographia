import { GameOptionDetails } from "../../common/Interfaces";
import { FontFamily, LayerType, Orientation } from "../../common/Enums";

export const OnBrand: GameOptionDetails = {
  id: "onbrand",
  name: "On Brand",
  prompt: "You need to design a logo for your brand! What aesthetic do you think matches your identity? You need a powerful image for your product.",
  footnote: "This photo was taken at the Tudor Garden section in the Hamilton Gardens of Hamilton. The sky delivered a perfectly timed rainbow for my photograph of the unicorn.",
  caption: "Font: Journal by Fontourist",
  height: 600,
  width: 900,
  orientation: Orientation.Landscape,
  base: "Capricotta/OnBrand.png",
  lotoColour: "#eee",
  lotoBackground: "#f00",
  substituteTexts: [
    {
      displayedText: "logo",
      isRequired: true,
      variantTexts: [
        {
          shownText: "logo",
          hiddenText: "unicorn"
        }
      ]
    }, // logo => unicorn
    {
      displayedText: "identity",
      isRequired: true,
      variantTexts: [
        {
          shownText: "an identity",
          hiddenText: "a rainbow"
        },
        {
          shownText: "identities",
          hiddenText: "rainbows"
        },
        {
          shownText: "identity",
          hiddenText: "rainbow"
        }
      ]
    }, // identity => rainbow
    {
      displayedText: "aesthetic",
      isRequired: true,
      variantTexts: [
        {
          shownText: "an aesthetically",
          hiddenText: "a fantastically"
        },
        {
          shownText: "aesthetically",
          hiddenText: "fantastically"
        },
        {
          shownText: "aesthetics",
          hiddenText: "fantasies"
        },
        {
          shownText: "an aesthetic",
          hiddenText: "a fantasy"
        },
        {
          shownText: "aesthetic",
          hiddenText: "fantasy"
        }
      ]
    }, // aesthetic => fantasy
    {
      displayedText: "product",
      isRequired: true,
      variantTexts: [
        {
          shownText: "product",
          hiddenText: "magic"
        }
      ]
    }, // product => magic
    {
      displayedText: "powerful",
      isRequired: true,
      variantTexts: [
        {
          shownText: "powerful",
          hiddenText: "fabulous"
        }
      ]
    }, // powerful => fabulous
    {
      displayedText: "branding",
      isRequired: true,
      variantTexts: [
        {
          shownText: "brandings",
          hiddenText: "heraldries"
        },
        {
          shownText: "branding",
          hiddenText: "heraldry"
        }
      ]
    } // branding => heraldry
  ],
  layers: [
    {
      "layerType": LayerType.Phrase,
      "isVisible": false,
      "backgroundColor": "#eee",
      "textColor": "#000",
      "horizontalPosition": 0.85,
      "verticalPosition": 0.3,
      "horizontalAlignment": 0.25,
      "verticalAlignment": 0.5,
      "fontSize": 11,
      "fontFamily": FontFamily.Journal,
      "maximumLength": 48,
      "rotation": 0
    },
    {
      "layerType": LayerType.Phrase,
      "isVisible": false,
      "backgroundColor": "#eee",
      "textColor": "#f00",
      "horizontalPosition": 0.84,
      "verticalPosition": 0.4,
      "horizontalAlignment": 0.21,
      "verticalAlignment": 0.5,
      "fontSize": 11,
      "fontFamily": FontFamily.Journal,
      "maximumLength": 62,
      "rotation": 0
    },
    {
      "layerType": LayerType.Phrase,
      "isVisible": false,
      "backgroundColor": "#eee",
      "textColor": "#000",
      "horizontalPosition": 0.82,
      "verticalPosition": 0.5,
      "horizontalAlignment": 0.34,
      "verticalAlignment": 0.5,
      "fontSize": 11,
      "fontFamily": FontFamily.Journal,
      "maximumLength": 44,
      "rotation": 0
    },
    {
      "layerType": LayerType.Phrase,
      "isVisible": false,
      "backgroundColor": "#eee",
      "textColor": "#f00",
      "horizontalPosition": 0.79,
      "verticalPosition": 0.6,
      "horizontalAlignment": 0.41,
      "verticalAlignment": 0.5,
      "fontSize": 11,
      "fontFamily": FontFamily.Journal,
      "maximumLength": 44,
      "rotation": 0
    },
    {
      "layerType": LayerType.Phrase,
      "isVisible": false,
      "backgroundColor": "#eee",
      "textColor": "#000",
      "horizontalPosition": 0.75,
      "verticalPosition": 0.7,
      "horizontalAlignment": 0.5,
      "verticalAlignment": 0.5,
      "fontSize": 11,
      "fontFamily": FontFamily.Journal,
      "maximumLength": 44,
      "rotation": 0
    },
    {
      "layerType": LayerType.Phrase,
      "isVisible": false,
      "backgroundColor": "#eee",
      "textColor": "#f00",
      "horizontalPosition": 0.69,
      "verticalPosition": 0.8,
      "horizontalAlignment": 0.65,
      "verticalAlignment": 0.5,
      "fontSize": 11,
      "fontFamily": FontFamily.Journal,
      "maximumLength": 43,
      "rotation": 0
    },
    {
      "layerType": LayerType.Phrase,
      "isVisible": false,
      "backgroundColor": "#eee",
      "textColor": "#000",
      "horizontalPosition": 0.62,
      "verticalPosition": 0.9,
      "horizontalAlignment": 0.81,
      "verticalAlignment": 0.5,
      "fontSize": 11,
      "fontFamily": FontFamily.Journal,
      "maximumLength": 43,
      "rotation": 0
    }
  ]
};
