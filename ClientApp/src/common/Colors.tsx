export enum LotographiaColor {
  Black = "#000",
  Orange1 = "#210",
  Orange2 = "#630",
  Orange3 = "#840",
  Orange4 = "#fb7",
  Orange5 = "#fc9",
  Orange6 = "#fdb",
  Purple1 = "#201",
  Purple2 = "#603",
  Purple3 = "#804",
  Purple4 = "#f7b",
  Purple5 = "#f9c",
  Purple6 = "#fbd",
  Violet1 = "#102",
  Violet2 = "#306",
  Violet3 = "#408",
  Violet4 = "#b7f",
  Violet5 = "#c9f",
  Violet6 = "#dbf",
  Blue1 = "#012",
  Blue2 = "#036",
  Blue3 = "#048",
  Blue4 = "#7bf",
  Blue5 = "#9cf",
  Blue6 = "#bdf",
  Green1 = "#021",
  Green2 = "#063",
  Green3 = "#084",
  Green4 = "#7fb",
  Green5 = "#9fc",
  Green6 = "#bfd",
  Lime1 = "#120",
  Lime2 = "#360",
  Lime3 = "#480",
  Lime4 = "#bf7",
  Lime5 = "#cf9",
  Lime6 = "#dfb",
  White = "#fff",
  Transparent = "transparent",
  Error = "#f00",
  None = "none"
}

export const getColor = (shade: string, value: number) => {
  if (shade === "ORANGE") {
    switch (value) {
      case 1:
        return LotographiaColor.Orange1;
      case 2:
        return LotographiaColor.Orange2;
      case 3:
        return LotographiaColor.Orange3;
      case 4:
        return LotographiaColor.Orange4;
      case 5:
        return LotographiaColor.Orange5;
      case 6:
        return LotographiaColor.Orange6;
      default:
        return LotographiaColor.Error;
    }
  } else if (shade === "PURPLE") {
    switch (value) {
      case 1:
        return LotographiaColor.Purple1;
      case 2:
        return LotographiaColor.Purple2;
      case 3:
        return LotographiaColor.Purple3;
      case 4:
        return LotographiaColor.Purple4;
      case 5:
        return LotographiaColor.Purple5;
      case 6:
        return LotographiaColor.Purple6;
      default:
        return LotographiaColor.Error;
    }
  } else if (shade === "VIOLET") {
    switch (value) {
      case 1:
        return LotographiaColor.Violet1;
      case 2:
        return LotographiaColor.Violet2;
      case 3:
        return LotographiaColor.Violet3;
      case 4:
        return LotographiaColor.Violet4;
      case 5:
        return LotographiaColor.Violet5;
      case 6:
        return LotographiaColor.Violet6;
      default:
        return LotographiaColor.Error;
    }
  } else if (shade === "BLUE") {
    switch (value) {
      case 1:
        return LotographiaColor.Blue1;
      case 2:
        return LotographiaColor.Blue2;
      case 3:
        return LotographiaColor.Blue3;
      case 4:
        return LotographiaColor.Blue4;
      case 5:
        return LotographiaColor.Blue5;
      case 6:
        return LotographiaColor.Blue6;
      default:
        return LotographiaColor.Error;
    }
  } else if (shade === "GREEN") {
    switch (value) {
      case 1:
        return LotographiaColor.Green1;
      case 2:
        return LotographiaColor.Green2;
      case 3:
        return LotographiaColor.Green3;
      case 4:
        return LotographiaColor.Green4;
      case 5:
        return LotographiaColor.Green5;
      case 6:
        return LotographiaColor.Green6;
      default:
        return LotographiaColor.Error;
    }
  } else if (shade === "LIME") {
    switch (value) {
      case 1:
        return LotographiaColor.Lime1;
      case 2:
        return LotographiaColor.Lime2;
      case 3:
        return LotographiaColor.Lime3;
      case 4:
        return LotographiaColor.Lime4;
      case 5:
        return LotographiaColor.Lime5;
      case 6:
        return LotographiaColor.Lime6;
      default:
        return LotographiaColor.Error;
    }
  } else {
    return LotographiaColor.Error;
  }
}
