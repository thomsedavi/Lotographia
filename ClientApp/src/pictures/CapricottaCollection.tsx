import { GameOptionDetails, LoadedImage } from "../common/Interfaces";

import { Industry } from "./capricottaGames/8_Industry";
import { OnBrand } from "./capricottaGames/7_OnBrand";
import { FanTales } from "./capricottaGames/6_FanTales";
import { OfficeMeeting } from "./capricottaGames/5_OfficeMeeting";
import { ToyBox } from "./capricottaGames/4_ToyBox";
import { PrisonBreak } from "./capricottaGames/3_PrisonBreak";
import { SpaceVoyage } from "./capricottaGames/2_SpaceVoyage";
import { EnchantedWoods } from "./capricottaGames/1_EnchantedWoods";

export const Images: { [id: string]: LoadedImage } = {
  ["industry"]: { src: "capricotta/IndustryIcon.png" },
  ["onbrand"]: { src: "capricotta/OnBrandIcon.png" },
  ["fantales"]: { src: "capricotta/FanTalesIcon.png" },
  ["officemeeting"]: { src: "capricotta/OfficeMeetingIcon.png" },
  ["toybox"]: { src: "capricotta/ToyBoxIcon.png" },
  ["prisonbreak"]: { src: "capricotta/PrisonBreakIcon.png" },
  ["spacevoyage"]: { src: "capricotta/SpaceVoyageIcon.png" },
  ["enchantedwoods"]: { src: "capricotta/EnchantedWoodsIcon.png" }
}

export const Games: GameOptionDetails[] = [
  Industry,
  OnBrand,
  FanTales,
  OfficeMeeting,
  ToyBox,
  PrisonBreak,
  EnchantedWoods,
  SpaceVoyage
]

export const DefaultGameId: string = "industry";
