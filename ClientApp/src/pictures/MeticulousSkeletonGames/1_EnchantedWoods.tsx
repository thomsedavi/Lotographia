import { GameOptionDetails } from "../../common/Interfaces";
import { FontFamily, LayerType } from "../../common/Enums";

export const EnchantedWoods: GameOptionDetails = {
  id: "enchantedwoods",
  name: "Enchanted Woods",
  prompt: "What magical encounters will take place in the Enchanted Woods?",
  footnote: `Photo taken at the "Home Alone End of Summer Fest" at the Hataitai Bowling Club on the 29th of February 2020. Event organised by Home Alone Music.`,
  substituteTexts: [
    {
      displayedText: "forest dell",
      isRequired: true,
      variantTexts: [
        {
          shownText: "forest dell",
          hiddenText: "bowling club"
        }
      ]
    },
    {
      displayedText: "magic",
      isRequired: true,
      variantTexts: [
        {
          shownText: "magic",
          hiddenText: "music"
        }
      ]
    },
    {
      displayedText: "labyrinth",
      isRequired: true,
      variantTexts: [
        {
          shownText: "labyrinthine",
          hiddenText: "crowded"
        },
        {
          shownText: "labyrinth",
          hiddenText: "crowd"
        }
      ]
    },
    {
      displayedText: "mysterious elf",
      isRequired: true,
      variantTexts: [
        {
          shownText: "mysterious elves",
          hiddenText: "estranged friends"
        },
        {
          shownText: "a mysterious elf",
          hiddenText: "an estranged friend"
        },
        {
          shownText: "mysterious elf",
          hiddenText: "estranged friend"
        }
      ]
    },
    {
      displayedText: "dwarf",
      isRequired: false,
      variantTexts: [
        {
          shownText: "dwarves",
          hiddenText: "poets"
        },
        {
          shownText: "dwarfs",
          hiddenText: "poets"
        },
        {
          shownText: "dwarf",
          hiddenText: "poet"
        }
      ]
    },
    {
      displayedText: "potion",
      isRequired: false,
      variantTexts: [
        {
          shownText: "potion",
          hiddenText: "refreshment"
        }
      ]
    }
  ],
  layers: [
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "none",
      textColor: "#ff7",
      horizontalPosition: 0.38,
      verticalPosition: 0.8,
      horizontalAlignment: 0.5,
      verticalAlignment: 0.5,
      fontSize: 8,
      fontFamily: FontFamily.SansSerif,
      maximumLength: 58,
      rotation: 0,
    },
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "none",
      textColor: "#f7f",
      horizontalPosition: 0.46,
      verticalPosition: 0.85,
      horizontalAlignment: 0.5,
      verticalAlignment: 0.5,
      fontSize: 8,
      fontFamily: FontFamily.SansSerif,
      maximumLength: 58,
      rotation: 0,
    },
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "none",
      textColor: "#7ff",
      horizontalPosition: 0.54,
      verticalPosition: 0.9,
      horizontalAlignment: 0.5,
      verticalAlignment: 0.5,
      fontSize: 8,
      fontFamily: FontFamily.SansSerif,
      maximumLength: 58,
      rotation: 0,
    },
    {
      layerType: LayerType.Phrase,
      isVisible: false,
      backgroundColor: "none",
      textColor: "#7f7",
      horizontalPosition: 0.62,
      verticalPosition: 0.95,
      horizontalAlignment: 0.5,
      verticalAlignment: 0.5,
      fontSize: 8,
      fontFamily: FontFamily.SansSerif,
      maximumLength: 58,
      rotation: 0,
    }
  ],
  height: 600,
  width: 900,
  base: "MeticulousSkeleton/EnchantedWoods.png",
  lotoColour: "#fff",
  lotoBackground: "none"
};