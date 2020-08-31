import { Game, Participant, ParticipantAttributes, PlayerSummary, PlayerState, GameState } from "./PaperFolliesInterfaces";

// post new game, return game details
export interface PostGameData {
  gameId: number,
  gameCode: string,
  participantToken: string,
  participant: Participant
}

// when a player is approved, return the index for that player
export interface PutAddPlayerData {
  contentIndex: number
}

// post new player, get player details
// also used when logging in
export interface PostParticipantData {
  playerToken: string,
  participantAttributes: ParticipantAttributes
}

// pass in a game code like 'very-odd-day' and return game/participant details
export interface GetGameFromCodeData {
  game: Game,
  participants: ParticipantAttributes[]
}

export interface PutEndGameData {
  finalContents: string[]
}

export interface GetFinalContents {
  finalContents: string[]
}

export interface GetFinalFromCodeData {
  game: Game,
  participants: ParticipantAttributes[],
  finalContents: string[]
}

// get participant from token
export interface GetParticipantData {
  game: Game,
  participant: Participant,
  participants: ParticipantAttributes[],
  precedingPlayerState: PlayerState,
  followingPlayerState: PlayerState,
  finalContents: string[]
}

// get participant from login
export interface PostLoginParticipantData extends GetParticipantData {
  playerToken: string
}

export interface GetAdminStateData {
  playerSummaries: PlayerSummary[],
  precedingPlayerState: PlayerState,
  followingPlayerState: PlayerState
}

export interface GetPlayerStateData {
  gameState: GameState,
  precedingPlayerState: PlayerState,
  followingPlayerState: PlayerState
}

export interface PutStartGameData {
  participants: ParticipantAttributes[]
}

export interface GetStartGamePlayerData {
  participants: ParticipantAttributes[]
}

export interface GetParticipantsData {
  participants: ParticipantAttributes[]
}

export interface GetGameStateData {
  gameState: GameState,
  participants: ParticipantAttributes[]
}

export interface ErrorData {
  title: string
}
