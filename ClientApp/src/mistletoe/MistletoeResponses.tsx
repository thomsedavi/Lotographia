import { Participant } from "./Mistletoe";

export interface PostGameResponse {
  gameId: number,
  gameCode: string,
  participantToken: string,
  participantId: number
}

export interface GetGameFromCodeResponse {
  canSeePreviousContent: boolean,
  canSeeNextContent: boolean,
  title: string,
  id: number,
  characterLimit: number,
  description: string,
  isStarted: boolean,
  isEnded: boolean,
  participantsHaveBiographies: boolean,
  playersRequireApproval: boolean
}

export interface ParticipantResponse {
  gameId: number,
  gameCode: string,
  canSeePreviousContent: boolean,
  canSeeNextContent: boolean,
  gameTitle: string,
  gameCharacterLimit: string,
  gameDescription?: string,
  gameIsStarted: boolean,
  gameIsEnding: boolean,
  gameIsEnded: boolean,
  participantsHaveBiographies: boolean,
  playersRequireApproval: boolean,
  isApprovedPlayer: boolean,
  participantName: string,
  participantBiography?: string,
  participantId: number,
  isAdmin: boolean,
  adminIsPlayer: boolean,
  participants: Participant[]
}

export interface ParticipantsResponse {
  participants: Participant[]
}

export interface MistletoeParticipantTokenResponse {
  playerToken: string
}

export interface ErrorResponse {
  title: string
}
