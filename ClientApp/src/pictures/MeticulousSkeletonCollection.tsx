import { GameOptionDetails, LoadedImage } from "../common/Interfaces";

import { EnchantedWoods } from "./MeticulousSkeletonGames/EnchantedWoods";
import { SpaceVoyage } from "./MeticulousSkeletonGames/SpaceVoyage";
import { PrisonBreak } from "./MeticulousSkeletonGames/PrisonBreak";

export const Images: { [id: string]: LoadedImage } = {
  ["spacevoyage"]: { src: "MeticulousSkeleton/SpaceVoyageIcon.png" },
  ["enchantedwoods"]: { src: "MeticulousSkeleton/EnchantedWoodsIcon.png" },
  ["prisonbreak"]: { src: "MeticulousSkeleton/PrisonBreakIcon.png" }
}

export const Games: GameOptionDetails[] = [
  PrisonBreak,
  EnchantedWoods,
  SpaceVoyage
]
