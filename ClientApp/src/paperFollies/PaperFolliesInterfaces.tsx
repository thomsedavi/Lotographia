export interface Participant {
  attributes: ParticipantAttributes,
  state: PlayerState
}

// things that can change over time
export interface PlayerState {
  content: string,
  contentVersion: number,
  isEnded: boolean
}

// shown to Admin
export interface PlayerSummary {
  name: string,
  contentIndex: number,
  contentVersion: number,
  isEnded: boolean
}

// things that are set once game is started
export interface ParticipantAttributes {
  id: number,
  contentIndex: number,
  name: string,
  biography: string,
  isAdmin: boolean,
  isPlayer: boolean,
  isAdded: boolean
}

export interface Game {
  attributes: GameAttributes,
  state: GameState
}

// things that the admin can change
export interface GameState {
  isStarted: boolean,
  isEnding: boolean,
  isEnded: boolean,
  isPublished: boolean
}

// things that are set once game started
export interface GameAttributes {
  id: number,
  code: string,
  canSeePrecedingContent: boolean,
  canSeeFollowingContent: boolean,
  title: string,
  description: string,
  participantsHaveBiographies: boolean,
  addPlayersManually: boolean,
  playersAreRandomlyOrdered: boolean,
  characterLimit: number
}
