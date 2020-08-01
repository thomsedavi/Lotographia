import { GameOptionDetails, LoadedImage } from "../common/Interfaces";

import { OfficeMeeting } from "./meticulousSkeletonGames/5_OfficeMeeting";
import { ToyBox } from "./meticulousSkeletonGames/4_ToyBox";
import { PrisonBreak } from "./meticulousSkeletonGames/3_PrisonBreak";
import { SpaceVoyage } from "./meticulousSkeletonGames/2_SpaceVoyage";
import { EnchantedWoods } from "./meticulousSkeletonGames/1_EnchantedWoods";

export const Images: { [id: string]: LoadedImage } = {
  ["officemeeting"]: { src: "meticulousSkeleton/OfficeMeetingIcon.png" },
  ["toybox"]: { src: "meticulousSkeleton/ToyBoxIcon.png" },
  ["prisonbreak"]: { src: "meticulousSkeleton/PrisonBreakIcon.png" },
  ["spacevoyage"]: { src: "meticulousSkeleton/SpaceVoyageIcon.png" },
  ["enchantedwoods"]: { src: "meticulousSkeleton/EnchantedWoodsIcon.png" },
}

export const Games: GameOptionDetails[] = [
  OfficeMeeting,
  ToyBox,
  PrisonBreak,
  EnchantedWoods,
  SpaceVoyage
]

export const DefaultGameId: string = "officemeeting";
