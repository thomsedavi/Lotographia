import { Game, Participant, ParticipantAttributes, PlayerSummary, PlayerState, GameState } from "./PaperFolliesInterfaces";

// post new game, return game details
export interface PostGameResponse {
  gameId: number,
  gameCode: string,
  participantToken: string,
  participant: Participant
}

// when a player is approved, return the index for that player
export interface PutAddPlayerResponse {
  contentIndex: number
}

// post new player, get player details
// also used when logging in
export interface PostParticipantResponse {
  playerToken: string,
  participant: Participant
}

// pass in a game code like 'very-odd-day' and return game/participant details
export interface GetGameFromCodeResponse {
  game: Game,
  participants: ParticipantAttributes[]
}

export interface PutEndGameResponse {
  finalContents: string[]
}

export interface GetFinalFromCodeResponse {
  game: Game,
  participants: ParticipantAttributes[],
  finalContents: string[]
}

// get participant from token
export interface GetParticipantResponse {
  game: Game,
  participant: Participant,
  participants: ParticipantAttributes[],
  precedingPlayerState: PlayerState,
  followingPlayerState: PlayerState,
  finalContents: string[]
}

// get participant from login
export interface LoginParticipantResponse {
  playerToken: string,
  game: Game,
  participant: Participant,
  participants: ParticipantAttributes[]
  precedingPlayerState: PlayerState,
  followingPlayerState: PlayerState
}

export interface GetAdminStateResponse {
  playerSummaries: PlayerSummary[],
  precedingPlayerState: PlayerState,
  followingPlayerState: PlayerState
}

export interface GetPlayerStateResponse {
  gameState: GameState,
  precedingPlayerState: PlayerState,
  followingPlayerState: PlayerState
}

export interface PutStartGameResponse {
  participants: ParticipantAttributes[]
}

export interface GetStartGamePlayerResponse {
  participants: ParticipantAttributes[]
}

export interface GetParticipantsResponse {
  participants: ParticipantAttributes[]
}

export interface GetGameStateResponse {
  gameState: GameState
}

export interface ErrorResponse {
  title: string
}
