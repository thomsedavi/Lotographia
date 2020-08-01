export enum GameMode {
  Admin = "admin",
  Player = "player",
  Reader = "reader"
}

export enum GameType {
  Both = "both",
  Preceding = "preceding",
  Following = "following"
}

export enum Section {
  Game = "Game",
  Admin = "admin",
  About = "about",
  Reset = "reset"
}

export enum GamePage {
  Intro = "intro",
  LogInGame = "logInGame",
  LogInPlayer = "logInPlayer",
  LogInPassword = "logInPassword",
  GameTitle = "gameTitle",
  GameDescription = "gameDescription",
  GameType = "gameType",
  GameCharacterLimit = "gameCharacterLimit",
  GameCodeJoin = "gameCodeJoin",
  GameCodeView = "gameCodeView",
  GameJoinIntro = "gameJoinIntro",
  PlayerName = "playerName",
  PlayerBiography = "playerBiography",
  PlayerPassword = "playerPassword",
  CreateGame = "createGame",
  GameReady = "gameReady",
  WaitingForStart = "waitingForStart",
  BearerFound = "bearerFound",
  NotAdded = "notAdded",
  Entry = "entry",
  WaitingForEnd = "waitingForEnd",
  Final = "final"
}

export enum EntryView {
  Details = "details",
  Preceding = "preceding",
  Player = "player",
  Following = "following",
  End = "end"
}

export enum FinalView {
  Details = "details",
  Contents = "contents",
  Players = "players"
}
