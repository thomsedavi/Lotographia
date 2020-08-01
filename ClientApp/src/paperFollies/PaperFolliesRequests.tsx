import { GameAttributes, ParticipantAttributes} from "./PaperFolliesInterfaces";

// post new game, return game details
export interface CreateGameRequest {
  gameAttributes: GameAttributes,
  participantAttributes: ParticipantAttributes,
  password: string,
  confirmPassword: string
}

// post new player, get player details
export interface CreateParticipantRequest {
  participantAttributes: ParticipantAttributes,
  gameId: number,
  gameCode: string,
  password: string,
  confirmPassword: string
}

// will return same response as Create Player
export interface LoginRequest {
  participantId: number,
  participantPassword: string
}

export interface PutContentRequest {
  content: string,
  isFinal: boolean
}
