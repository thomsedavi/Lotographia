import * as React from "react";
import { CreateGameRequest, CreateParticipantRequest, LoginRequest, PutContentRequest } from "./PaperFolliesRequests";
import { GetGameFromCodeResponse, GetFinalFromCodeResponse, GetStartGamePlayerResponse, GetAdminStateResponse, GetPlayerStateResponse, PostParticipantResponse, LoginParticipantResponse, GetParticipantsResponse, PutAddPlayerResponse, GetGameStateResponse, PostGameResponse, GetParticipantResponse, ErrorResponse, PutStartGameResponse, PutEndGameResponse } from "./PaperFolliesResponses";
import { GameMode, GameType, Section, GamePage, EntryView, FinalView } from "./PaperFolliesEnums";
import { Game, GameState, Participant, ParticipantAttributes, PlayerSummary, PlayerState } from "./PaperFolliesInterfaces";

interface PaperFolliesState {
  gameMode?: GameMode, // admin or player
  section: Section,
  gamePage: GamePage,
  entryView: EntryView,
  finalView: FinalView,
  game: Game,
  characterLimitInput: string,
  contentOld: string,
  participant: Participant,
  participants: ParticipantAttributes[],
  finalContents: string[],
  precedingPlayerState: PlayerState,
  displayedPrecedingPlayerState: PlayerState,
  followingPlayerState: PlayerState,
  displayedFollowingPlayerState: PlayerState,
  password: string,
  confirmPassword: string,
  errorMessage: string,
  fetchingData: boolean, // based on player action
  pollingData: boolean, // based on regular updates
  selectedWaitingPlayerId: number,
  selectedAddedPlayerId: number,
  isLoggedIn: boolean,
  playerSummaries: PlayerSummary[]
}

export class PaperFollies extends React.Component<any, PaperFolliesState> {
  constructor(props: any) {
    super(props);

    this.state = {
      game: {
        attributes: {
          playersAreRandomlyOrdered: true,
          addPlayersManually: false,
          canSeeFollowingContent: true,
          canSeePrecedingContent: true,
          code: "",
          description: "",
          id: 0,
          characterLimit: 500,
          participantsHaveBiographies: false,
          title: ""
        },
        state: {
          isEnded: false,
          isEnding: false,
          isStarted: false,
          isPublished: false
        }
      },
      characterLimitInput: "500",
      contentOld: "",
      participant: {
        attributes: {
          isAdmin: false,
          biography: "",
          name: "",
          contentIndex: 0,
          id: 0,
          isPlayer: true,
          isAdded: false
        },
        state: {
          content: "",
          contentVersion: 0,
          isEnded: false
        }
      },
      precedingPlayerState: {
        content: "",
        contentVersion: 0,
        isEnded: false
      },
      displayedPrecedingPlayerState: {
        content: "",
        contentVersion: 0,
        isEnded: false
      },
      followingPlayerState: {
        content: "",
        contentVersion: 0,
        isEnded: false
      },
      displayedFollowingPlayerState: {
        content: "",
        contentVersion: 0,
        isEnded: false
      },
      finalContents: [],
      password: "",
      confirmPassword: "",
      fetchingData: false,
      pollingData: false,
      section: Section.Game,
      gamePage: localStorage.getItem('bearerPaperFollies') ? GamePage.BearerFound : GamePage.Intro,
      entryView: EntryView.Player,
      finalView: FinalView.Details,
      participants: [],
      errorMessage: "",
      selectedAddedPlayerId: 0,
      selectedWaitingPlayerId: 0,
      isLoggedIn: false,
      playerSummaries: []
    };
  }

