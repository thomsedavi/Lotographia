import { GameOptionDetails, LoadedImage } from "../common/Interfaces";

import { ToyBox } from "./MeticulousSkeletonGames/ToyBox";
import { PrisonBreak } from "./MeticulousSkeletonGames/PrisonBreak";
import { EnchantedWoods } from "./MeticulousSkeletonGames/EnchantedWoods";
import { SpaceVoyage } from "./MeticulousSkeletonGames/SpaceVoyage";

export const Images: { [id: string]: LoadedImage } = {
  ["toybox"]: { src: "MeticulousSkeleton/ToyBoxIcon.png" },
  ["prisonbreak"]: { src: "MeticulousSkeleton/PrisonBreakIcon.png" },
  ["spacevoyage"]: { src: "MeticulousSkeleton/SpaceVoyageIcon.png" },
  ["enchantedwoods"]: { src: "MeticulousSkeleton/EnchantedWoodsIcon.png" },
}

export const Games: GameOptionDetails[] = [
  ToyBox,
  PrisonBreak,
  EnchantedWoods,
  SpaceVoyage
]

export const DefaultGameId: string = "toybox";
