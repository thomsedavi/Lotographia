import * as React from "react";
import { CreateGameRequest, CreateParticipantRequest, LoginRequest, PutContentRequest } from "./PaperFolliesRequests";
import { GetGameFromCodeData, GetFinalFromCodeData, GetFinalContents, GetStartGamePlayerData, GetAdminStateData, GetPlayerStateData, PostParticipantData, PostLoginParticipantData, GetParticipantsData, PutAddPlayerData, GetGameStateData, PostGameData, GetParticipantData, ErrorData, PutStartGameData, PutEndGameData } from "./PaperFolliesResponses";
import { GameMode, GameType, Section, GamePage, AdminPage, EntryView, FinalView } from "./PaperFolliesEnums";
import { Game, Participant, ParticipantAttributes, PlayerSummary, PlayerState } from "./PaperFolliesInterfaces";

interface PaperFolliesState {
  gameMode?: GameMode, // admin, player or reader
  section: Section,
  gamePage: GamePage,
  adminPage: AdminPage,
  entryView: EntryView,
  finalView: FinalView,
  game: Game,
  characterLimitInput: string,
  contentOld: string, // to compare for differences
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
  selectedLoginPlayerId: number,
  isLoggedIn: boolean,
  playerSummaries: PlayerSummary[],
  shownInfos: { [infoId: string]: boolean }
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
          isShared: false
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
      adminPage: AdminPage.Main,
      entryView: EntryView.Player,
      finalView: FinalView.Contents,
      participants: [],
      errorMessage: "",
      selectedAddedPlayerId: 0,
      selectedWaitingPlayerId: 0,
      selectedLoginPlayerId: 0,
      isLoggedIn: false,
      playerSummaries: [],
      shownInfos: {
        "info1": true
      }
    };
  }

  componentDidMount = () => {
    const searchParams = new URLSearchParams(window.location.search);

    if (this.state.gamePage === GamePage.BearerFound) {
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
              .then((data: GetParticipantData) => {
                this.setLoginState(data);
              })
          } else {
            localStorage.removeItem('bearerPaperFollies');

            this.setState({
              gamePage: GamePage.Intro
            });
          }
        });
    } else if (searchParams.get("join-game")) {
      const game = this.state.game;
      game.attributes.code = searchParams.get("join-game")!;

      this.setState({
        section: Section.Game,
        gamePage: GamePage.RetrievingGame,
        game: game,
        gameMode: GameMode.Player
      }, () => this.getGameFromCode(() => this.changeGamePage(GamePage.GameJoinIntro), () => this.changeGamePage(GamePage.GameCode, false)));
    } else if (searchParams.get("view-game")) {
      const game = this.state.game;
      game.attributes.code = searchParams.get("view-game")!;

      this.setState({
        section: Section.Game,
        gamePage: GamePage.GameCode,
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
          } else if (this.state.participant.attributes.isAdded) {
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
    this.changeLoginParticipant(this.state.participants[0].id);

    this.setState({
      gamePage: GamePage.LogInPlayer
    });
  }

  changeLoginParticipant = (participantId: number) => {
    this.setState({
      selectedLoginPlayerId: participantId
    });
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

  changeSection = (section: Section) => {
    this.setState({
      errorMessage: "",
      section: section
    });
  }

  changeGamePage = (gamePage: GamePage, clearMessage: boolean = true) => {
    this.setState(prevState => ({
      errorMessage: clearMessage ? "" : prevState.errorMessage,
      section: Section.Game,
      gamePage: gamePage
    }));
  }

  changeAdminPage = (adminPage: AdminPage) => {
    this.setState({
      errorMessage: "",
      section: Section.Admin,
      adminPage: adminPage
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

  updateContent = () => {
    if (!this.state.fetchingData) {
      this.setState({
        fetchingData: true,
        errorMessage: ""
      });

      const body: PutContentRequest = {
        content: this.state.participant.state.content.trim()
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
            participant.state.isEnded = this.state.game.state.isEnding;

            this.setState({
              participant: participant,
              contentOld: participant.state.content.trim(),
              section: participant.state.isEnded && participant.attributes.isAdmin ? Section.Admin : Section.Game,
              gamePage: !participant.attributes.isAdded ? GamePage.Details :
                (participant.state.isEnded ? GamePage.WaitingForEnd : GamePage.Entry),
              errorMessage: ""
            });
          } else {
            response.json()
              .then((data: ErrorData) => {
                this.setState({
                  errorMessage: data.title
                });
              })
          }
        });
    }
  }

  updatePrecedingContent = () => {
    this.setState(prevState => ({
      displayedPrecedingPlayerState: prevState.precedingPlayerState
    }));
  }

  updateFollowingContent = () => {
    this.setState(prevState => ({
      displayedFollowingPlayerState: prevState.followingPlayerState
    }));
  }

  startGameAdmin = () => {
    if (!this.state.fetchingData) {
      this.setState({
        fetchingData: true,
        errorMessage: ""
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
              .then((data: PutStartGameData) => {
                const participant: Participant = this.state.participant;
                participant.attributes = data.participants.filter(p => p.id === this.state.participant.attributes.id)[0];

                const game = this.state.game;
                game.state.isStarted = true;

                this.setState({
                  game: game,
                  participant: participant,
                  section: !participant.attributes.isAdded ? Section.Admin : Section.Game,
                  gamePage: !participant.attributes.isAdded ? GamePage.Details : GamePage.Entry,
                  participants: data.participants
                });
              })
          } else {
            response.json()
              .then((data: ErrorData) => {
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
        fetchingData: true,
        errorMessage: ""
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
              .then((data: GetStartGamePlayerData) => {
                const participant: Participant = this.state.participant;
                participant.attributes = data.participants.filter(p => p.id === this.state.participant.attributes.id)[0];

                this.setState({
                  participant: participant,
                  section: Section.Game,
                  gamePage: participant.attributes.isAdded ? GamePage.Entry : GamePage.NotAdded,
                  participants: data.participants
                });
              })
          } else {
            response.json()
              .then((data: ErrorData) => {
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
      section: Section.Game,
      gamePage: GamePage.Entry,
      entryView: entryView
    });
  }

  changeFinalView = (finalView: FinalView) => {
    this.setState({
      errorMessage: "",
      section: Section.Game,
      gamePage: GamePage.Final,
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
        fetchingData: true,
        errorMessage: ""
      });

      const body: CreateGameRequest = {
        gameAttributes: this.state.game.attributes,
        participantAttributes: this.state.participant.attributes,
        password: this.state.password.trim(),
        confirmPassword: this.state.confirmPassword.trim()
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
              .then((data: PostGameData) => {
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
                });
              })
          } else {
            response.json()
              .then((data: ErrorData) => {
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
          participantId: this.state.selectedLoginPlayerId,
          participantPassword: password
        }

        this.setState({
          fetchingData: true,
          errorMessage: ""
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
                .then((data: PostLoginParticipantData) => {
                  localStorage.setItem('bearerPaperFollies', data.playerToken);
                  this.setLoginState(data);
                })
            } else {
              response.json()
                .then((data: ErrorData) => {
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

  setLoginState = (data: GetParticipantData) => {
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
      section: data.participant.attributes.isAdmin && data.game.state.isStarted && !data.game.state.isEnded ? Section.Admin : Section.Game,
      gamePage: gamePage,
      entryView: data.participant.attributes.isAdded ? EntryView.Player : EntryView.Details,
      game: data.game,
      participant: data.participant,
      participants: data.participants,
      contentOld: data.participant.state.content,
      precedingPlayerState: data.precedingPlayerState,
      displayedPrecedingPlayerState: data.precedingPlayerState,
      followingPlayerState: data.followingPlayerState,
      displayedFollowingPlayerState: data.followingPlayerState,
      finalContents: data.finalContents,
      gameMode: data.participant.attributes.isAdmin ? GameMode.Admin : GameMode.Player
    });
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
                .then((data: GetParticipantsData) => {
                  this.setState({
                    participants: data.participants
                  });
                })
            } else {
              response.json()
                .then((data: ErrorData) => {
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
              .then((data: GetAdminStateData) => {
                // state content returns blank if it doesn't need updating
                // so only update if version is greater than existing
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
              .then((data: ErrorData) => {
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
              .then((data: GetGameStateData) => {
                const game = this.state.game;
                game.state = data.gameState;

                this.setState({
                  game: game,
                  participants: data.participants
                });
              })
          } else {
            response.json()
              .then((data: ErrorData) => {
                this.setState({
                  errorMessage: data.title
                });
              })
          }
        });
    }
  }

  getPlayerState = () => {
    if (!this.state.pollingData) {
      this.setState({
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
              .then((data: GetPlayerStateData) => {
                // state content returns blank if it doesn't need updating
                // so only update if version is greater than existing
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
              .then((data: ErrorData) => {
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
        fetchingData: true,
        errorMessage: ""
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
              .then((data: PutAddPlayerData) => {
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
                });
              })
          } else {
            response.json()
              .then((data: ErrorData) => {
                this.setState({
                  errorMessage: data.title
                });
              })
          }
        });
    }
  }

  getFinalFromCode = (callback: () => void) => {
    if (!this.state.game.attributes.code.trim()) {
      this.setState({
        errorMessage: "no game code :("
      });

      return;
    }

    this.setState({
      fetchingData: true,
      errorMessage: ""
    });

    fetch(`api/paperFollies/final/code/${this.state.game.attributes.code.trim().toLowerCase().split(" ").join("-")}`, {
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
            .then((data: GetFinalFromCodeData) => {
              this.setState({
                game: data.game,
                participants: data.participants,
                finalContents: data.finalContents
              }, callback);
            })
        } else {
          response.json()
            .then((data: ErrorData) => {
              this.setState({
                errorMessage: data.title
              });
            })
        }
      });
  }

  getGameFromCode = (successCallback: () => void, failureCallback: () => void) => {
    if (!this.state.game.attributes.code.trim()) {
      this.setState({
        errorMessage: "no game code :("
      });
  
      return;
    }
  
    this.setState({
      fetchingData: true,
      errorMessage: ""
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
            .then((data: GetGameFromCodeData) => {
              this.setState({
                game: data.game,
                participants: data.participants
              }, successCallback);
            })
        } else {
          response.json()
            .then((data: ErrorData) => {
              this.setState({
                errorMessage: data.title
              }, failureCallback);
            })
        }
      });
  }

  endGame = () => {
    if (!this.state.fetchingData) {
      this.setState({
        fetchingData: true,
        errorMessage: ""
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
              .then((data: PutEndGameData) => {
                const game: Game = this.state.game;
                game.state.isEnding = true;
                game.state.isEnded = true;

                this.setState({
                  game: game,
                  finalContents: data.finalContents,
                  section: Section.Game,
                  gamePage: GamePage.Final,
                  finalView: FinalView.Contents,
                  adminPage: AdminPage.Main
                });
              });
          } else {
            response.json()
              .then((data: ErrorData) => {
                this.setState({
                  errorMessage: data.title
                });
              })
          }
        });
    }
  }

  getFinalContents = () => {
    if (!this.state.fetchingData) {
      this.setState({
        fetchingData: true,
        errorMessage: ""
      });

      fetch(`api/paperFollies/game/final`, {
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
              .then((data: GetFinalContents) => {
                this.setState({
                  finalContents: data.finalContents,
                  gamePage: GamePage.Final,
                  finalView: FinalView.Contents
                });
              });
          } else {
            response.json()
              .then((data: ErrorData) => {
                this.setState({
                  errorMessage: data.title
                });
              })
          }
        });
    }
  }

  shareGame = () => {
    if (!this.state.fetchingData) {
      this.setState({
        fetchingData: true,
        errorMessage: ""
      });

      fetch(`api/paperFollies/game/share`, {
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
            game.state.isShared = true;

            this.setState({
              game: game,
              adminPage: AdminPage.Main
            });
          } else {
            response.json()
              .then((data: ErrorData) => {
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
        fetchingData: true,
        errorMessage: ""
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
              game: game,
              adminPage: AdminPage.Main
            });
          } else {
            response.json()
              .then((data: ErrorData) => {
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
        fetchingData: true,
        errorMessage: ""
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
              .then((data: PostParticipantData) => {
                localStorage.setItem('bearerPaperFollies', data.playerToken);

                const participant: Participant = this.state.participant;
                participant.attributes = data.participantAttributes;

                this.setState({
                  isLoggedIn: true,
                  gamePage: GamePage.WaitingForStart,
                  participant: participant
                });
              })
          } else {
            response.json()
              .then((data: ErrorData) => {
                this.setState({
                  errorMessage: data.title
                });
              })
          }
        });
    }
  }

  closeHelp = (infoId: string) => {
    const shownInfos = this.state.shownInfos;

    shownInfos[infoId] = false;

    this.setState({
      shownInfos: shownInfos
    });
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
          isShared: false
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
      adminPage: AdminPage.Main,
      entryView: EntryView.Player,
      gameMode: undefined,
      participants: [],
      errorMessage: "",
      selectedAddedPlayerId: 0,
      selectedWaitingPlayerId: 0,
      selectedLoginPlayerId: 0,
      isLoggedIn: false,
      playerSummaries: []
    });
  }

  downloadBackup = () => {
    if (!this.state.fetchingData) {
      this.setState({
        fetchingData: true,
        errorMessage: ""
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

          if (response.status === 200) {
            response.blob()
              .then(blob => {
                let url = window.URL.createObjectURL(blob);
                let a = document.createElement('a');
                a.href = url;
                a.download = `${this.state.game.attributes.title.replace(/\s/g, '')}.txt`;
                a.click();
              });
          } else {
            response.json()
              .then((data: ErrorData) => {
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
        isShared: false
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
      selectedLoginPlayerId: 0,
      gamePage: GamePage.LogInGame
    });
  }

  cancelLogIn = () => {
    this.setState({
      gamePage: GamePage.LogInPlayer,
      password: ""
    })
  }

  // TODO expand
  getNumberth = (index: number) => {
    if (index === 1) {
      return `${index}st`;
    } else if (index === 2) {
      return `${index}nd`;
    } else if (index === 3) {
      return `${index}rd`;
    } else if (index >= 4 && index <= 20) {
      return `${index}th`;
    } else {
      return `#${index}`;
    }
  }

  render() {
    let component: JSX.Element = <div key="ToDo">
      <div className="component">
        <div className="information">ToDo for section ({this.state.section}) gamePage ({this.state.gamePage} entryView ({this.state.entryView}) finalView ({this.state.finalView}))</div>
      </div>
      <div className="component buttons">
        <button className="navigation" onClick={() => this.changeSection(Section.ConfirmReset)}>Reset</button>
      </div>
    </div>;

    let showGameTitle: boolean = true;

    if (this.state.section === Section.ConfirmReset) {
      component = <div key={Section.ConfirmReset}>
        <div className="component">
          <div className="information">Are you sure you want to leave this game?</div>
          <br />
          <div className="information">(If you didn't give a password, you won't be able to log in again!)</div>
        </div>
        <div className="component buttons">
          <button className="action" onClick={this.confirmReset}>Yup</button>
        </div>
      </div>;
    } else if (this.state.section === Section.Game) {
      if (this.state.gamePage === GamePage.Intro) {
        showGameTitle = false;

        component = <div key={`${Section.Game}-${GamePage.Intro}`}>
          <div className="component">
            <div className="information">Welcome to Paper Follies! A dynamic variant of Exquisite Corpse.</div>
          </div>
          <div className="component">
            <div className="information">This is a creative writing game where each player is assigned a segment to write in. They can only see the segments preceding and/or following their own - every other segment is hidden!</div>
          </div>
          <div className="component">
            <div className="information">But! Unlike in Exquisite Corpse, each player can see when one of their neighbours has made a modification to <i>their</i> segment! And these changes might show an insight into what is happening further down the chain...</div>
          </div>
          <div className="component buttons">
            <button className="action" onClick={() => this.changeGameAction(GamePage.GameTitle, GameMode.Admin)}>Start a New Game</button>
          </div>
          <div className="component buttons">
            <button className="action" onClick={() => this.changeGameAction(GamePage.GameCode, GameMode.Player)}>Join a Game</button>
          </div>
          <div className="component buttons">
            <button className="action" onClick={() => this.changeGamePage(GamePage.LogInGame)}>Log In</button>
          </div>
          <div className="component buttons">
            <button className="action" onClick={() => this.changeGameAction(GamePage.GameCode, GameMode.Reader)}>View Game</button>
          </div>
          <div className="component">
            <div className="note">(Note: This game is still in development, if you encounter any bugs or other issues please be patient and contact me on Twitter at <a href="https://twitter.com/lotographia" target="_blank">@lotographia</a>!)</div>
          </div>
        </div>;
      } else if (this.state.gamePage === GamePage.GameTitle) {
        showGameTitle = false;

        component = <div key={`${Section.Game}-${GamePage.GameTitle}`}>
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
        component = <div key={`${Section.Game}-${GamePage.GameDescription}`}>
          <div className="component">
            <label htmlFor="description">Description</label>
            <br />
            <textarea id="description" value={this.state.game.attributes.description} placeholder="What is it all about?" rows={4} cols={40} maxLength={4000} onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => this.changeDescription(event.target.value)} />
            <br />
            <div className="note">A prompt for players to start from, for example "The Adventures of Sally Buccaneer, 1930s Astronaut, and her pet Martian Poodle, Written in the First Person". Be as specific or vague as you wish.</div>
            <br />
            <div className="note">(Or blank for 'Hard Mode')</div>
          </div>
          <div className="component buttons">
            <button className="navigation" onClick={() => this.changeGamePage(GamePage.GameTitle)}>Back</button>
            <button className="navigation" onClick={() => this.changeGamePage(GamePage.GameType)}>Next</button>
          </div>
        </div>;
      } else if (this.state.gamePage === GamePage.GameType) {
        component = <div key={`${Section.Game}-${GamePage.GameType}`}>
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
            <div className="note">The player with the <i>first</i> segment will not have a 'preceding' segment to see, so they will see the <i>last</i> segment instead. Vice versa for the last player in the sequence.</div>
            <br />
            <div className="note">Four players required for a game where each player can see both the preceding and following segments, three players required if they can only see one other other.</div>
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

        component = <div key={`${Section.Game}-${GamePage.GameCharacterLimit}`}>
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
      } else if (this.state.gamePage === GamePage.GameCode) {
        showGameTitle = false;

        component = <div key={`${Section.Game}-${GamePage.GameCode}`}>
          <div className="component">
            <label htmlFor="gameCode">Game Code</label>
            <br />
            <input type="text" id="gameCode" placeholder="something-something-something" defaultValue={this.state.game.attributes.code} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeGameCode(event.target.value)} />
            <br />
            <div className="note">The code for the game you want to {this.state.gameMode === GameMode.Reader ? "read" : "join"}</div>
          </div>
          <div className="component buttons">
            <button className="navigation" disabled={this.state.fetchingData} onClick={() => this.changeGameAction(GamePage.Intro, undefined)}>Back</button>
            {this.state.gameMode === GameMode.Player && <button className="action" disabled={!this.state.game.attributes.code.trim() || this.state.fetchingData} onClick={() => this.getGameFromCode(() => this.changeGamePage(GamePage.GameJoinIntro), () => { })}>Find Game</button>}
            {this.state.gameMode === GameMode.Reader && <button className="action" disabled={!this.state.game.attributes.code.trim() || this.state.fetchingData} onClick={() => this.getFinalFromCode(() => this.changeFinalView(FinalView.Details))}>Find Game</button>}
          </div>
        </div>;
      } else if (this.state.gamePage === GamePage.RetrievingGame) {
        showGameTitle = false;

        component = <div key={`${Section.Game}-${GamePage.RetrievingGame}`}>
          <div className="component">
            <div className="emphasis">Loading Game...</div>
          </div>
        </div>;
      } else if (this.state.gamePage === GamePage.GameJoinIntro) {
        var description: JSX.Element[] = this.state.game.attributes.description.split("\n").map((content, index) =>
          <div key={`description${index}`} className="information">
            {content}
          </div>
        );

        component = <div key={`${Section.Game}-${GamePage.GameJoinIntro}`}>
          {this.state.game.attributes.description && <div className="component">
            {description}
          </div>}
          <div className="component">
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
            {this.state.game.state.isShared &&
              <button className="action" onClick={() => this.changeFinalView(FinalView.Details)}>View game</button>
            }
          </div>
        </div>;
      } else if (this.state.gamePage === GamePage.PlayerName) {
        component = <div key={`${Section.Game}-${GamePage.PlayerName}`}>
          <div className="component">
            <label id="playerName">Your Name</label>
            <br />
            <input type="text" id="playerName" placeholder="Who are you?" defaultValue={this.state.participant.attributes.name} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeParticipantName(event.target.value)} />
            <br />
            <div className="note">A name for your splendid self!</div>
          </div>
          {this.state.gameMode === GameMode.Admin &&
            <div className="component">
              <input type="checkbox" id="adminIsPlayer" defaultChecked={this.state.participant.attributes.isPlayer} onChange={this.toggleIsPlayer} />
              <label htmlFor="adminIsPlayer">I also wish to play!</label>
              <br />
              <div className="note">Deselect to have a Game Admin role only</div>
            </div>
          }
          {this.state.gameMode === GameMode.Admin &&
            <div className="component">
              <input type="checkbox" id="playersHaveBiography" defaultChecked={this.state.game.attributes.participantsHaveBiographies} onChange={this.toggleParticipantsHaveBiography} />
              <label htmlFor="playersHaveBiography">Player Biographies</label>
              <br />
              <div className="note">Players can write a short biography about themselves (will be included as part of final result)</div>
            </div>
          }
          <div className="component buttons">
            <button className="navigation" onClick={() => this.changeGamePage(this.state.gameMode === GameMode.Admin ? GamePage.GameCharacterLimit : GamePage.GameJoinIntro)}>Back</button>
            <button className="navigation" disabled={!this.state.participant.attributes.name.trim()} onClick={() => this.changeGamePage(this.state.game.attributes.participantsHaveBiographies ? GamePage.PlayerBiography : GamePage.PlayerPassword)}>Next</button>
          </div>
        </div>;
      } else if (this.state.gamePage === GamePage.PlayerBiography) {
        component = <div key={`${Section.Game}-${GamePage.PlayerBiography}`}>
          <div className="component">
            <label htmlFor="biography">Your Biography</label>
            <br />
            <textarea id="biography" value={this.state.participant.attributes.biography} placeholder="Who are you all about?" rows={4} cols={40} maxLength={4000} onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => this.changeParticipantBiography(event.target.value)} />
            <br />
            <div className="note">A little bit about yourself for other people to see (optional).</div>
          </div>
          <div className="component buttons">
            <button className="navigation" onClick={() => this.changeGamePage(GamePage.PlayerName)}>Back</button>
            <button className="navigation" onClick={() => this.changeGamePage(GamePage.PlayerPassword)}>Next</button>
          </div>
        </div>;
      } else if (this.state.gamePage === GamePage.PlayerPassword) {
        component = <div key={`${Section.Game}-${GamePage.PlayerBiography}`}>
          <div className="component">
            <label htmlFor="password">Password</label>
            <br />
            <input type="password" id="password" placeholder="What's the word?" defaultValue={this.state.password} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changePlayerPassword(event.target.value)} />
            <br />
            <label htmlFor="confirmPassword">Confirm Password</label>
            <br />
            <input type="password" id="confirmPassword" className={this.state.password !== this.state.confirmPassword ? "error" : ""} placeholder="What's the word (again)?" defaultValue={this.state.confirmPassword} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changePlayerConfirmPassword(event.target.value)} />
            <br />
            <div className="note">{this.state.gameMode === GameMode.Player && "Optional password. "}Can be used to log in to other devices to continue the game, or to log again if your session times out.</div>
            <br />
            <div className="note">(Please note that passwords cannot be recovered!)</div>
          </div>
          <div className="component buttons">
            <button className="navigation" disabled={this.state.fetchingData} onClick={() => this.changeGamePage(this.state.game.attributes.participantsHaveBiographies ? GamePage.PlayerBiography : GamePage.PlayerName)}>Back</button>
            {this.state.gameMode === GameMode.Admin &&
              <button className="navigation" disabled={!this.state.password.trim() || (this.state.password.trim() !== this.state.confirmPassword.trim())} onClick={() => this.changeGamePage(GamePage.CreateGame)}>Next</button>
            }
            {this.state.gameMode === GameMode.Player &&
              <button className="action" disabled={this.state.password.trim() !== this.state.confirmPassword.trim() || this.state.fetchingData} onClick={this.joinGame}>Join Game</button>
            }
          </div>
        </div>;
      } else if (this.state.gamePage === GamePage.CreateGame) {
        var description: JSX.Element[] = this.state.game.attributes.description.split("\n").map((content, index) =>
          <div key={`description${index}`} className="information">
            {content}
          </div>
        );

        component = <div key={`${Section.Game}-${GamePage.CreateGame}`}>
          {this.state.game.attributes.description && < div className="component">
            {description}
          </div>}
          <div className="component">
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
            <div className="note">{this.state.game.attributes.playersAreRandomlyOrdered ?
              'Players will be randomly assigned a segment when the game starts' :
              `Players will be assigned segments in the order they ${this.state.game.attributes.addPlayersManually ? "are added" : "join"}.`}</div>
          </div>
          <div className="component buttons">
            <button className="navigation" disabled={this.state.fetchingData} onClick={() => this.changeGamePage(GamePage.PlayerPassword)}>Back</button>
            <button className="action" disabled={this.state.fetchingData} onClick={this.createGame}>Create Game</button>
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
          waitingPlayer.biography.split("\n").map((value: string, index: number) => <div key={`waitingBio${index}`}>
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

        component = <div key={`${Section.Game}-${GamePage.GameReady}`}>
          <div className="component">
            <div className="information">Game is ready, now waiting for people to join!</div>
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
            <div className="note">Players can no longer join once game is started.</div>
          </div>
          <div className="component buttons">
            <button className="action" disabled={this.state.fetchingData || addedPlayers.length < (this.state.game.attributes.canSeeFollowingContent && this.state.game.attributes.canSeePrecedingContent ? 4 : 3)} onClick={this.startGameAdmin}>Start Game</button>
          </div>
        </div>;
      } else if (this.state.gamePage === GamePage.LogInGame) {
        showGameTitle = false;

        component = <div key={`${Section.Game}-${GamePage.LogInGame}`}>
          <div className="component">
            <label htmlFor="gameCode">Game Code</label>
            <br />
            <input type="text" id="gameCode" placeholder="something-something-something" defaultValue={this.state.game.attributes.code} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeGameCode(event.target.value)} />
            <br />
            <div className="note">The code for the game you want to login to</div>
          </div>
          <div className="component buttons">
            <button className="navigation" disabled={this.state.fetchingData} onClick={() => this.changeGamePage(GamePage.Intro)}>Back</button>
            <button className="action" disabled={!this.state.game.attributes.code.trim() || this.state.fetchingData} onClick={() => this.getGameFromCode(() => { this.initialiseDefaultLoginParticipant(); }, () => { })}>Find Game</button>
          </div>
        </div>;
      } else if (this.state.gamePage === GamePage.LogInPlayer) {
        const participant: ParticipantAttributes = this.state.participants.filter(p => p.id === this.state.selectedLoginPlayerId)[0];

        const playerElements: JSX.Element[] = this.state.participants
          .map((value: ParticipantAttributes, index: number) => <div key={`loginPlayer${index}`} className={`box-item${value.id === this.state.selectedLoginPlayerId ? " selected" : ""}`} onClick={() => this.changeLoginParticipant(value.id)}>
            {value.name}
          </div>
          );

        const playerBiography: JSX.Element[] = participant.biography ? participant.biography.split("\n")
          .map((value: string, index: number) => <div key={`playerBio${index}`}>
            {value}
          </div>
          ) : [];

        component = <div key={`${Section.Game}-${GamePage.LogInPlayer}`}>
          <div className="component box-container">
            <div className="box-header">
              Players
            </div>
            <div className="box-view">
              {playerElements}
            </div>
            {this.state.game.attributes.participantsHaveBiographies && <div className="box-footer">

              {playerBiography}

            </div>}
          </div>
          <div className="component buttons">
            <button className="navigation" onClick={() => this.cancelJoinGame()}>Back</button>
            <button className="action" onClick={() => this.changeGamePage(GamePage.LogInPassword)}>Yes that's me!</button>
          </div>
        </div>;
      } else if (this.state.gamePage === GamePage.WaitingForStart) {
        component = <div key={`${Section.Game}-${GamePage.WaitingForStart}`}>
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
        component = <div key={`${Section.Game}-${GamePage.LogInPassword}`}>
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

        component = <div key={`${Section.Game}-${GamePage.BearerFound}`}>
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

          const playerAttributes: JSX.Element[] = this.addedPlayers().map((attributes: ParticipantAttributes, playerIndex: number) => {
            const biography: JSX.Element[] = attributes.biography ? attributes.biography.split("\n").map((biographyLine: string, biographyIndex: number) =>
              <div key={`attributes${playerIndex}biography${biographyIndex}`} className="information">
                {biographyLine}
              </div>
            ) : [];

            return <div key={`attributes${playerIndex}`}>
              <div className="text">Player {playerIndex + 1}: {attributes.name}</div>
              {attributes.biography && biography}
              {attributes.biography && <br />}
              <br />
            </div>
          });

          const admin = this.state.participants.filter(p => p.isAdmin)[0];

          if (admin && !admin.isPlayer) {
            const adminBio: JSX.Element[] = admin.biography ? admin.biography.split("\n").map((biographyLine: string, biographyIndex: number) =>
              <div key={`attributes${playerIndex}biography${biographyIndex}`} className="information">
                {biographyLine}
              </div>
            ) : [];

            playerAttributes.push(<div key="attributesAdmin">
              <div className="text">Admin: {admin.name}</div>
              {adminBio}
              <br />
              <br />
            </div>);
          }

          component = <div key={`${GamePage.Entry}-${EntryView.Details}`}>
            <div className="component">
              <div className="subtitle">Details</div>
            </div>
            <div className="component">
              {description}
            </div>
            <div className="component">
              <div className="note">
                Code: {this.state.game.attributes.code}
              </div>
            </div>
            <div className="component">
              <div className="subtitle">Players</div>
            </div>
            <div className="component">
              {playerAttributes}
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
          const prompt: JSX.Element[] = this.state.game.attributes.description.split("\n")
            .map((content, index) =>
              <div key={`prompt${index}`} className="text">
                {content}
              </div>
            );

          component = <div key={`${GamePage.Entry}-${EntryView.Player}`}>
            {this.state.participant.state.contentVersion === 0 && <div className="component">
              {prompt}
              {this.state.game.attributes.description && <br />}
              <div className="note">You are writing segment {this.state.participant.attributes.contentIndex} of {this.addedPlayers().length}! Write something that you think might work as the {this.getNumberth(this.state.participant.attributes.contentIndex)} segment of this story/poem/thing.</div>
            </div>}
            <div className="component">
              <textarea value={this.state.participant.state.content} placeholder="It was a dark and stormy night..." rows={4} cols={40} maxLength={Number(this.state.game.attributes.characterLimit)} disabled={this.state.game.state.isEnded || this.state.participant.state.isEnded} onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => this.changePlayerContent(event.target.value)} />
              <br />
              <div className="note">(Version {this.state.participant.state.contentVersion}, character count {this.state.participant.state.content.trim().length}/{this.state.game.attributes.characterLimit})</div>
            </div>
            <div className="component buttons">
              <button className="action" disabled={this.state.game.state.isEnded || !this.state.participant.state.content.trim() || this.state.participant.state.content.trim() === this.state.contentOld || this.state.game.state.isEnding || this.state.game.state.isEnded || this.state.participant.state.isEnded} onClick={() => this.updateContent()}>Share {this.state.participant.state.contentVersion === 0 ? "First" : "New"} Update</button>
            </div>
            {this.state.game.state.isEnding && !this.state.game.state.isEnded && <div className="component">
              <div className="emphasis">Game is ending! Can only share one more update.</div>
            </div>}
            {this.state.game.state.isEnded && <div className="component">
              <div className="emphasis">Game is ended!</div>
            </div>}
          </div>;
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
        }
      } else if (this.state.gamePage === GamePage.WaitingForEnd) {
        component = <div key={`${Section.Game}-${GamePage.WaitingForEnd}`}>
          <div className="component">
            <div className="information">Waiting for game to end!</div>
          </div>
          <div className="component buttons">
            <button className="action" disabled={!this.state.game.state.isEnded || this.state.fetchingData} onClick={this.getFinalContents}>Ready</button>
          </div>
        </div>;
      } else if (this.state.gamePage === GamePage.Details) {
        var description: JSX.Element[] = this.state.game.attributes.description.split("\n").map((content, index) =>
          <div key={`finalDescription${index}`} className="information">
            {content}
          </div>
        );

        component = <div key={`${Section.Game}-${GamePage.Details}`}>
          {this.state.game.attributes.description && <div className="component">
            {description}
          </div>}
          <div className="component">
            <div className="note">
              Code: {this.state.game.attributes.code}
            </div>
          </div>
        </div>;
      } else if (this.state.gamePage === GamePage.Final) {
        if (this.state.finalView === FinalView.Details) {
          var description: JSX.Element[] = this.state.game.attributes.description.split("\n").map((content, index) =>
            <div key={`finalDescription${index}`} className="information">
              {content}
            </div>
          );

          component = <div key={`${GamePage.Final}-${FinalView.Details}`}>
            {this.state.game.attributes.description && <div className="component">
              {description}
            </div>}
            <div className="component">
              <div className="note">
                Code: {this.state.game.attributes.code}
              </div>
            </div>
          </div>;
        } else if (this.state.finalView === FinalView.Contents) {
          const playerContents: JSX.Element[] = this.state.finalContents.map((content, outerIndex) => {
            const contents = content.split("\n").map((content, innerIndex) =>
              <div key={`finalFollowingContent${innerIndex}`} className="information">
                {content}
              </div>
            );

            return <div key={`finalContent${outerIndex}`} className="component">
              {contents}
              {outerIndex < this.state.finalContents.length - 1 && <hr />}
            </div>
          });

          component = <div key={`${GamePage.Final}-${FinalView.Contents}`}>
            {playerContents}
          </div>;
        } else if (this.state.finalView === FinalView.Players) {
          const playerAttributes: JSX.Element[] = this.addedPlayers().map((attributes: ParticipantAttributes, playerIndex: number) => {
            const biography: JSX.Element[] = attributes.biography ? attributes.biography.split("\n").map((biographyLine: string, biographyIndex: number) =>
              <div key={`attributes${playerIndex}biography${biographyIndex}`} className="information">
                {biographyLine}
              </div>
            ) : [];

            return <div key={`attributes${playerIndex}`}>
              <div className="text">Player {playerIndex + 1}: {attributes.name}</div>
              {attributes.biography && biography}
              {attributes.biography && <br />}
              <br />
            </div>
          });

          const admin = this.state.participants.filter(p => p.isAdmin)[0];

          if (admin && !admin.isPlayer) {
            const adminBio: JSX.Element[] = admin.biography ? admin.biography.split("\n").map((biographyLine: string, biographyIndex: number) =>
              <div key={`attributes${playerIndex}biography${biographyIndex}`} className="information">
                {biographyLine}
              </div>
            ) : [];

            playerAttributes.push(<div key="attributesAdmin">
              <div className="text">Admin: {admin.name}</div>
              {adminBio}
              <br />
              <br />
            </div>);
          }

          component = <div key={`${GamePage.Final}-${FinalView.Players}`} className="component">
            {playerAttributes}
          </div>;
        }
      } else if (this.state.gamePage === GamePage.NotAdded) {
        component = <div key={`${Section.Game}-${GamePage.NotAdded}`}>
          <div className="component">
            <div className="information">
              Oh no! You have not been included in this game :(
            </div>
            <div className="information">
              But you could always start your own!
            </div>
          </div>
          <div className="component buttons">
            <button className="action" onClick={this.confirmReset}>Exit</button>
          </div>
        </div>;
      }
    } else if (this.state.section === Section.Admin) {
      if (this.state.adminPage === AdminPage.Main) {
        const playerSummaries: JSX.Element[] = this.state.playerSummaries.sort((a: PlayerSummary, b: PlayerSummary) => a.contentIndex < b.contentIndex ? -1 : 1)
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

        component = <div key={`${Section.Admin}-${AdminPage.Main}`}>
          {!this.state.game.state.isEnded && (this.state.playerSummaries.length > 0 ? playerSummariesTable :
            <div className="component">
              <div className="emphasis">Retrieving player information...</div>
            </div>
          )}
          {!this.state.game.state.isEnding && !this.state.game.state.isEnded && <div className="component buttons">
            <button className="action" onClick={() => this.changeAdminPage(AdminPage.ConfirmBeginEnding)}>Begin Ending Game</button>
          </div>}
          {!this.state.game.state.isEnded && <div className="component buttons">
            <button className="action" disabled={this.state.playerSummaries.filter(s => s.contentVersion === 0).length > 0} onClick={() => this.changeAdminPage(AdminPage.ConfirmEnd)}>End Game</button>
          </div>}
          {this.state.game.state.isShared && <div>
            <div className="component">
              <div className="information">Game is shared publicly!</div>
            </div>
            <div className="component">
              <div className="information">Code for game is</div>
              <br />
              <div className="information"><code>{this.state.game.attributes.code}</code></div>
            </div>
            <div className="component">
              <div className="information">Or share this URL:</div>
              <br />
              <div className="information"><code>{window.location.origin}/paper-follies?view-game={this.state.game.attributes.code}</code></div>
            </div>

          </div>}
          {this.state.game.state.isEnded && <div className="component buttons">
            <button className="action" onClick={() => this.changeFinalView(FinalView.Contents)}>View The Results</button>
          </div>}
          {this.state.game.state.isEnded && !this.state.game.state.isShared && <div className="component buttons">
            <button className="action" onClick={() => this.changeAdminPage(AdminPage.ConfirmShare)}>Share Game</button>
          </div>}
          <div className="component buttons">
            <button className="action" onClick={this.downloadBackup}>Download Backup</button>
          </div>
        </div>;
      } else if (this.state.adminPage === AdminPage.ConfirmBeginEnding) {
        component = <div key={`${Section.Admin}-${AdminPage.ConfirmBeginEnding}`}>
          <div className="component">
            <div className="information">Once the game ending has begun, players will only be able to update their segment once more.</div>
          </div>
          <div className="component buttons">
            <button className="action" onClick={() => this.changeAdminPage(AdminPage.Main)}>Cancel</button>
            <button className="action" disabled={this.state.fetchingData || this.state.game.state.isEnding} onClick={this.beginEndingGame}>Confirm Begin Ending</button>
          </div>
        </div>;
      } else if (this.state.adminPage === AdminPage.ConfirmEnd) {
        component = <div key={`${Section.Admin}-${AdminPage.ConfirmEnd}`}>
          <div className="component">
            <div className="information">End the game! Segments can no longer be updated and the final result will be revealed.</div>
          </div>
          <div className="component buttons">
            <button className="action" onClick={() => this.changeAdminPage(AdminPage.Main)}>Cancel</button>
            <button className="action" disabled={this.state.fetchingData || this.state.playerSummaries.filter(s => s.contentVersion === 0).length > 0} onClick={this.endGame}>Confirm End</button>
          </div>
        </div>;
      } else if (this.state.adminPage === AdminPage.ConfirmShare) {
        component = <div key={`${Section.Admin}-${AdminPage.ConfirmShare}`}>
          <div className="component">
            <div className="information">Share the game! People will be able to view the result by entering the game code.</div>
          </div>
          <div className="component buttons">
            <button className="action" onClick={() => this.changeAdminPage(AdminPage.Main)}>Cancel</button>
            <button className="action" disabled={this.state.fetchingData || !this.state.game.state.isEnded} onClick={this.shareGame}>Share The Game</button>
          </div>
        </div>;
      }
    } else if (this.state.section === Section.About) {
      showGameTitle = this.state.isLoggedIn;

      component = <div key={Section.About}>
        <div className="component">
          <div className="information">Paper Follies is free to play! Unfortunately this means there isn't any Game Support, so please keep track of your game codes and passwords, especially since the game doesn't record identifying information (emails or whatever).</div>
        </div>
        <div className="component">
          <div className="information">The game is intended as light entertainment, but it will store content you have created so there should probably be some kind of legal information:</div>
        </div>
        <div className="component">
          <div className="information">All content you create on this website belongs to you, the users.</div>
        </div>
        <div className="component">
          <div className="emphasis">(If you have any idea how to write that in a more legal-sounding way, or can think of other things I should legal stuff I should add, then get in touch!)</div>
        </div>
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
          <button className="left" disabled={this.state.section === Section.Game} onClick={() => this.changeSection(Section.Game)}>Game</button>
          {this.state.game.state.isStarted && this.state.participant.attributes.isAdmin && <button className="left" disabled={this.state.section === Section.Admin} onClick={() => this.changeSection(Section.Admin)}>Admin</button>}
          <button className="left" disabled={this.state.section === Section.About} onClick={() => this.changeSection(Section.About)}>About</button>
          {this.state.participant.attributes.id > 0 && <button className="right" disabled={this.state.section === Section.ConfirmReset} onClick={() => this.changeSection(Section.ConfirmReset)}>Exit</button>}
          {this.state.gameMode === GameMode.Reader && this.state.gamePage !== GamePage.GameCode && <button className="right" onClick={this.confirmReset}>Close</button>}
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
          this.state.shownInfos["info1"] &&
          <div className="component help-container">
            <div className="help-message">Click 'Details' to show the game details!</div>
            <div className="help-message">When an adjacent player updates their segment, their button will change colour.</div>
            <div className="help-message">You can continue editing and updating your segment while waiting for other people.</div>
            <div className="help-close" onClick={() => this.closeHelp("info1")}>X</div>
          </div>}
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
        {this.state.isLoggedIn &&
          this.state.section === Section.Game &&
          this.state.gamePage === GamePage.Entry &&
          this.state.game.state.isEnded &&
          <div className="component buttons">
            <button className="action" onClick={this.getFinalContents}>
              See results!
            </button>
          </div>}
      </div>
    );
  }
}