  componentDidMount = () => {
    const searchParams = new URLSearchParams(window.location.search);

    if (this.state.gamePage == GamePage.BearerFound) {
      fetch("api/paperFollies/participant", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `bearer ${localStorage.getItem('bearerPaperFollies')}`
        }
      })
        .then((response: Response) => {
          if (response.status === 200) {
            response.json()
              .then((data: GetParticipantResponse) => {
                const gamePage: GamePage = data.participant.attributes.isAdmin ?
                  (!data.game.state.isStarted ? GamePage.GameReady :
                    (data.game.state.isEnded ? GamePage.Final :
                      (data.participant.state.isEnded ? GamePage.WaitingForEnd : GamePage.Entry))) :
                  (!data.participant.attributes.isAdded ? GamePage.NotAdded :
                    (!data.game.state.isStarted ? GamePage.WaitingForStart :
                      (data.game.state.isEnded ? GamePage.Final :
                        (data.participant.state.isEnded ? GamePage.WaitingForEnd : GamePage.Entry))));

                this.setState({
                  isLoggedIn: true,
                  section: Section.Game,
                  gamePage: gamePage,
                  game: data.game,
                  participant: data.participant,
                  participants: data.participants,
                  contentOld: data.participant.state.content,
                  precedingPlayerState: data.precedingPlayerState,
                  displayedPrecedingPlayerState: data.precedingPlayerState,
                  followingPlayerState: data.followingPlayerState,
                  displayedFollowingPlayerState: data.followingPlayerState,
                  finalContents: data.finalContents
                }, this.setSelectedDisplayedPlayers);
              })
          } else {
            response.json()
              .then((errorResponse: ErrorResponse) => {
                this.setState({
                  errorMessage: errorResponse.title
                });
              })
          }
        });
    } else if (searchParams.get("join-game")) {
      const game = this.state.game;
      game.attributes.code = searchParams.get("join-game")!;

      this.setState({
        section: Section.Game,
        gamePage: GamePage.GameCodeJoin,
        game: game,
        gameMode: GameMode.Player
      });
    } else if (searchParams.get("view-game")) {
      const game = this.state.game;
      game.attributes.code = searchParams.get("view-game")!;

      this.setState({
        section: Section.Game,
        gamePage: GamePage.GameCodeView,
        game: game,
        gameMode: GameMode.Reader
      });
    }

    setInterval(() => {
      if (this.state.isLoggedIn) {
        if (!this.state.game.state.isStarted) {
          if (this.state.participant.attributes.isAdmin) {
            this.getParticipants();
          } else {
            this.getGameState();
          }
        }
        else if (!this.state.game.state.isEnded) {
          if (this.state.participant.attributes.isAdmin) {
            this.getAdminState();
          } else if (this.state.participant.attributes.isPlayer) {
            this.getPlayerState();
          }
        }
      }
    }, 3000);
  }

  changeGameAction = (gamePage: GamePage, gameMode: GameMode | undefined) => {
    this.setState({
      errorMessage: "",
      gameMode: gameMode,
      gamePage: gamePage
    });
  }

  initialiseDefaultLoginParticipant = () => {
    this.changeParticipant(this.state.participants[0].id.toString());

    this.setState({
      gamePage: GamePage.LogInPlayer
    });
  }

  changeParticipant = (participantId: string) => {
    //const participant: Participant =  this.state.participants.filter(p => p.id === Number(participantId))[0];
    const participant: Participant = {
      attributes: this.state.participants.filter(p => p.id === Number(participantId))[0],
      state: {
        content: "",
        contentVersion: 0,
        isEnded: false
      }
    };

    if (participant !== undefined) {
      this.setState({
        participant: participant
      });
    }
  }

  changeSelectedAddedPlayerId = (selectedAddedPlayerId: number) => {
    this.setState({
      selectedAddedPlayerId: selectedAddedPlayerId
    });
  }

  changeSelectedWaitingPlayerId = (selectedWaitingPlayerId: number) => {
    this.setState({
      selectedWaitingPlayerId: selectedWaitingPlayerId
    });
  }

  waitingPlayers = () => {
    return this.state.participants.filter(p => p.isPlayer && !p.isAdded);
  }

  addedPlayers = () => {
    return this.state.participants.filter(p => p.isPlayer && p.isAdded);
  }

  setSelectedDisplayedPlayers = () => { // TODO might not need this
    let selectedWaitingPlayerId = this.state.selectedWaitingPlayerId;
    let selectedAddedPlayerId = this.state.selectedAddedPlayerId;

    if (selectedWaitingPlayerId === 0 && this.waitingPlayers().length > 0) {
      selectedWaitingPlayerId = this.waitingPlayers()[0].id;
    }

    if (selectedAddedPlayerId === 0 && this.addedPlayers().length > 0) {
      selectedAddedPlayerId = this.addedPlayers()[0].id;
    }

    this.setState({
      selectedWaitingPlayerId: selectedWaitingPlayerId,
      selectedAddedPlayerId: selectedAddedPlayerId
    });
  }

  changeSection = (section: Section) => {
    this.setState({
      errorMessage: "",
      section: section
    });
  }

  changeGamePage = (gamePage: GamePage) => {
    this.setState({
      errorMessage: "",
      section: Section.Game,
      gamePage: gamePage
    });
  }

  changeGameTitle = (gameTitle: string) => {
    const game = this.state.game;
    game.attributes.title = gameTitle;

    this.setState({
      game: game
    });
  }

  changeGameCharacterLimit = (gameCharacterLimit: string) => {
    const game = this.state.game;
    game.attributes.characterLimit = Number(gameCharacterLimit);

    this.setState({
      game: game,
      characterLimitInput: gameCharacterLimit
    });
  }

  changeDescription = (gameDescription: string) => {
    const game = this.state.game;
    game.attributes.description = gameDescription;

    this.setState({
      game: game
    });
  }

  changePlayerContent = (playerContent: string) => {
    const participant = this.state.participant;
    participant.state.content = playerContent;

    this.setState({
      participant: participant
    });
  }

  updateContent = (isFinal: boolean) => {
    if (!this.state.fetchingData) {
      this.setState({
        fetchingData: true
      });

      const body: PutContentRequest = {
        content: this.state.participant.state.content.trim(),
        isFinal: isFinal
      };

      fetch(`api/paperFollies/participant/content`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `bearer ${localStorage.getItem('bearerPaperFollies')}`
        },
        body: JSON.stringify(body)
      })
        .then((response: Response) => {
          this.setState({
            fetchingData: false
          });

          if (response.status === 200) {
            const participant = this.state.participant;
            participant.state.contentVersion = participant.state.contentVersion + 1;
            participant.state.isEnded = isFinal || this.state.game.state.isEnding;

            this.setState({
              participant: participant,
              contentOld: participant.state.content.trim(),
              gamePage: participant.state.isEnded ? GamePage.WaitingForEnd : GamePage.Entry
            });
          } else {
            response.json()
              .then((data: ErrorResponse) => {
                this.setState({
                  errorMessage: data.title
                });
              })
          }
        });
    }
  }

  updatePrecedingContent = () => {
    const precedingState = this.state.precedingPlayerState;

    this.setState({
      displayedPrecedingPlayerState: precedingState
    });
  }

  updateFollowingContent = () => {
    const followingState = this.state.followingPlayerState;

    this.setState({
      displayedFollowingPlayerState: followingState
    });
  }


  startGame = () => {
    if (!this.state.fetchingData) {
      this.setState({
        fetchingData: true
      });

      fetch(`api/paperFollies/game/start/admin`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `bearer ${localStorage.getItem('bearerPaperFollies')}`
        }
      })
        .then((response: Response) => {
          this.setState({
            fetchingData: false
          });

          if (response.status === 200) {
            response.json()
              .then((data: PutStartGameResponse) => {
                const participant: Participant = {
                  attributes: data.participants.filter(p => p.id === this.state.participant.attributes.id)[0],
                  state: {
                    content: "",
                    contentVersion: 0,
                    isEnded: false
                  }
                }

                const gameState: GameState = {
                  isStarted: true,
                  isEnding: false,
                  isEnded: false,
                  isPublished: false
                }

                const game = this.state.game;
                game.state = gameState;

                this.setState({
                  game: game,
                  participant: participant,
                  section: participant.attributes.isAdmin && !participant.attributes.isAdded ? Section.Admin : Section.Game,
                  gamePage: participant.attributes.isAdded ? GamePage.Entry : GamePage.NotAdded,
                  participants: data.participants
                });
              })
          } else {
            response.json()
              .then((data: ErrorResponse) => {
                this.setState({
                  errorMessage: data.title
                });
              })
          }
        });
    }
  }

  startGamePlayer = () => {
    if (!this.state.fetchingData) {
      this.setState({
        fetchingData: true
      });

      fetch(`api/paperFollies/game/start/player`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `bearer ${localStorage.getItem('bearerPaperFollies')}`
        }
      })
        .then((response: Response) => {
          this.setState({
            fetchingData: false
          });

          if (response.status === 200) {
            response.json()
              .then((data: GetStartGamePlayerResponse) => {
                const participant: Participant = {
                  attributes: data.participants.filter(p => p.id === this.state.participant.attributes.id)[0],
                  state: {
                    content: "",
                    contentVersion: 0,
                    isEnded: false
                  }
                };

                this.setState({
                  participant: participant,
                  section: Section.Game,
                  gamePage: participant.attributes.isAdded ? GamePage.Entry : GamePage.NotAdded,
                  participants: data.participants
                });
              })
          } else {
            response.json()
              .then((data: ErrorResponse) => {
                this.setState({
                  errorMessage: data.title
                });
              })
          }
        });
    }
  }

  changeParticipantBiography = (participantBiography: string) => {
    const participant = this.state.participant;
    participant.attributes.biography = participantBiography;

    this.setState({
      participant: participant
    });
  }

  toggleIsPlayer = () => {
    const participant = this.state.participant;
    participant.attributes.isPlayer = !participant.attributes.isPlayer;

    this.setState({
      participant: participant
    });
  }

  changeEntryView = (entryView: EntryView) => {
    this.setState({
      errorMessage: "",
      entryView: entryView
    });
  }

  changeFinalView = (finalView: FinalView) => {
    this.setState({
      errorMessage: "",
      finalView: finalView
    });
  }

  toggleSection = (section: Section) => {
    this.setState({
      section: section
    });
  }

  toggleParticipantsHaveBiography = () => {
    const game = this.state.game;
    game.attributes.participantsHaveBiographies = !game.attributes.participantsHaveBiographies;

    this.setState({
      game: game
    });
  }

  toggleRandomlyOrderPlayers = () => {
    const game = this.state.game;
    game.attributes.playersAreRandomlyOrdered = !game.attributes.playersAreRandomlyOrdered;

    this.setState({
      game: game
    });
  }

  changeParticipantName = (participantName: string) => {
    const participant = this.state.participant;
    participant.attributes.name = participantName;

    this.setState({
      participant: participant
    });
  }

  changePlayerPassword = (password: string) => {
    this.setState({
      password: password
    })
  }

  changePlayerConfirmPassword = (confirmPassword: string) => {
    this.setState({
      confirmPassword: confirmPassword
    });
  }

  toggleAddPlayersManually = () => {
    const game = this.state.game;
    game.attributes.addPlayersManually = !game.attributes.addPlayersManually;

    this.setState({
      game: game
    });
  }

  changeGameCode = (gameCode: string) => {
    const game = this.state.game;
    game.attributes.code = gameCode;

    this.setState({
      game: game
    });
  }

  changeGameType = (gameType: string) => {
    const game = this.state.game;
    game.attributes.canSeePrecedingContent = gameType != GameType.Following;
    game.attributes.canSeeFollowingContent = gameType != GameType.Preceding;

    this.setState({
      game: game
    });
  }

  createGame = () => {
    if (!this.state.fetchingData) {
      this.setState({
        fetchingData: true
      });

      const body: CreateGameRequest = {
        gameAttributes: this.state.game.attributes,
        participantAttributes: this.state.participant.attributes,
        password: this.state.password!.trim(),
        confirmPassword: this.state.confirmPassword!.trim()
      };

      fetch("api/paperFollies/game", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      })
        .then((response: Response) => {
          this.setState({
            fetchingData: false
          });

          if (response.status === 200) {
            response.json()
              .then((data: PostGameResponse) => {
                localStorage.setItem('bearerPaperFollies', data.participantToken);

                const game = this.state.game;
                game.attributes.id = data.gameId;
                game.attributes.code = data.gameCode;

                const participants: ParticipantAttributes[] = [];
                participants.push(data.participant.attributes);

                this.setState({
                  isLoggedIn: true,
                  participant: data.participant,
                  game: game,
                  gamePage: GamePage.GameReady,
                  participants: participants
                }, this.setSelectedDisplayedPlayers);
              })
          } else {
            response.json()
              .then((data: ErrorResponse) => {
                this.setState({
                  errorMessage: data.title
                });
              })
          }
        });
    }
  }

  logIn = () => {
    if (!this.state.fetchingData) {
      const password = this.state.password.trim();

      if (password) {
        const body: LoginRequest = {
          participantId: this.state.participant.attributes.id,
          participantPassword: password
        }

        this.setState({
          fetchingData: true
        });

        fetch(`api/paperFollies/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        })
          .then(response => {
            this.setState({
              fetchingData: false
            });

            if (response.status === 200) {
              response.json()
                .then((data: LoginParticipantResponse) => {
                  localStorage.setItem('bearerPaperFollies', data.playerToken);

                  const gamePage: GamePage = data.participant.attributes.isAdmin ?
                    (!data.game.state.isStarted ? GamePage.GameReady :
                      (data.game.state.isEnded ? GamePage.Final :
                        (data.participant.state.isEnded ? GamePage.WaitingForEnd : GamePage.Entry))) :
                    (!data.participant.attributes.isAdded ? GamePage.NotAdded :
                      (!data.game.state.isStarted ? GamePage.WaitingForStart :
                        (data.game.state.isEnded ? GamePage.Final :
                          (data.participant.state.isEnded ? GamePage.WaitingForEnd : GamePage.Entry))));

                  // TODO this logic is shared with componentDidMount
                  this.setState({
                    isLoggedIn: true,
                    section: Section.Game,
                    gamePage: gamePage,
                    game: data.game,
                    participant: data.participant,
                    participants: data.participants,
                    contentOld: data.participant.state.content,
                    precedingPlayerState: data.precedingPlayerState,
                    displayedPrecedingPlayerState: data.precedingPlayerState,
                    followingPlayerState: data.followingPlayerState,
                    displayedFollowingPlayerState: data.followingPlayerState,
                  }, this.setSelectedDisplayedPlayers);
                })
            } else {
              response.json()
                .then((data: ErrorResponse) => {
                  this.setState({
                    errorMessage: data.title
                  });
                })
            }
          });
      } else {
        this.setState({
          errorMessage: "no password :("
        });
      }
    }
  }

  getParticipants = () => {
    if (!this.state.pollingData) {
      this.setState({
        pollingData: true
      });

      fetch("api/paperFollies/participants", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `bearer ${localStorage.getItem('bearerPaperFollies')}`
        }
      })
        .then(response => {
          this.setState({
            pollingData: false
          });

          if (response.status === 200) {
              response.json()
                .then((responseJson: GetParticipantsResponse) => {
                  this.setState({
                    participants: responseJson.participants
                  });
                })
            } else {
              response.json()
                .then((data: ErrorResponse) => {
                  this.setState({
                    errorMessage: data.title
                  });
                })
            }
        });
    }
  }

  getAdminState = () => {
    if (!this.state.pollingData) {
      this.setState({
        pollingData: true
      });

      fetch(`api/paperFollies/admin/state?precedingContentVersion=${this.state.precedingPlayerState.contentVersion}&followingContentVersion=${this.state.followingPlayerState.contentVersion}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `bearer ${localStorage.getItem('bearerPaperFollies')}`
        }
      })
        .then(response => {
          this.setState({
            pollingData: false
          });

          if (response.status === 200) {
            response.json()
              .then((data: GetAdminStateResponse) => {
                let precedingPlayerState: PlayerState = this.state.precedingPlayerState;

                if (precedingPlayerState.contentVersion < data.precedingPlayerState.contentVersion) {
                  precedingPlayerState = data.precedingPlayerState;
                }

                let followingPlayerState: PlayerState = this.state.followingPlayerState;

                if (followingPlayerState.contentVersion < data.followingPlayerState.contentVersion) {
                  followingPlayerState = data.followingPlayerState;
                }

                this.setState({
                  precedingPlayerState: precedingPlayerState,
                  followingPlayerState: followingPlayerState,
                  playerSummaries: data.playerSummaries
                });
              })
          } else {
            response.json()
              .then((data: ErrorResponse) => {
                this.setState({
                  errorMessage: data.title
                });
              })
          }
        });
    }
  }

  getGameState = () => {
    if (!this.state.pollingData) {
      this.setState({
        pollingData: true
      });

      fetch("api/paperFollies/game/state", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `bearer ${localStorage.getItem('bearerPaperFollies')}`
        }
      })
        .then(response => {
          this.setState({
            pollingData: false
          });

          if (response.status === 200) {
            response.json()
              .then((responseJson: GetGameStateResponse) => {
                const game = this.state.game;
                game.state = responseJson.gameState;

                // TODO also get participants if game is now Started but wasn't Started?
                this.setState({
                  game: game
                });
              })
          } else {
            response.json()
              .then((data: ErrorResponse) => {
                this.setState({
                  errorMessage: data.title
                });
              })
          }
        });
    }
  }

  getPlayerState = () => {
    if (!this.state.precedingPlayerState || !this.state.followingPlayerState) {
      return;
    }

    if (!this.state.pollingData) {
      this.setState({
        errorMessage: "",
        pollingData: true
      });

      fetch(`api/paperFollies/player/state?precedingContentVersion=${this.state.precedingPlayerState.contentVersion}&followingContentVersion=${this.state.followingPlayerState.contentVersion}`, {
        method: "Get",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `bearer ${localStorage.getItem('bearerPaperFollies')}`
        }
      })
        .then((response: Response) => {
          this.setState({
            pollingData: false
          });

          if (response.status === 200) {
            response.json()
              .then((data: GetPlayerStateResponse) => {
                let precedingPlayerState: PlayerState = this.state.precedingPlayerState;

                if (precedingPlayerState.contentVersion < data.precedingPlayerState.contentVersion) {
                  precedingPlayerState = data.precedingPlayerState;
                }

                let followingPlayerState: PlayerState = this.state.followingPlayerState;

                if (followingPlayerState.contentVersion < data.followingPlayerState.contentVersion) {
                  followingPlayerState = data.followingPlayerState;
                }

                const game = this.state.game;

                game.state = data.gameState

                this.setState({
                  precedingPlayerState: precedingPlayerState,
                  followingPlayerState: followingPlayerState,
                  game: game
                });
              })
          } else {
            response.json()
              .then((data: ErrorResponse) => {
                this.setState({
                  errorMessage: data.title
                });
              })
          }
        });
    }
  }

  addPlayer = () => {
    if (this.state.selectedWaitingPlayerId === 0) {
      this.setState({
        errorMessage: "no player Id :("
      });

      return;
    }

    if (!this.state.fetchingData) {
      this.setState({
        errorMessage: "",
        fetchingData: true
      });

      fetch(`api/paperFollies/participant/${this.state.selectedWaitingPlayerId}/add`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `bearer ${localStorage.getItem('bearerPaperFollies')}`
        }
      })
        .then((response: Response) => {
          this.setState({
            fetchingData: false
          });

          if (response.status === 200) {
            response.json()
              .then((data: PutAddPlayerResponse) => {
                const participants = this.state.participants;

                for (var x = 0; x < participants.length; x++) {
                  if (participants[x].id === this.state.selectedWaitingPlayerId) {
                    participants[x].contentIndex = data.contentIndex;
                    participants[x].isAdded = true;
                  }
                }

                this.setState({
                  participants: participants,
                  selectedWaitingPlayerId: 0
                }, this.setSelectedDisplayedPlayers);
              })
          } else {
            response.json()
              .then((data: ErrorResponse) => {
                this.setState({
                  errorMessage: data.title
                });
              })
          }
        });
    }
  }

  getGameFromCode = (callback: () => void) => {
    if (!this.state.game.attributes.code.trim()) {
      this.setState({
        errorMessage: "no game code :("
      });
  
      return;
    }
  
    this.setState({
      errorMessage: "",
      fetchingData: true
    });
  
    fetch(`api/paperFollies/game/code/${this.state.game.attributes.code.trim().toLowerCase().split(" ").join("-")}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(response => {
        this.setState({
          fetchingData: false
        });
  
        if (response.status === 200) {
          response.json()
            .then((data: GetGameFromCodeResponse) => {
              this.setState({
                game: data.game,
                participants: data.participants
              }, callback);
            })
        } else {
          response.json()
            .then((data: ErrorResponse) => {
              this.setState({
                errorMessage: data.title
              });
            })
        }
      });
  }

  endGame = () => {
    if (!this.state.fetchingData) {
      this.setState({
        fetchingData: true
      });

      fetch(`api/paperFollies/game/end`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `bearer ${localStorage.getItem('bearerPaperFollies')}`
        }
      })
        .then((response: Response) => {
          this.setState({
            fetchingData: false
          });

          if (response.status === 200) {
            response.json()
              .then((data: PutEndGameResponse) => {
                const game: Game = this.state.game;
                game.state.isEnding = true;
                game.state.isEnded = true;

                this.setState({
                  game: game,
                  finalContents: data.finalContents,
                  gamePage: GamePage.Final
                });
              });
          } else {
            response.json()
              .then((data: ErrorResponse) => {
                this.setState({
                  errorMessage: data.title
                });
              })
          }
        });
    }
  }

  publishGame = () => {
    if (!this.state.fetchingData) {
      this.setState({
        fetchingData: true
      });

      fetch(`api/paperFollies/game/publish`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `bearer ${localStorage.getItem('bearerPaperFollies')}`
        }
      })
        .then((response: Response) => {
          this.setState({
            fetchingData: false
          });

          if (response.status === 200) {
            const game: Game = this.state.game;
            game.state.isPublished = true;

            this.setState({
              game: game
            });
          } else {
            response.json()
              .then((data: ErrorResponse) => {
                this.setState({
                  errorMessage: data.title
                });
              })
          }
        });
    }
  }

  beginEndingGame = () => {
    if (!this.state.fetchingData) {
      this.setState({
        fetchingData: true
      });

      fetch(`api/paperFollies/game/begin-ending`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `bearer ${localStorage.getItem('bearerPaperFollies')}`
        }
      })
        .then((response: Response) => {
          this.setState({
            fetchingData: false
          });

          if (response.status === 200) {
            const game: Game = this.state.game;
            game.state.isEnding = true;

            this.setState({
              game: game
            });
          } else {
            response.json()
              .then((data: ErrorResponse) => {
                this.setState({
                  errorMessage: data.title
                });
              })
          }
        });
    }
  }

  joinGame = () => {
    if (!this.state.fetchingData) {
      this.setState({
        fetchingData: true
      });
  
      const body: CreateParticipantRequest = {
        gameId: this.state.game.attributes.id,
        gameCode: this.state.game.attributes.code.trim().toLowerCase().split(" ").join("-"),
        participantAttributes: this.state.participant.attributes,
        password: this.state.password.trim(),
        confirmPassword: this.state.confirmPassword.trim()
      };
  
      fetch("api/paperFollies/participant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      })
        .then((response: Response) => {
          this.setState({
            fetchingData: false
          });
  
          if (response.status === 200) {
            response.json()
              .then((data: PostParticipantResponse) => {
                localStorage.setItem('bearerPaperFollies', data.playerToken);

                this.setState({
                  isLoggedIn: true,
                  gamePage: GamePage.WaitingForStart,
                  participant: data.participant
                });
              })
          } else {
            response.json()
              .then((data: ErrorResponse) => {
                this.setState({
                  errorMessage: data.title
                });
              })
          }
        });
    }
  }

  confirmReset = () => {
    localStorage.removeItem('bearerPaperFollies');

    // TODO this is just copied from initial state, do this better
    // but page & gametype is different
    this.setState({
      game: {
        attributes: {
          playersAreRandomlyOrdered: true,
          addPlayersManually: false,
          canSeeFollowingContent: true,
          canSeePrecedingContent: true,
          code: "",
          description: "",
          id: 0,
          characterLimit: 500,
          participantsHaveBiographies: false,
          title: ""
        },
        state: {
          isEnded: false,
          isEnding: false,
          isStarted: false,
          isPublished: false
        }
      },
      characterLimitInput: "500",
      contentOld: "",
      participant: {
        attributes: {
          isAdmin: false,
          biography: "",
          name: "",
          contentIndex: 0,
          id: 0,
          isPlayer: true,
          isAdded: false
        },
        state: {
          content: "",
          contentVersion: 0,
          isEnded: false
        }
      },
      precedingPlayerState: {
        content: "",
        contentVersion: 0,
        isEnded: false
      },
      displayedPrecedingPlayerState: {
        content: "",
        contentVersion: 0,
        isEnded: false
      },
      followingPlayerState: {
        content: "",
        contentVersion: 0,
        isEnded: false
      },
      displayedFollowingPlayerState: {
        content: "",
        contentVersion: 0,
        isEnded: false
      },
      finalContents: [],
      password: "",
      confirmPassword: "",
      fetchingData: false,
      pollingData: false,
      section: Section.Game,
      gamePage: GamePage.Intro,
      entryView: EntryView.Player,
      gameMode: undefined,
      participants: [],
      errorMessage: "",
      selectedAddedPlayerId: 0,
      selectedWaitingPlayerId: 0,
      isLoggedIn: false,
      playerSummaries: []
    });
  }

  downloadBackup = () => {
    if (!this.state.fetchingData) {
      this.setState({
        fetchingData: true
      });

      fetch("api/paperFollies/game/download/text", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `bearer ${localStorage.getItem('bearerPaperFollies')}`
        }
      })
        .then((response: Response) => {
          this.setState({
            fetchingData: false
          });

          console.log(response);

          if (response.status === 200) {
            response.blob()
              .then(blob => {
                let url = window.URL.createObjectURL(blob);
                let a = document.createElement('a');
                a.href = url;
                a.download = 'something.txt';
                a.click();
              });
          } else {
            response.json()
              .then((data: ErrorResponse) => {
                this.setState({
                  errorMessage: data.title
                });
              })
          }
        });
    }
  }

  cancelJoinGame = () => {
    const game: Game = {
      attributes: {
        playersAreRandomlyOrdered: true,
        addPlayersManually: false,
        canSeeFollowingContent: true,
        canSeePrecedingContent: true,
        code: "",
        description: "",
        id: 0,
        characterLimit: 500,
        participantsHaveBiographies: false,
        title: ""
      },
      state: {
        isEnded: false,
        isEnding: false,
        isStarted: false,
        isPublished: false
      }
    };

    game.attributes.code = this.state.game.attributes.code;

    // TODO this is just copied from initial state, do this better
    // but page & gametype is different
    this.setState({
      game: game,
      characterLimitInput: "500",
      contentOld: "",
      participant: {
        attributes: {
          isAdmin: false,
          biography: "",
          name: "",
          contentIndex: 0,
          id: 0,
          isPlayer: true,
          isAdded: false
        },
        state: {
          content: "",
          contentVersion: 0,
          isEnded: false
        }
      },
      precedingPlayerState: {
        content: "",
        contentVersion: 0,
        isEnded: false
      },
      displayedPrecedingPlayerState: {
        content: "",
        contentVersion: 0,
        isEnded: false
      },
      followingPlayerState: {
        content: "",
        contentVersion: 0,
        isEnded: false
      },
      displayedFollowingPlayerState: {
        content: "",
        contentVersion: 0,
        isEnded: false
      },
      fetchingData: false,
      pollingData: false,
      gameMode: undefined,
      participants: [],
      errorMessage: "",
      selectedAddedPlayerId: 0,
      selectedWaitingPlayerId: 0,
      gamePage: GamePage.LogInGame
    });
  }

  cancelLogIn = () => {
    this.setState({
      gamePage: GamePage.LogInPlayer,
      password: ""
    })
  }

  render() {
    let component: JSX.Element = <div key="ToDo">
      <div className="component">
        <div className="information">ToDo for section ({this.state.section}) gamePage ({this.state.gamePage})</div>
      </div>
      <div className="component buttons">
        <button className="navigation" onClick={() => this.changeSection(Section.Reset)}>Reset</button>
      </div>
    </div>;

    let showGameTitle: boolean = true;

    if (this.state.section === Section.Reset) {
      component = <div key="confirmReset">
        <div className="component">
          <div className="information">Are you sure you want to leave this game?</div>
          <br />
          <div className="information">(If you didn't give a password, you won't be able to log in again!)</div>
        </div>
        <div className="component buttons">
          <button className="action" onClick={this.confirmReset}>Yeah</button>
        </div>
      </div>;
    } else if (this.state.section === Section.Game) {
      if (this.state.gamePage === GamePage.Intro) {
        showGameTitle = false;

        component = <div key={GamePage.Intro}>
          <div className="component">
            <div className="information">Welcome to Paper Follies! A dynamic variant of Exquisite Corpse.</div>
          </div>
          <div className="component">
            <div className="information">This is a creative writing game where each player is assigned one of a list of segments to write in. They can only see the segments before and/or after their own - everything else is invisible to them.</div>
          </div>
          <div className="component">
            <div className="information">But! Unlike in Exquisite Corpse, each player can see when one of their neighbours has made a modification to <i>their</i> text!</div>
          </div>
          <div className="component buttons">
            <button className="action" onClick={() => this.changeGameAction(GamePage.GameTitle, GameMode.Admin)}>Start a New Game</button>
          </div>
          <div className="component">
            <div className="text">or</div>
          </div>
          <div className="component buttons">
            <button className="action" onClick={() => this.changeGameAction(GamePage.GameCodeJoin, GameMode.Player)}>Join an existing Game</button>
          </div>
          <div className="component">
            <div className="text">or</div>
          </div>
          <div className="component buttons">
            <button className="action" onClick={() => this.changeGamePage(GamePage.LogInGame)}>Log In</button>
          </div>
          <div className="component">
            <div className="note">(Disclaimer: Please be aware that I, the sole developer responsible for developing and maintaining this game and its associated database, might accidentally break everything at any time and with no warning. There is no time limit to a game but you are advised to play marathons at your own risk...)</div>
          </div>
        </div>;
      } else if (this.state.gamePage === GamePage.GameTitle) {
        showGameTitle = false;

        component = <div key={GamePage.GameTitle}>
          <div className="component">
            <label htmlFor="gameTitle">Game Title</label>
            <br />
            <input type="text" id="gameTitle" placeholder="What is it?" maxLength={255} defaultValue={this.state.game.attributes.title} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeGameTitle(event.target.value)} />
            <br />
            <div className="note">A name for your splendid creation!</div>
          </div>
          <div className="component buttons">
            <button className="navigation" onClick={() => this.changeGameAction(GamePage.Intro, undefined)}>Back</button>
            <button className="navigation" disabled={!this.state.game.attributes.title.trim()} onClick={() => this.changeGamePage(GamePage.GameDescription)}>Next</button>
          </div>
        </div>;
      } else if (this.state.gamePage === GamePage.GameDescription) {
        component = <div key={GamePage.GameDescription}>
          <div className="component">
            <label htmlFor="description">Description</label>
            <br />
            <textarea id="description" value={this.state.game.attributes.description} placeholder="What is it all about?" rows={2} cols={32} maxLength={4000} onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => this.changeDescription(event.target.value)} />
            <br />
            <div className="note">A prompt for players to start from, for example "The Adventures of Sally Buccaneer, 1930s Astronaut, and her pet Martian Poodle, Written in the First Person". Be as specific or vague as you wish.</div>
            <br />
            <div className="note">Leave blank for 'Hard Mode'.</div>
          </div>
          <div className="component buttons">
            <button className="navigation" onClick={() => this.changeGamePage(GamePage.GameTitle)}>Back</button>
            <button className="navigation" onClick={() => this.changeGamePage(GamePage.GameType)}>Next</button>
          </div>
        </div>;
      } else if (this.state.gamePage === GamePage.GameType) {
        component = <div key={GamePage.GameType}>
          <div className="component">
            <label id="gameType">Which adjacent content can players see?</label>
            <br />
            <select id="gameType" onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.changeGameType(event.currentTarget.value)}
              value={this.state.game.attributes.canSeeFollowingContent ? (this.state.game.attributes.canSeePrecedingContent ? GameType.Both : GameType.Following) : GameType.Preceding}>
              <option value={GameType.Both}>Both preceding and following content</option>
              <option value={GameType.Preceding}>Only preceding content</option>
              <option value={GameType.Following}>Only following content</option>
            </select>
            <br />
            <div className="note">If a player is first in the list and does not have a 'preceding' segment to see, they will see the last segment instead. Vice versa for the last player in the list.</div>
            <br />
            <div className="note">Everyone can see how many players there are in total, and which player they are in the list</div>
          </div>
          <div className="component buttons">
            <button className="navigation" onClick={() => this.changeGamePage(GamePage.GameDescription)}>Back</button>
            <button className="action" onClick={() => this.changeGamePage(GamePage.GameCharacterLimit)}>Next</button>
          </div>
        </div>;
      } else if (this.state.gamePage === GamePage.GameCharacterLimit) {
        const characterLimit = this.state.game.attributes.characterLimit;
        const isValidCharacterLimit =
          !isNaN(characterLimit) &&
          characterLimit >= 1 &&
          characterLimit <= 4000;

        component = <div key={GamePage.GameCharacterLimit}>
          <div className="component">
            <label htmlFor="gameCharacterLimit">Character Limit</label>
            <br />
            <input type="text" id="gameCharacterLimit" placeholder="How many is it?" defaultValue={this.state.characterLimitInput} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeGameCharacterLimit(event.target.value)} />
            <br />
            <div className="note">What is the character limit for each player? For reference, a page in a novel might have about 1,500 characters. Maximum is 4,000 characters but smaller limits are more manageable for quicker games.</div>
          </div>
          <div className="component buttons">
            <button className="navigation" onClick={() => this.changeGamePage(GamePage.GameType)}>Back</button>
            <button className="navigation" disabled={!isValidCharacterLimit} onClick={() => this.changeGamePage(GamePage.PlayerName)}>Next</button>
          </div>
        </div>;
      } else if (this.state.gamePage === GamePage.GameCodeJoin) {
        showGameTitle = false;

        component = <div key={GamePage.GameCodeJoin}>
          <div className="component">
            <label htmlFor="gameCode">Game Code</label>
            <br />
            <input type="text" id="gameCode" placeholder="something-something-something" defaultValue={this.state.game.attributes.code} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeGameCode(event.target.value)} />
            <br />
            <div className="note">The code for the game you want to join</div>
          </div>
          <div className="component buttons">
            <button className="navigation" disabled={this.state.fetchingData} onClick={() => this.changeGameAction(GamePage.Intro, undefined)}>Back</button>
            <button className="action" disabled={!this.state.game.attributes.code.trim() || this.state.fetchingData} onClick={() => this.getGameFromCode(() => this.changeGamePage(GamePage.GameJoinIntro))}>Find Game</button>
          </div>
        </div>;
      } else if (this.state.gamePage === GamePage.GameJoinIntro) {
        component = <div key={GamePage.GameJoinIntro}>
          <div className="component">
            {this.state.game.attributes.description &&
              <div className="subtitle">{this.state.game.attributes.description}</div>
            }
            {this.state.game.attributes.description &&
              <br />
            }
            <div className="emphasis">A story written in segments of no more than {this.state.game.attributes.characterLimit} characters</div>
            <br />
            {this.state.game.attributes.canSeeFollowingContent && this.state.game.attributes.canSeePrecedingContent ?
              <div className="emphasis">Only able to see immediately adjacent sections</div> :
              <div className="emphasis">Only able to see the {this.state.game.attributes.canSeePrecedingContent ? "preceding" : "following"} section</div>
            }
            <br />
          </div>
          {this.state.game.state.isStarted &&
            <div className="component">
              <div className="information">Unfortunately this game is already {this.state.game.state.isEnded ? "ended" : "started"}!</div>
            </div>
          }
          <div className="component buttons">
            <button className="action" onClick={this.confirmReset}>Cancel</button>
            {!this.state.game.state.isStarted &&
              <button className="action" onClick={() => this.changeGamePage(GamePage.PlayerName)}>Continue</button>
            }
            {this.state.game.state.isEnded &&
              <button className="action" onClick={() => this.changeGamePage(GamePage.Final)}>View game</button>
            }
          </div>
        </div>;
      } else if (this.state.gamePage === GamePage.PlayerName) {
        component = <div key={GamePage.PlayerName}>
          <div className="component">
            <label id="playerName">Your Name</label>
            <br />
            <input type="text" id="playerName" placeholder="Who are you?" defaultValue={this.state.participant.attributes.name} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeParticipantName(event.target.value)} />
            <br />
            <div className="note">A name for your splendid self!</div>
          </div>
          {this.state.gameMode == GameMode.Admin &&
            <div className="component">
              <input type="checkbox" id="adminIsPlayer" defaultChecked={this.state.participant.attributes.isPlayer} onChange={this.toggleIsPlayer} />
              <label htmlFor="adminIsPlayer">I also wish to play!</label>
              <br />
              <div className="note">Deselect to have a Game Admin role only</div>
            </div>
          }
          {this.state.gameMode == GameMode.Admin &&
            <div className="component">
              <input type="checkbox" id="playersHaveBiography" defaultChecked={this.state.game.attributes.participantsHaveBiographies} onChange={this.toggleParticipantsHaveBiography} />
              <label htmlFor="playersHaveBiography">Player Biographies</label>
              <br />
              <div className="note">Players can write a short biography about themselves (will be included in final documentation)</div>
            </div>
          }
          <div className="component buttons">
            <button className="navigation" onClick={() => this.changeGamePage(this.state.gameMode === GameMode.Admin ? GamePage.GameCharacterLimit : GamePage.GameJoinIntro)}>Back</button>
            <button className="navigation" disabled={!this.state.participant.attributes.name.trim()} onClick={() => this.changeGamePage(this.state.game.attributes.participantsHaveBiographies ? GamePage.PlayerBiography : GamePage.PlayerPassword)}>Next</button>
          </div>
        </div>;
      } else if (this.state.gamePage === GamePage.PlayerBiography) {
        component = <div key={GamePage.PlayerBiography}>
          <div className="component">
            <label htmlFor="biography">Your Biography</label>
            <br />
            <textarea id="biography" value={this.state.participant.attributes.biography} placeholder="Who are you all about?" rows={2} cols={32} maxLength={4000} onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => this.changeParticipantBiography(event.target.value)} />
            <br />
            <div className="note">Some notes to be included about yourself in final document (optional).</div>
          </div>
          <div className="component buttons">
            <button className="navigation" onClick={() => this.changeGamePage(GamePage.PlayerName)}>Back</button>
            <button className="navigation" onClick={() => this.changeGamePage(GamePage.PlayerPassword)}>Next</button>
          </div>
        </div>;
      } else if (this.state.gamePage === GamePage.PlayerPassword) {
        component = <div key={GamePage.PlayerPassword}>
          <div className="component">
            <label htmlFor="password">Password</label>
            <br />
            <input type="password" id="password" placeholder="What's the word?" defaultValue={this.state.password} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changePlayerPassword(event.target.value)} />
            <br />
            <label htmlFor="confirmPassword">Confirm Password</label>
            <br />
            <input type="password" id="confirmPassword" className={this.state.password !== this.state.confirmPassword ? "error" : ""} placeholder="What's the word (again)?" defaultValue={this.state.confirmPassword} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changePlayerConfirmPassword(event.target.value)} />
            <br />
            {this.state.gameMode === GameMode.Player &&
              <div className="note">Optional password. Not necessary if you intend to complete a game in one session. Can be used to continue writing on a new device if you need to.</div>
            }
            {this.state.gameMode === GameMode.Player &&
              <br />
            }
            <div className="note">(Please note that as this game does not store identifying details, passwords cannot be recovered)</div>
          </div>
          {this.state.gameMode == GameMode.Player &&
            <div className="component buttons">
              <button className="action" disabled={this.state.password.trim() !== this.state.confirmPassword.trim() || this.state.fetchingData} onClick={this.joinGame}>Join Game</button>
            </div>
          }
          <div className="component buttons">
            <button className="navigation" disabled={this.state.fetchingData} onClick={() => this.changeGamePage(this.state.game.attributes.participantsHaveBiographies ? GamePage.PlayerBiography : GamePage.PlayerName)}>Back</button>
            {this.state.gameMode == GameMode.Admin &&
              <button className="navigation" disabled={!this.state.password.trim() || (this.state.password.trim() !== this.state.confirmPassword.trim())} onClick={() => this.changeGamePage(GamePage.CreateGame)}>Next</button>
            }
          </div>
        </div>;
      } else if (this.state.gamePage === GamePage.CreateGame) {
        component = <div key={GamePage.CreateGame}>
          <div className="component">
            {this.state.game.attributes.description &&
              <div className="subtitle">{this.state.game.attributes.description}</div>
            }
            {this.state.game.attributes.description &&
              <br />
            }
            <div className="emphasis">Written by {this.state.participant.attributes.name} and friends</div>
            <br />
            <div className="emphasis">In segments of no more than {this.state.game.attributes.characterLimit} characters</div>
            <br />
            {this.state.game.attributes.canSeePrecedingContent && this.state.game.attributes.canSeeFollowingContent ?
              <div className="emphasis">Only able to see immediately adjacent sections</div> :
              <div className="emphasis">Only able to see the {this.state.game.attributes.canSeePrecedingContent ? "preceding" : "following"} section</div>
            }
          </div>
          <div className="component">
            <input type="checkbox" id="playersRequireApproval" defaultChecked={this.state.game.attributes.addPlayersManually} onChange={this.toggleAddPlayersManually} />
            <label htmlFor="playersRequireApproval">Players Require Approval</label>
            <br />
            <div className="note">Players need to be approved before joining game.</div>
          </div>
          <div className="component">
            <input type="checkbox" id="randomlyOrderPlayers" defaultChecked={this.state.game.attributes.playersAreRandomlyOrdered} onChange={this.toggleRandomlyOrderPlayers} />
            <label htmlFor="randomlyOrderPlayers">Randomly order players</label>
            <br />
            <div className="note">If unselected, players will be assigned segments in the order they joined.</div>
            <br />
            <div className="note">TODO (as game creator, you will be the first player?)</div>
          </div>
          <div className="component buttons">
            <button className="action" disabled={this.state.fetchingData} onClick={this.createGame}>Create Game</button>
          </div>
          <div className="component buttons">
            <button className="navigation" disabled={this.state.fetchingData} onClick={() => this.changeGamePage(GamePage.PlayerPassword)}>Back</button>
          </div>
        </div>;
      } else if (this.state.gamePage === GamePage.GameReady) {
        const waitingPlayers = this.waitingPlayers().sort((a: ParticipantAttributes, b: ParticipantAttributes) => a.id < b.id ? -1 : 1);

        const waitingPlayer: ParticipantAttributes = waitingPlayers.filter(p => p.id === this.state.selectedWaitingPlayerId)[0];

        let addedPlayers: ParticipantAttributes[] = this.addedPlayers();

        if (this.state.game.attributes.addPlayersManually) {
          addedPlayers = addedPlayers.sort((a: ParticipantAttributes, b: ParticipantAttributes) => a.contentIndex < b.contentIndex ? -1 : 1);
        } else {
          addedPlayers = addedPlayers.sort((a: ParticipantAttributes, b: ParticipantAttributes) => a.id < b.id ? -1 : 1);
        }

        const addedPlayerElements: JSX.Element[] = addedPlayers
          .map((value: ParticipantAttributes, index: number) => <div key={`addedPlayer${index}`} className={`box-item${value.id === this.state.selectedAddedPlayerId ? " selected" : ""}`} onClick={() => this.changeSelectedAddedPlayerId(value.id)}>
              {value.name}
            </div>);

        const addedPlayer: ParticipantAttributes = addedPlayers.filter(p => p.id === this.state.selectedAddedPlayerId)[0];

        const waitingPlayerBiography: JSX.Element[] = waitingPlayer ? (waitingPlayer.biography ?
          waitingPlayer.biography.split("\n").map((value: string, index: number) => <div key={`addedBio${index}`}>
            {value}
          </div>) :
          [<div>(no bio)</div>]) : [];

        const addedPlayerBiography: JSX.Element[] = addedPlayer ? (addedPlayer.biography ?
          addedPlayer.biography.split("\n").map((value: string, index: number) => <div key={`addedBio${index}`}>
            {value}
          </div>) :
          [<div>(no bio)</div>]) : [];

        const waitingPlayerElements: JSX.Element[] = waitingPlayers
          .map((value: ParticipantAttributes, index: number) => <div key={`waitingPlayer${index}`} className={`box-item${value.id === this.state.selectedWaitingPlayerId ? " selected" : ""}`} onClick={() => this.changeSelectedWaitingPlayerId(value.id)}>
            {value.name}
          </div>
        );

        component = <div key={GamePage.GameReady}>
          <div className="component">
            <div className="information">Game is ready now, waiting for people to join!</div>
          </div>
          <div className="component">
            <div className="information">Code for game is</div>
            <br />
            <div className="information"><code>{this.state.game.attributes.code}</code></div>
          </div>
          <div className="component">
            <div className="information">Or share this URL:</div>
            <br />
            <div className="information"><code>{window.location.origin}/paper-follies?join-game={this.state.game.attributes.code}</code></div>
          </div>
          {this.state.game.attributes.addPlayersManually && <div className="component box-container">
            <div className="box-header">
              Players Waiting To Be Added
            </div>
            <div className="box-view">
              {waitingPlayerElements}
            </div>
            {this.state.game.attributes.participantsHaveBiographies && <div className="box-footer">
              {waitingPlayerBiography}
            </div>}
          </div>}
          {this.state.game.attributes.addPlayersManually &&
            <div className="component buttons">
              <button className="action" disabled={this.state.fetchingData || this.state.selectedWaitingPlayerId === 0} onClick={this.addPlayer}>Approve Player</button>
            </div>
          }
          <div className="component box-container">
            <div className="box-header">
              {this.state.game.attributes.addPlayersManually ? "Added Players" : "Players"}
            </div>
            <div className="box-view">
              {addedPlayerElements}
            </div>
            {this.state.game.attributes.participantsHaveBiographies && <div className="box-footer">
              {addedPlayerBiography}
            </div>}
          </div>
          <div className="component">
            <div className="note">(Note: Players can no longer join once game is started!)</div>
          </div>
          <div className="component buttons">
            <button className="action" disabled={this.state.fetchingData || addedPlayers.length < 3} onClick={this.startGame}>Start Game</button>
          </div>
        </div>;
      } else if (this.state.gamePage === GamePage.LogInGame) {
        showGameTitle = false;

        component = <div key={GamePage.LogInGame}>
          <div className="component">
            <label htmlFor="gameCode">Game Code</label>
            <br />
            <input type="text" id="gameCode" placeholder="something-something-something" defaultValue={this.state.game.attributes.code} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeGameCode(event.target.value)} />
            <br />
            <div className="note">The code for the game you want to login to</div>
          </div>
          <div className="component buttons">
            <button className="navigation" disabled={this.state.fetchingData} onClick={() => this.changeGamePage(GamePage.Intro)}>Back</button>
            <button className="action" disabled={!this.state.game.attributes.code.trim() || this.state.fetchingData} onClick={() => this.getGameFromCode(() => { this.initialiseDefaultLoginParticipant(); this.changeGamePage(GamePage.LogInPlayer); })}>Find Game</button>
          </div>
        </div>;
      } else if (this.state.gamePage === GamePage.LogInPlayer) {
        const playerElements: JSX.Element[] = this.state.participants.sort((a: ParticipantAttributes, b: ParticipantAttributes) => a.name < b.name ? -1 : 1)
          .map((option, index) =>
            <option key={`participant${index}`} value={option.id}>{option.name}</option>);

        component = <div key={GamePage.LogInPlayer}>
          <div className="component">
            <div className="information">List Players Here</div>
          </div>
          <div className="component">
            <select onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.changeParticipant(event.currentTarget.value)}
              value={this.state.participant.attributes.id}>
              {playerElements}
            </select>
          </div>
          <div className="component">
            <div className="option selected">
              <div className="name">{this.state.participant.attributes.name}</div>
              <div className="description">{this.state.participant.attributes.biography ? this.state.participant.attributes.biography : "(no bio)"}</div>
            </div>
          </div>
          <div className="component buttons">
            <button className="navigation" onClick={() => this.cancelJoinGame()}>Back</button>
            <button className="action" onClick={() => this.changeGamePage(GamePage.LogInPassword)}>Yes that's me!</button>
          </div>
        </div>;
      } else if (this.state.gamePage === GamePage.WaitingForStart) {
        component = <div key={GamePage.WaitingForStart}>
          <div className="component">
            <div className="component">
              <div className="information">Waiting for game to start...</div>
            </div>
            <div className="component buttons">
              <button className="action" disabled={!this.state.game.state.isStarted || this.state.fetchingData} onClick={this.startGamePlayer}>Start</button>
            </div>
          </div>
        </div>;
      } else if (this.state.gamePage === GamePage.LogInPassword) {
        component = <div key={GamePage.LogInPassword}>
          <div className="component">
            <label htmlFor="password">Password</label>
            <br />
            <input type="password" id="password" placeholder="What's the word?" defaultValue={this.state.password} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changePlayerPassword(event.target.value)} />
            <br />
          </div>
          <div className="component buttons">
            <button className="navigation" disabled={this.state.fetchingData} onClick={() => this.cancelLogIn()}>Back</button>
            <button className="action" disabled={!this.state.password.trim() || this.state.fetchingData} onClick={() => this.logIn()}>Log in</button>
          </div>
        </div>;
      } else if (this.state.gamePage === GamePage.BearerFound) {
        showGameTitle = false;

        component = <div key={GamePage.BearerFound}>
          <div className="component">
            <div className="information">Retrieving Game...</div>
          </div>
        </div>;
      } else if (this.state.gamePage === GamePage.Entry) {
        if (this.state.entryView === EntryView.Details) {
          var description: JSX.Element[] = this.state.game.attributes.description.split("\n").map((content, index) =>
            <div key={`description${index}`} className="information">
              {content}
            </div>
          );

          component = <div key={`${GamePage.Entry}-${EntryView.Details}`}>
            <div className="component">
              <div className="note">
                Code: {this.state.game.attributes.code}
              </div>
              {description}
            </div>
          </div>;
        } else if (this.state.entryView === EntryView.Preceding) {
          const precedingContentsElements: JSX.Element[] = this.state.displayedPrecedingPlayerState.content ?
            this.state.displayedPrecedingPlayerState.content.split("\n").map((content, index) =>
              <div key={`precedingContent${index}`} className="information">
                {content}
              </div>
            ) : [<div key={`precedingContent0`} className="information">(no content yet)</div>];

          component = <div key={`${GamePage.Entry}-${EntryView.Preceding}`}>
            <div className="component buttons">
              <button className="action" disabled={this.state.displayedPrecedingPlayerState.contentVersion === this.state.precedingPlayerState.contentVersion} onClick={() => this.updatePrecedingContent()}>Update</button>
            </div>
            <div className="component">
              {precedingContentsElements}
            </div>
          </div>;
        } else if (this.state.entryView === EntryView.Player) {
          component = <div key={`${GamePage.Entry}-${EntryView.Player}`}>
            {this.state.participant.state.contentVersion === 0 && <div className="component">
              <div className="information">You are player {this.state.participant.attributes.contentIndex} of {this.addedPlayers().length}! Enter your first content here.</div>
            </div>}
            <div className="component">
              <div className="note">{this.state.game.attributes.description}</div>
            </div>
            <div className="component">
              <textarea value={this.state.participant.state.content} placeholder="It was a dark and stormy night..." rows={2} cols={32} maxLength={Number(this.state.game.attributes.characterLimit)} disabled={this.state.game.state.isEnded || this.state.participant.state.isEnded} onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => this.changePlayerContent(event.target.value)} />
              <br />
              <div className="note">V.{this.state.participant.state.contentVersion} - {this.state.participant.state.content.trim().length}/{this.state.game.attributes.characterLimit}</div>
            </div>
            <div className="component buttons">
              <button className="action" disabled={!this.state.participant.state.content.trim() || this.state.participant.state.content.trim() === this.state.contentOld || this.state.participant.state.isEnded} onClick={() => this.updateContent(false)}>Update</button>
              <button className="action" disabled={!this.state.participant.state.content.trim() || this.state.participant.state.isEnded} onClick={() => this.changeEntryView(EntryView.End)}>End</button>
            </div>
          </div>
        } else if (this.state.entryView === EntryView.Following) {
          const followingContentsElements: JSX.Element[] = this.state.displayedFollowingPlayerState.content ?
            this.state.displayedFollowingPlayerState.content.split("\n").map((content, index) =>
              <div key={`followingContent${index}`} className="information">
                {content}
              </div>
            ) : [<div key={`followingContent0`} className="information">(no content yet)</div>];

          component = <div key={`${GamePage.Entry}-${EntryView.Following}`}>
            <div className="component buttons">
              <button className="action" disabled={this.state.displayedFollowingPlayerState.contentVersion === this.state.followingPlayerState.contentVersion} onClick={() => this.updateFollowingContent()}>Update</button>
            </div>
            <div className="component">
              {followingContentsElements}
            </div>
          </div>;
        } else if (this.state.entryView === EntryView.End) {
          component = <div key={`${GamePage.Entry}-${EntryView.End}`}>
            <div className="component">
              <div className="information">Once you confirm the game is ended, you won't be able to update your content any more!</div>
            </div>
            <div className="component buttons">
              <button className="action" disabled={this.state.fetchingData} onClick={() => this.changeEntryView(EntryView.Player)}>Cancel</button>
              <button className="action" disabled={this.state.fetchingData} onClick={() => this.updateContent(true)}>Confirm</button>
            </div>
          </div>;
        }
      } else if (this.state.gamePage === GamePage.WaitingForEnd) {
        component = <div key={GamePage.WaitingForEnd}>
          TODO
        </div>;
      } else if (this.state.gamePage === GamePage.Final) {
        if (this.state.finalView === FinalView.Details) {
          var description: JSX.Element[] = this.state.game.attributes.description.split("\n").map((content, index) =>
            <div key={`finalDescription${index}`} className="information">
              {content}
            </div>
          );

          component = <div key={`${GamePage.Final}-${FinalView.Details}`}>
            <div className="component">
              <div className="note">
                Code: {this.state.game.attributes.code}
              </div>
              {description}
            </div>
          </div>;
        } else if (this.state.finalView === FinalView.Contents) {
          const playerContents: JSX.Element[] = this.state.finalContents.map((content, index) => {
            const contents = content.split("\n").map((content, index) =>
              <div key={`finalFollowingContent${index}`} className="information">
                {content}
              </div>
            );

            return <div key={`finalContent${index}`} className="component">
              {contents}
            </div>
          });

          component = <div key={`${GamePage.Final}-${FinalView.Contents}`}>
            {playerContents}
          </div>;
        } else if (this.state.finalView === FinalView.Players) {

        }
      }
    } else if (this.state.section === Section.Admin) {
      let adminButtons: JSX.Element;

      if (!this.state.game.state.isEnded) {
        adminButtons = <div className="component buttons">
          <button className="action" disabled={this.state.fetchingData || this.state.game.state.isEnding} onClick={() => this.beginEndingGame()}>Begin Ending Game</button>
          <button className="action" disabled={this.state.fetchingData} onClick={() => this.endGame()}>End Game</button>
        </div>;
      } else {
        adminButtons = <div className="component buttons">
          <button className="action" onClick={() => this.changeGamePage(GamePage.Final)}>Show Result</button>
          <button className="action" onClick={() => this.publishGame()}>Publish</button>
        </div>;
      }

      const playerSummaries: JSX.Element[] = this.state.playerSummaries
        .map((playerSummary: PlayerSummary, index: number) => <tr key={`summary${index}`}>
          <td>{playerSummary.contentIndex}</td>
          <td>{playerSummary.name}</td>
          <td>{playerSummary.contentVersion}</td>
          <td>{playerSummary.isEnded ? "True" : "False"}</td>
        </tr>
        );

      const playerSummariesTable: JSX.Element = <table style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Order</th>
            <th>Name</th>
            <th>Version</th>
            <th>Has Finished</th>
          </tr>
        </thead>
        <tbody>
          {playerSummaries}
        </tbody>
      </table>

      component = <div key={Section.Admin}>
        {adminButtons}
        {playerSummariesTable}
        <div className="component buttons">
          <button className="action" onClick={() => this.downloadBackup()}>Download Backup</button>
        </div>
      </div>;
    } else if (this.state.section === Section.About) {
      showGameTitle = this.state.isLoggedIn;

      component = <div key={Section.About} className="component">
        <div className="information">This game is intended as light entertainment, but it will store some content you have created so here is some legal information:</div>
        <div className="information">TODO legal information</div>
      </div>;
    }

    const precedingContentVersionChanged = this.state.precedingPlayerState.contentVersion !== this.state.displayedPrecedingPlayerState.contentVersion;
    const followingContentVersionChanged = this.state.followingPlayerState.contentVersion !== this.state.displayedFollowingPlayerState.contentVersion;

    const finalGuides: JSX.Element[] = [
      <button key="final-guide-details" disabled={this.state.finalView === FinalView.Details} onClick={() => this.changeFinalView(FinalView.Details)}>
        Details
      </button>,
      <button key="final-guide-contents" disabled={this.state.finalView === FinalView.Contents} onClick={() => this.changeFinalView(FinalView.Contents)}>
        Contents
      </button>,
      <button key="final-guide-players" disabled={this.state.finalView === FinalView.Players} onClick={() => this.changeFinalView(FinalView.Players)}>
        Players
      </button>
    ];

    const entryGuides: JSX.Element[] = [
      <button key="guide-details" disabled={this.state.entryView === EntryView.Details} onClick={() => this.changeEntryView(EntryView.Details)}>
        Details
      </button>
    ];

    let hasAddedFirstDivider: boolean = false;
    let hasAddedSecondDivider: boolean = false;

    const playerCount = this.addedPlayers().length;
    const playerIndex = this.state.participant.attributes.contentIndex;
    const canSeePrecedingContent = this.state.game.attributes.canSeePrecedingContent;
    const canSeeFollowingContent = this.state.game.attributes.canSeeFollowingContent;

    for (let x: number = 1; x <= playerCount; x++) {
      if (x === 1) {
        if (playerIndex === 1) {
          entryGuides.push(<button key="guide-you" disabled={this.state.entryView === EntryView.Player} onClick={() => this.changeEntryView(EntryView.Player)}>{x}/{playerCount} (You)</button>);
        } else if (playerIndex === 2 && canSeePrecedingContent) {
          entryGuides.push(<button key="guide-preceding" className={precedingContentVersionChanged ? "highlight" : ""} disabled={this.state.entryView === EntryView.Preceding} onClick={() => this.changeEntryView(EntryView.Preceding)}>{x}/{playerCount}</button>);
        } else if (playerIndex === playerCount && canSeeFollowingContent) {
          entryGuides.push(<button key="guide-following" className={followingContentVersionChanged ? "highlight" : ""} disabled={this.state.entryView === EntryView.Following} onClick={() => this.changeEntryView(EntryView.Following)}>{x}/{playerCount}</button>);
        } else if (x < playerIndex) {
          if (!hasAddedFirstDivider) {
            entryGuides.push(<div key="guide-divider-first" className="divider">...</div>);
            hasAddedFirstDivider = true;
          }
        } else {
          if (!hasAddedSecondDivider) {
            entryGuides.push(<div key="guide-divider-second" className="divider">...</div>);
            hasAddedSecondDivider = true;
          }
        }
      } else if (x === playerCount) {
        if (playerIndex === playerCount) {
          entryGuides.push(<button key="guide-you" disabled={this.state.entryView === EntryView.Player} onClick={() => this.changeEntryView(EntryView.Player)}>{x}/{playerCount} (You)</button>);
        } else if (playerIndex === 1 && canSeePrecedingContent) {
          entryGuides.push(<button key="guide-preceding" className={precedingContentVersionChanged ? "highlight" : ""} disabled={this.state.entryView === EntryView.Preceding} onClick={() => this.changeEntryView(EntryView.Preceding)}>{x}/{playerCount}</button>);
        } else if (playerIndex === playerCount - 1 && canSeeFollowingContent) {
          entryGuides.push(<button key="guide-following" className={followingContentVersionChanged ? "highlight" : ""} disabled={this.state.entryView === EntryView.Following} onClick={() => this.changeEntryView(EntryView.Following)}>{x}/{playerCount}</button>);
        } else if (x < playerIndex) {
          if (!hasAddedFirstDivider) {
            entryGuides.push(<div key="guide-divider-first" className="divider">...</div>);
            hasAddedFirstDivider = true;
          }
        } else {
          if (!hasAddedSecondDivider) {
            entryGuides.push(<div key="guide-second" className="divider">...</div>);
            hasAddedSecondDivider = true;
          }
        }
      } else if (playerIndex === x) {
        entryGuides.push(<button key="guide-you" disabled={this.state.entryView === EntryView.Player} onClick={() => this.changeEntryView(EntryView.Player)}>{x}/{playerCount} (You)</button>);
      } else if (playerIndex === x + 1 && canSeePrecedingContent) {
        entryGuides.push(<button key="guide-preceding" className={precedingContentVersionChanged ? "highlight" : ""} disabled={this.state.entryView === EntryView.Preceding} onClick={() => this.changeEntryView(EntryView.Preceding)}>{x}/{playerCount}</button>);
      } else if (playerIndex === x - 1 && canSeeFollowingContent) {
        entryGuides.push(<button key="guide-following" className={followingContentVersionChanged ? "highlight" : ""} disabled={this.state.entryView === EntryView.Following} onClick={() => this.changeEntryView(EntryView.Following)}>{x}/{playerCount}</button>);
      } else if (x < playerIndex) {
        if (!hasAddedFirstDivider) {
          entryGuides.push(<div key="guide-divider-first" className="divider">...</div>);
          hasAddedFirstDivider = true;
        }
      } else {
        if (!hasAddedSecondDivider) {
          entryGuides.push(<div key="guide-second" className="divider">...</div>);
          hasAddedSecondDivider = true;
        }
      }
    }

    return (
      <div>
        <div className="component headers">
          <button className="left" onClick={() => this.changeSection(Section.Game)}>Game</button>
          {this.state.participant.attributes.isAdmin && <button className="left" onClick={() => this.changeSection(Section.Admin)}>Admin</button>}
          <button className="left" onClick={() => this.changeSection(Section.About)}>About</button>
          {this.state.participant.attributes.id > 0 && <button className="right" onClick={() => this.changeSection(Section.Reset)}>Exit</button>}
        </div>
        <div className="component">
          <div className="title">{showGameTitle && this.state.game.attributes.title ? this.state.game.attributes.title : "Paper Follies"}</div>
        </div>
        {this.state.errorMessage &&
          <div className="component">
            <div className="error-message">{this.state.errorMessage}</div>
          </div>
        }
        {this.state.isLoggedIn && this.state.participant.state.contentVersion > 0 &&
          this.state.section === Section.Game &&
          this.state.gamePage === GamePage.Entry &&
          <div className="component guides">
          {entryGuides}
        </div>}
        {this.state.section === Section.Game &&
          this.state.gamePage === GamePage.Final &&
          <div className="component guides">
            {finalGuides}
          </div>}
        {component}
      </div>
    );
  }
}
