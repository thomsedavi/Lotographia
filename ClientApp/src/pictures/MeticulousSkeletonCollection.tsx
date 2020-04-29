import { GameOptionDetails, LoadedImage } from "../common/Interfaces";

import { OfficeMeeting } from "./MeticulousSkeletonGames/5_OfficeMeeting";
import { ToyBox } from "./MeticulousSkeletonGames/4_ToyBox";
import { PrisonBreak } from "./MeticulousSkeletonGames/3_PrisonBreak";
import { SpaceVoyage } from "./MeticulousSkeletonGames/2_SpaceVoyage";
import { EnchantedWoods } from "./MeticulousSkeletonGames/1_EnchantedWoods";

export const Images: { [id: string]: LoadedImage } = {
  ["officemeeting"]: { src: "MeticulousSkeleton/OfficeMeetingIcon.png" },
  ["toybox"]: { src: "MeticulousSkeleton/ToyBoxIcon.png" },
  ["prisonbreak"]: { src: "MeticulousSkeleton/PrisonBreakIcon.png" },
  ["spacevoyage"]: { src: "MeticulousSkeleton/SpaceVoyageIcon.png" },
  ["enchantedwoods"]: { src: "MeticulousSkeleton/EnchantedWoodsIcon.png" },
}

export const Games: GameOptionDetails[] = [
  OfficeMeeting,
  ToyBox,
  PrisonBreak,
  EnchantedWoods,
  SpaceVoyage
]

export const DefaultGameId: string = "officemeeting";
