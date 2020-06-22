export interface CreateGameRequest {
  gameTitle: string,
  gameCharacterLimit: number,
  gameDescription?: string,
  canSeePreviousContent: boolean,
  canSeeNextContent: boolean,
  adminIsPlayer: boolean,
  participantName: string,
  participantPassword: string,
  participantConfirmPassword: string,
  participantsHaveBiographies: boolean,
  participantBiography?: string,
  playersRequireApproval: boolean,
  randomlyOrderPlayers: boolean
}

export interface CreatePlayerRequest {
  gameId: number,
  gameCode: string,
  playerName: string,
  playerPassword: string,
  playerConfirmPassword: string,
  playerBiography?: string
}

export interface LoginRequest {
  participantId: number,
  participantPassword: string
}
