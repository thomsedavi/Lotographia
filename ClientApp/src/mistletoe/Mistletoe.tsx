import * as React from "react";
import { CreateGameRequest, CreatePlayerRequest, LoginRequest } from "./MistletoeRequests";
import { GetGameFromCodeResponse, PostGameResponse, ParticipantResponse, ParticipantsResponse, ErrorResponse, MistletoeParticipantTokenResponse } from "./MistletoeResponses";
import { GameMode, GameType, Page } from "./MistletoeEnums";

export interface Participant {
  name: string,
  biography?: string,
  id: number,
  isAdmin: boolean,
  isApproved: boolean
}

interface MistletoeState {
  gameMode?: GameMode,
  page: Page,
  gameTitle?: string,
  participantId?: number,
  participantName?: string,
  participantsHaveBiographies: boolean,
  participantBiography?: string,
  password?: string,
  confirmPassword?: string,
  gameDescription?: string,
  gameType: string,
  gameCharacterLimit: string,
  gameCode?: string,
  gameIsStarted: boolean,
  gameIsEnding: boolean,
  gameIsEnded: boolean,
  errorMessage?: string,
  isAdmin: boolean,
  adminIsPlayer: boolean,
  playersRequireApproval: boolean,
  playerIsApproved: boolean,
  gameId?: number,
  fetchingData: boolean,
  fetchingPlayerDetails: boolean,
  pollingData: boolean,
  confirmReset: boolean,
  participants: Participant[],
  tempParticipants: Participant[],
  selectedApprovedPlayerId?: number,
  selectedUnapprovedPlayerId?: number,
  randomlyOrderPlayers: boolean
}

export class Mistletoe extends React.Component<any, MistletoeState> {
  constructor(props: any) {
    super(props);

    this.state = {
      fetchingData: false,
      fetchingPlayerDetails: false,
      pollingData: false,
      page: localStorage.getItem('bearerMistletoe') ? Page.BearerFound : Page.Intro,
      isAdmin: false,
      adminIsPlayer: true,
      participantsHaveBiographies: false,
      gameType: GameType.Both,
      gameIsStarted: false,
      gameIsEnding: false,
      gameIsEnded: false,
      gameCharacterLimit: "500",
      playersRequireApproval: false,
      playerIsApproved: false,
      confirmReset: false,
      randomlyOrderPlayers: true,
      participants: [],
      tempParticipants: []
    };
  }

  componentDidMount = () => {
    const searchParams = new URLSearchParams(window.location.search);

    if (this.state.page == Page.BearerFound) {
      fetch("api/mistletoe/participant", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `bearer ${localStorage.getItem('bearerMistletoe')}`
        }
      })
        .then((response: Response) => {
          if (response.status === 302) {
            response.json()
              .then((data: ParticipantResponse) => {
                let page;

                if (data.isAdmin && !data.gameIsStarted) {
                  page = Page.GameReady
                } else if (!data.isAdmin && data.playersRequireApproval && !data.isApprovedPlayer) {
                  page = Page.WaitingRoom
                } else {
                  page = Page.ToDo
                }

                const gameType = data.canSeePreviousContent ?
                  (data.canSeeNextContent ? GameType.Both : GameType.Previous) :
                  GameType.Next;

                const players = data.participants.filter(p => data.adminIsPlayer || !p.isAdmin).sort((a: Participant, b: Participant) => a.id < b.id ? -1 : 1);

                let selectedApprovedPlayerId: number | undefined = undefined;
                let selectedUnapprovedPlayerId: number | undefined = undefined;

                const approvedPlayers = players.filter(p => p.isApproved);

                if (!selectedApprovedPlayerId && approvedPlayers.length > 0) {
                  selectedApprovedPlayerId = approvedPlayers[0].id;
                }

                const unapprovedPlayers = players.filter(p => !p.isApproved);

                if (!selectedUnapprovedPlayerId && unapprovedPlayers.length > 0) {
                  selectedUnapprovedPlayerId = unapprovedPlayers[0].id;
                }

                this.setState({
                  page: page,
                  gameId: data.gameId,
                  gameCode: data.gameCode,
                  participantId: data.participantId,
                  isAdmin: data.isAdmin,
                  adminIsPlayer: data.adminIsPlayer,
                  gameCharacterLimit: data.gameCharacterLimit,
                  gameType: gameType,
                  gameTitle: data.gameTitle,
                  gameDescription: data.gameDescription,
                  gameIsStarted: data.gameIsStarted,
                  gameIsEnding: data.gameIsEnding,
                  gameIsEnded: data.gameIsEnded,
                  playersRequireApproval: data.playersRequireApproval,
                  participantsHaveBiographies: data.participantsHaveBiographies,
                  playerIsApproved: data.isApprovedPlayer,
                  participantName: data.participantName,
                  participantBiography: data.participantBiography,
                  participants: data.participants,
                  tempParticipants: data.participants,
                  selectedApprovedPlayerId: selectedApprovedPlayerId,
                  selectedUnapprovedPlayerId: selectedUnapprovedPlayerId
                });
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
    } else if (searchParams.get("gamecode")) {
      this.setState({
        gameCode: searchParams.get("gamecode")!,
        gameMode: GameMode.Player,
        page: Page.GameCode
      });
    }

    setInterval(() => {
      if (!this.state.pollingData) {
        if (this.state.isAdmin && !this.state.gameIsStarted) {
          this.setState({
            pollingData: true
          });

          this.getPlayerDetails(() => {
            // TODO this is all used elsewhere
            const players = this.state.participants.filter(p => this.state.adminIsPlayer || !p.isAdmin).sort((a: Participant, b: Participant) => a.id < b.id ? -1 : 1);

            let selectedApprovedPlayerId = this.state.selectedApprovedPlayerId;
            let selectedUnapprovedPlayerId = this.state.selectedUnapprovedPlayerId;

            const approvedPlayers = players.filter(p => p.isApproved);

            if (!selectedApprovedPlayerId && approvedPlayers.length > 0) {
              selectedApprovedPlayerId = approvedPlayers[0].id;
            }

            const unapprovedPlayers = players.filter(p => !p.isApproved);

            if (!selectedUnapprovedPlayerId && unapprovedPlayers.length > 0) {
              selectedUnapprovedPlayerId = unapprovedPlayers[0].id;
            }

            this.setState({
              selectedUnapprovedPlayerId: selectedUnapprovedPlayerId,
              selectedApprovedPlayerId: selectedApprovedPlayerId,
              pollingData: false
            });
          });
        }
      }
    }, 3000);
  }

  changeGameAction = (page: Page, gameMode: GameMode | undefined) => {
    this.setState({
      errorMessage: undefined,
      gameMode: gameMode,
      page: page
    });
  }

  initialiseDefaultLoginParticipant = () => {
    this.changeParticipantId(this.state.participants[0].id.toString());

    this.setState({
      page: Page.LogInPlayer
    });
  }

  changeParticipantId = (participantId: string) => {
    const participant = this.state.participants.filter(p => p.id === Number(participantId))[0];

    if (participant !== undefined) {
      this.setState({
        participantId: participant.id,
        participantName: participant.name,
        participantBiography: participant.biography,
        isAdmin: participant.isAdmin,
        playerIsApproved: participant.isApproved
      });
    }
  }

  changeSelectedApprovedPlayerId = (selectedApprovedPlayerId: string) => {
    this.setState({
      selectedApprovedPlayerId: Number(selectedApprovedPlayerId)
    });
  }

  changeSelectedUnapprovedPlayerId = (selectedUnapprovedPlayerId: string) => {
    this.setState({
      selectedUnapprovedPlayerId: Number(selectedUnapprovedPlayerId)
    });
  }

  approvePlayer = () => {
    if (!this.state.fetchingData) {
      this.setState({
        fetchingData: true
      });

      fetch(`api/mistletoe/participant/${this.state.selectedUnapprovedPlayerId}/approve`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `bearer ${localStorage.getItem('bearerMistletoe')}`
        }
      })
        .then((response: Response) => {
          this.setState({
            fetchingData: false
          });

          if (response.status === 200) {
            const participants = this.state.participants!;

            for (var x = 0; x < participants.length; x++) {
              const participant = this.state.participants[x];

              if (participant.id === this.state.selectedUnapprovedPlayerId) {
                participants[x].isApproved = true;
              }
            }

            this.setState({
              participants: participants
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

  changePage = (page: Page) => {
    this.setState({
      errorMessage: undefined,
      page: page
    });
  }

  changeGameTitle = (gameTitle: string) => {
    this.setState({
      gameTitle: gameTitle
    });
  }

  changeGameCharacterLimit = (gameCharacterLimit: string) => {
    this.setState({
      gameCharacterLimit: gameCharacterLimit
    });
  }

  changePassword = (password: string) => {
    this.setState({
      password: password
    });
  }

  changeDescription = (gameDescription: string) => {
    this.setState({
      gameDescription: gameDescription
    });
  }

  startGame = () => {
    if (!this.state.fetchingData) {
      this.setState({
        fetchingData: true
      });

      fetch(`api/mistletoe/game/start`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `bearer ${localStorage.getItem('bearerMistletoe')}`
        }
      })
        .then((response: Response) => {
          this.setState({
            fetchingData: false
          });

          if (response.status === 200) {
            this.setState({
              page: Page.ToDo
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

  changeParticipantBiography = (participantBiography: string) => {
    this.setState({
      participantBiography: participantBiography
    });
  }

  toggleAdminIsPlayer = () => {
    this.setState(prevState => ({
      adminIsPlayer: !prevState.adminIsPlayer
    }));
  }

  toggleParticipantsHaveBiography = () => {
    this.setState(prevState => ({
      participantsHaveBiographies: !prevState.participantsHaveBiographies
    }));
  }

  toggleRandomlyOrderPlayers = () => {
    this.setState(prevState => ({
      randomlyOrderPlayers: !prevState.randomlyOrderPlayers
    }));
  }

  changeParticipantName = (participantName: string) => {
    this.setState({
      participantName: participantName
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

  togglePlayersRequireApproval = () => {
    this.setState(prevState => ({
      playersRequireApproval: !prevState.playersRequireApproval
    }));
  }

  changeGameCode = (gameCode: string) => {
    this.setState({
      gameCode: gameCode
    });
  }

  changeGameType = (gameType: string) => {
    this.setState({
      gameType: gameType
    });
  }

  createGame = () => {
    if (!this.state.fetchingData) {
      this.setState({
        fetchingData: true
      });

      const body: CreateGameRequest = {
        gameTitle: this.state.gameTitle,
        adminIsPlayer: this.state.adminIsPlayer,
        participantName: this.state.participantName.trim(),
        participantPassword: this.state.password.trim(),
        participantConfirmPassword: this.state.confirmPassword.trim(),
        participantsHaveBiographies: this.state.participantsHaveBiographies,
        participantBiography: this.state.participantBiography.trim(),
        playersRequireApproval: this.state.playersRequireApproval,
        gameDescription: this.state.gameDescription.trim(),
        gameCharacterLimit: Number(this.state.gameCharacterLimit),
        canSeePreviousContent: this.state.gameType !== GameType.Next,
        canSeeNextContent: this.state.gameType !== GameType.Previous,
        randomlyOrderPlayers: this.state.randomlyOrderPlayers
      };

      fetch("api/mistletoe/game", {
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

          if (response.status === 201) {
            response.json()
              .then((data: PostGameResponse) => {
                localStorage.setItem('bearerMistletoe', data.participantToken);

                const participants: Participant[] = [];

                participants.push({
                  isAdmin: true,
                  biography: this.state.participantBiography.trim(),
                  name: this.state.participantName.trim(),
                  id: data.participantId,
                  isApproved: this.state.adminIsPlayer
                });

                this.setState({
                  page: Page.GameReady,
                  gameId: data.gameId,
                  gameCode: data.gameCode,
                  participants: participants,
                  tempParticipants: participants,
                  isAdmin: true,
                  selectedApprovedPlayerId: this.state.adminIsPlayer ? data.participantId : undefined
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

  logIn = () => {
    if (!this.state.fetchingData) {
      const body: LoginRequest = {
        participantId: this.state.participantId,
        participantPassword: this.state.password
      }

      if (this.state.password) {
        this.setState({
          fetchingData: true
        });

        fetch(`api/mistletoe/login`, {
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
                .then((data: MistletoeParticipantTokenResponse) => {
                  localStorage.setItem('bearerMistletoe', data.playerToken);

                  this.setState({
                    page: Page.ToDo
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
      } else {
        this.setState({
          errorMessage: "no password :("
        });
      }
    }
  }

  getPlayerDetails = (callback: () => void) => {
    if (!this.state.fetchingPlayerDetails) {
      if (this.state.gameId) {
        this.setState({
          fetchingPlayerDetails: true
        });

        fetch(`api/mistletoe/game/${this.state.gameId}/participants`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        })
          .then(response => {
            this.setState({
              fetchingPlayerDetails: false
            });

            if (response.status === 302) {
              response.json()
                .then((responseJson: ParticipantsResponse) => {
                  this.setState({
                    tempParticipants: responseJson.participants.sort((a: Participant, b: Participant) => a.name < b.name ? -1 : 1)
                  });

                  callback();
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
          errorMessage: "no game id :("
        });
      }
    }
  }

  getGameFromCode = (callback: () => void) => {
    if (this.state.gameCode === undefined) {
      this.setState({
        errorMessage: "no game code :("
      });

      return;
    }

    this.setState({
      errorMessage: undefined,
      fetchingData: true
    });

    fetch(`api/mistletoe/code/${this.state.gameCode.trim().toLowerCase().split(" ").join("-")}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(response => {
        this.setState({
          fetchingData: false
        });

        if (response.status === 302) {
          response.json()
            .then((data: GetGameFromCodeResponse) => {
              const gameType = data.canSeePreviousContent ?
                (data.canSeeNextContent ? GameType.Both : GameType.Previous) :
                GameType.Next

              this.setState({
                gameTitle: data.title,
                gameId: data.id,
                gameCharacterLimit: data.characterLimit.toString(),
                gameDescription: data.description,
                gameIsStarted: data.isStarted,
                gameIsEnded: data.isEnded,
                participantsHaveBiographies: data.participantsHaveBiographies,
                playersRequireApproval: data.playersRequireApproval,
                gameType: gameType
              });

              callback();
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

  cancelJoinGame = () => {
    this.setState({
      gameTitle: "",
      gameId: undefined,
      gameCharacterLimit: "500",
      gameDescription: undefined,
      gameIsStarted: false,
      gameIsEnded: false,
      participantsHaveBiographies: false,
      page: Page.GameCode,
      gameType: GameType.Both,
      randomlyOrderPlayers: true
    });
  }

  updateGameReady = () => {
    const participants = this.state.tempParticipants!;

    this.setState({
      participants: participants
    });
  }

  joinGame = () => {
    if (!this.state.fetchingData) {
      this.setState({
        fetchingData: true
      });

      const body: CreatePlayerRequest = {
        gameId: this.state.gameId!,
        gameCode: this.state.gameCode!.trim().toLowerCase().split(" ").join("-"),
        playerName: this.state.participantName,
        playerPassword: this.state.password,
        playerConfirmPassword: this.state.confirmPassword,
        playerBiography: this.state.participantBiography
      };

      fetch("api/mistletoe/player", {
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

          if (response.status === 201) {
            response.json()
              .then((data: MistletoeParticipantTokenResponse) => {
                localStorage.setItem('bearerMistletoe', data.playerToken);

                this.setState({
                  page: Page.ToDo
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

  resetGame = () => {
    this.setState({
      errorMessage: undefined,
      confirmReset: true
    })
  }

  confirmReset = () => {
    localStorage.removeItem('bearerMistletoe');

    this.setState({
      fetchingData: false,
      password: undefined,
      confirmPassword: undefined,
      page: Page.Intro,
      gameTitle: undefined,
      gameCode: undefined,
      gameId: undefined,
      gameDescription: undefined,
      isAdmin: false,
      adminIsPlayer: true,
      participantName: undefined,
      participantId: undefined,
      participantsHaveBiographies: false,
      gameType: GameType.Both,
      gameIsStarted: false,
      gameIsEnding: false,
      gameIsEnded: false,
      gameCharacterLimit: "500",
      playersRequireApproval: false,
      playerIsApproved: false,
      confirmReset: false,
      participantBiography: undefined,
      gameMode: undefined,
      randomlyOrderPlayers: true,
      participants: [],
      tempParticipants: [],
      selectedApprovedPlayerId: undefined,
      selectedUnapprovedPlayerId: undefined
    });
  }

  cancelReset = () => {
    this.setState({
      confirmReset: false
    })
  }

  render() {
    let components: JSX.Element;
    let showGameTitle: boolean = true;

    if (this.state.confirmReset) {
      components = <div key="confirmReset">
        <div className="component">
          <div className="information">Are you sure you want to leave this game?</div>
          <br />
          <div className="information">(If you didn't give a password, you won't be able to log in again!)</div>
        </div>
        <div className="component buttons">
          <button className="action" onClick={this.confirmReset}>Yeah</button>
          <button className="action" onClick={this.cancelReset}>Nah</button>
        </div>
      </div>;
    } else if (this.state.page === Page.Intro) {
      showGameTitle = false;

      components = <div key={Page.Intro}>
        <div className="component">
          <div className="information">Welcome to Mistletoe! A dynamic variant of Exquisite Corpse.</div>
        </div>
        <div className="component">
          <div className="information">This is a creative writing game where each player is assigned one of a list of segments to write in. They can only see the segments before and/or after their own - everything else is invisible to them.</div>
        </div>
        <div className="component">
          <div className="information">But! Unlike in Exquisite Corpse, each player can see when one of their neighbours has made a modification to <i>their</i> text!</div>
        </div>
        <div className="component buttons">
          <button className="action" onClick={() => this.changeGameAction(Page.GameTitle, GameMode.Admin)}>Start a New Game</button>
        </div>
        <div className="component">
          <div className="text">or</div>
        </div>
        <div className="component buttons">
          <button className="action" onClick={() => this.changeGameAction(Page.GameCode, GameMode.Player)}>Join an existing Game</button>
        </div>
        <div className="component">
          <div className="text">or</div>
        </div>
        <div className="component buttons">
          <button className="action" onClick={() => this.changePage(Page.LogInGame)}>Log In</button>
        </div>
        <div className="component">
          <div className="note">(Disclaimer: Please be aware that I, the sole developer responsible for developing and maintaining this game and its associated database, might accidentally break everything at any time and with no warning. There is no time limit to a game but you are advised to play marathons at your own risk...)</div>
        </div>
      </div>;
    } else if (this.state.page === Page.GameTitle) {
      showGameTitle = false;

      components = <div key={Page.GameTitle}>
        <div className="component">
          <label htmlFor="gameTitle">Game Title</label>
          <br />
          <input type="text" id="gameTitle" placeholder="What is it?" maxLength={255} defaultValue={this.state.gameTitle} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeGameTitle(event.target.value)} />
          <br />
          <div className="note">A name for your splendid creation!</div>
        </div>
        <div className="component buttons">
          <button className="navigation" onClick={() => this.changeGameAction(Page.Intro, undefined)}>Back</button>
          <button className="navigation" disabled={!this.state.gameTitle} onClick={() => this.changePage(Page.GameDescription)}>Next</button>
        </div>
      </div>;
    } else if (this.state.page === Page.GameDescription) {
      components = <div key={Page.GameDescription}>
        <div className="component">
          <label htmlFor="description">Description</label>
          <br />
          <textarea id="description" value={this.state.gameDescription} placeholder="What is it all about?" rows={2} cols={32} maxLength={4000} onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => this.changeDescription(event.target.value)} />
          <br />
          <div className="note">A prompt for players to start from, for example "The Adventures of Sally Buccaneer, 1930s Astronaut, and her pet Martian Poodle, Written in the First Person". Be as specific or vague as you wish.</div>
          <br />
          <div className="note">Leave blank for 'Hard Mode'.</div>
        </div>
        <div className="component buttons">
          <button className="navigation" onClick={() => this.changePage(Page.GameTitle)}>Back</button>
          <button className="navigation" onClick={() => this.changePage(Page.GameType)}>Next</button>
        </div>
      </div>;
    } else if (this.state.page === Page.GameType) {
      components = <div key={Page.GameType}>
        <div className="component">
          <label id="gameType">Game Type</label>
          <br />
          <select id="gameType" onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.changeGameType(event.currentTarget.value)}
            value={this.state.gameType}>
            <option value={GameType.Both}>Players can see both previous and next segments</option>
            <option value={GameType.Previous}>Players can only see previous segment</option>
            <option value={GameType.Next}>Players can only see next segment</option>
          </select>
          <br />
          <div className="note">If a player is first in the list and does not have a 'previous' segment to see, they will see the last segment instead. Vice versa for the last player in the list.</div>
          <br />
          <div className="note">Everyone can see how many players there are in total, and which player they are in the list</div>
        </div>
        <div className="component buttons">
          <button className="navigation" onClick={() => this.changePage(Page.GameDescription)}>Back</button>
          <button className="action" onClick={() => this.changePage(Page.GameCharacterLimit)}>Next</button>
        </div>
      </div>;
    } else if (this.state.page === Page.GameCharacterLimit) {
      const characterLimit = Number(this.state.gameCharacterLimit);
      const isValidCharacterLimit =
        !isNaN(characterLimit) &&
        characterLimit >= 1 &&
        characterLimit <= 64000;

      components = <div key={Page.GameCharacterLimit}>
        <div className="component">
          <label htmlFor="gameCharacterLimit">Character Limit</label>
          <br />
          <input type="text" id="gameCharacterLimit" placeholder="How many is it?" defaultValue={this.state.gameCharacterLimit} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeGameCharacterLimit(event.target.value)} />
          <br />
          <div className="note">What is the character limit for each player? For reference, a page in a novel might have about 2,000 characters.</div>
          <br />
          <div className="note">(the maximum limit is 64,000 characters per player if you want to go that far, but for a fun quick game it's easier to read and review changes to a segment of 500 characters or less)</div>
        </div>
        <div className="component buttons">
          <button className="navigation" onClick={() => this.changePage(Page.GameType)}>Back</button>
          <button className="navigation" disabled={!isValidCharacterLimit} onClick={() => this.changePage(Page.PlayerName)}>Next</button>
        </div>
      </div>;
    } else if (this.state.page === Page.GameCode) {
      showGameTitle = false;

      components = <div key={Page.GameCode}>
        <div className="component">
          <label htmlFor="gameCode">Game Code</label>
          <br />
          <input type="text" id="gameCode" placeholder="something-something-something" defaultValue={this.state.gameCode} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeGameCode(event.target.value)} />
          <br />
          <div className="note">The code for the game you want to join</div>
        </div>
        <div className="component buttons">
          <button className="action" disabled={!this.state.gameCode || this.state.fetchingData} onClick={() => this.getGameFromCode(() => this.changePage(Page.GameWelcome))}>Find Game</button>
        </div>
        <div className="component buttons">
          <button className="navigation" disabled={this.state.fetchingData} onClick={() => this.changeGameAction(Page.Intro, undefined)}>Back</button>
        </div>
      </div>;
    } else if (this.state.page === Page.GameWelcome) {
      components = <div key={Page.GameWelcome}>
        <div className="component">
          {this.state.gameDescription &&
            <div className="subtitle">{this.state.gameDescription}</div>
          }
          {this.state.gameDescription &&
            <br />
          }
          <div className="emphasis">A story written in segments of no more than {this.state.gameCharacterLimit} characters</div>
          <br />
          {this.state.gameType === GameType.Both ?
            <div className="emphasis">Only able to see immediately adjacent sections</div> :
            <div className="emphasis">Only able to see the {this.state.gameType === GameType.Previous ? "previous" : "following"} section</div>
          }
          <br />
        </div>
        {this.state.gameIsStarted &&
          <div className="component">
            <div className="information">Unfortunately this game is already {this.state.gameIsEnded ? "ended" : "started"}!</div>
          </div>
        }
        <div className="component buttons">
          <button className="action" onClick={this.cancelJoinGame}>Cancel</button>
          {!this.state.gameIsStarted &&
            <button className="action" onClick={() => this.changePage(Page.PlayerName)}>Continue</button>
          }
          {this.state.gameIsEnded &&
            <button className="action" onClick={() => this.changePage(Page.ToDo)}>View game</button>
          }
        </div>
      </div>;
    } else if (this.state.page === Page.PlayerName) {
      components = <div key={Page.PlayerName}>
        <div className="component">
          <label id="playerName">Your Name</label>
          <br />
          <input type="text" id="playerName" placeholder="Who are you?" defaultValue={this.state.participantName} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeParticipantName(event.target.value)} />
          <br />
          <div className="note">A name for your splendid self!</div>
        </div>
        {this.state.gameMode == GameMode.Admin &&
          <div className="component">
            <input type="checkbox" id="adminIsPlayer" defaultChecked={this.state.adminIsPlayer} onChange={this.toggleAdminIsPlayer} />
            <label htmlFor="adminIsPlayer">I also wish to play!</label>
            <br />
            <div className="note">Deselect to have a Game Admin role only</div>
          </div>
        }
        {this.state.gameMode == GameMode.Admin &&
          <div className="component">
            <input type="checkbox" id="playersHaveBiography" defaultChecked={this.state.participantsHaveBiographies} onChange={this.toggleParticipantsHaveBiography} />
            <label htmlFor="playersHaveBiography">Player Biographies</label>
            <br />
            <div className="note">Players can write a short biography about themselves</div>
          </div>
        }
        <div className="component buttons">
          <button className="navigation" onClick={() => this.changePage(this.state.gameMode === GameMode.Admin ? Page.GameCharacterLimit : Page.GameWelcome)}>Back</button>
          <button className="navigation" disabled={!this.state.participantName} onClick={() => this.changePage(this.state.participantsHaveBiographies && (this.state.gameMode == GameMode.Player || this.state.adminIsPlayer) ? Page.PlayerBiography : Page.PlayerPassword)}>Next</button>
        </div>
      </div>;
    } else if (this.state.page === Page.PlayerBiography) {
      components = <div key={Page.PlayerBiography}>
        <div className="component">
          <label htmlFor="biography">Your Biography</label>
          <br />
          <textarea id="biography" value={this.state.participantBiography} placeholder="Who are you all about?" rows={2} cols={32} maxLength={4000} onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => this.changeParticipantBiography(event.target.value)} />
          <br />
          <div className="note">Some notes to be included about yourself in final document (optional).</div>
        </div>
        <div className="component buttons">
          <button className="navigation" onClick={() => this.changePage(Page.PlayerName)}>Back</button>
          <button className="navigation" onClick={() => this.changePage(Page.PlayerPassword)}>Next</button>
        </div>
      </div>;
    } else if (this.state.page === Page.PlayerPassword) {
      components = <div key={Page.PlayerPassword}>
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
          <button className="action" disabled={this.state.password !== this.state.confirmPassword || this.state.fetchingData} onClick={this.joinGame}>Join Game</button>
        </div>
        }
        <div className="component buttons">
          <button className="navigation" disabled={this.state.fetchingData} onClick={() => this.changePage(this.state.participantsHaveBiographies && (this.state.gameMode == GameMode.Player || this.state.adminIsPlayer) ? Page.PlayerBiography : Page.PlayerName)}>Back</button>
          {this.state.gameMode == GameMode.Admin &&
            <button className="navigation" disabled={(this.state.gameMode === GameMode.Admin && this.state.password === "") || (this.state.password !== this.state.confirmPassword)} onClick={() => this.changePage(Page.CreateGame)}>Next</button>
          }
        </div>
      </div>;
    } else if (this.state.page === Page.CreateGame) {
      components = <div key={Page.CreateGame}>
        <div className="component">
          {this.state.gameDescription &&
            <div className="subtitle">{this.state.gameDescription}</div>
          }
          {this.state.gameDescription &&
            <br />
          }
          <div className="emphasis">Written by {this.state.participantName} and friends</div>
          <br />
          <div className="emphasis">In segments of no more than {this.state.gameCharacterLimit} characters</div>
          <br />
          {this.state.gameType === GameType.Both ?
            <div className="emphasis">Only able to see immediately adjacent sections</div> :
            <div className="emphasis">Only able to see the {this.state.gameType === GameType.Previous ? "previous" : "following"} section</div>
          }
        </div>
        <div className="component">
          <input type="checkbox" id="playersRequireApproval" defaultChecked={this.state.playersRequireApproval} onChange={this.togglePlayersRequireApproval} />
          <label htmlFor="playersRequireApproval">Players Require Approval</label>
          <br />
          <div className="note">Players need to be approved before joining game.</div>
        </div>
        <div className="component">
          <input type="checkbox" id="randomlyOrderPlayers" defaultChecked={this.state.randomlyOrderPlayers} onChange={this.toggleRandomlyOrderPlayers} />
          <label htmlFor="randomlyOrderPlayers">Randomly order players</label>
          <br />
          <div className="note">If unselected, players will be assigned segments in the order they joined.</div>
        </div>
        <div className="component buttons">
          <button className="action" disabled={this.state.fetchingData} onClick={this.createGame}>Create Game</button>
        </div>
        <div className="component buttons">
          <button className="navigation" disabled={this.state.fetchingData} onClick={() => this.changePage(Page.PlayerPassword)}>Back</button>
        </div>
      </div>;
    } else if (this.state.page === Page.GameReady) {
      const validPlayers = this.state.participants.filter(p => !p.isAdmin || (p.isAdmin && this.state.adminIsPlayer));

      const unapprovedPlayers: JSX.Element[] = validPlayers.filter(p => !p.isApproved).sort((a: Participant, b: Participant) => a.id < b.id ? -1 : 1)
        .map((option, index) =>
          <option key={`player${index}`} value={option.id}>{option.name}</option>);

      if (unapprovedPlayers.length === 0)
        unapprovedPlayers.push(<option value="" disabled selected>No players...</option>);

      const unapprovedPlayer: Participant = validPlayers.filter(p => p.id === this.state.selectedUnapprovedPlayerId)[0];

      const approvedPlayers: JSX.Element[] = validPlayers.filter(p => p.isApproved).sort((a: Participant, b: Participant) => a.id < b.id ? -1 : 1)
        .map((option, index) =>
          <option key={`player${index}`} value={option.id}>{option.name}</option>);

      if (approvedPlayers.length === 0)
        approvedPlayers.push(<option value="" disabled selected>No players...</option>);

      const approvedPlayer: Participant = validPlayers.filter(p => p.id === this.state.selectedApprovedPlayerId)[0];

      components = <div key={Page.GameReady}>
        <div className="component">
          <div className="information">Game is ready now, waiting for people to join!</div>
        </div>
        <div className="component">
          <div className="information">Code for game is</div>
          <br />
          <div className="information"><code>{this.state.gameCode}</code></div>
        </div>
        <div className="component">
          <div className="information">Or share this URL:</div>
          <br />
          <div className="information"><code>{window.location.origin}/mistletoe?gamecode={this.state.gameCode}</code></div>
        </div>
        <div className="component buttons">
          <button className="action" disabled={this.state.tempParticipants === undefined || this.state.participants.length === this.state.tempParticipants.length} onClick={this.updateGameReady}>Update Player List</button>
        </div>
        {this.state.playersRequireApproval &&
          <div className="component">
            <label htmlFor="biography">Players Waiting For Approval</label>
            <br />
            <select onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.changeSelectedUnapprovedPlayerId(event.currentTarget.value)}
              value={this.state.selectedUnapprovedPlayerId}>
              {unapprovedPlayers}
            </select>
          </div>
        }
        {this.state.playersRequireApproval && this.state.participantsHaveBiographies && unapprovedPlayer && <div className="component">
          <div className="option selected">
            <div className="name">{unapprovedPlayer.name}</div>
            <div className="description">{unapprovedPlayer.biography ? unapprovedPlayer.biography : "(no bio)"}</div>
          </div>
        </div>}
        {this.state.playersRequireApproval &&
          <div className="component buttons">
            <button className="action" disabled={this.state.fetchingData || !this.state.selectedUnapprovedPlayerId} onClick={this.approvePlayer}>ApprovePlayer</button>
          </div>
        }
        <div className="component">
          <label htmlFor="biography">Approved Players</label>
          <br />
          <select onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.changeSelectedApprovedPlayerId(event.currentTarget.value)}
            value={this.state.selectedApprovedPlayerId}>
            {approvedPlayers}
          </select>
        </div>
        {this.state.participantsHaveBiographies && approvedPlayer && <div className="component">
          <div className="option selected">
            <div className="name">{approvedPlayer.name}</div>
            <div className="description">{approvedPlayer.biography ? approvedPlayer.biography : "(no bio)"}</div>
          </div>
        </div>}
        <div className="component">
          <div className="note">(Note: Players can no longer join once game is started!)</div>
        </div>
        <div className="component buttons">
          <button className="action" disabled={approvedPlayers.length < 2} onClick={this.startGame}>Start Game</button>
        </div>
      </div>;
    } else if (this.state.page === Page.LogInGame) {
      showGameTitle = false;

      components = <div key={Page.LogInGame}>
        <div className="component">
          <label htmlFor="gameCode">Game Code</label>
          <br />
          <input type="text" id="gameCode" placeholder="something-something-something" defaultValue={this.state.gameCode} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeGameCode(event.target.value)} />
          <br />
          <div className="note">The code for the game you want to login to</div>
        </div>
        <div className="component buttons">
          <button className="action" disabled={!this.state.gameCode || this.state.fetchingPlayerDetails} onClick={() => this.getGameFromCode(() => this.getPlayerDetails(() => { const participants = this.state.tempParticipants!; this.setState({ participants: participants }); this.initialiseDefaultLoginParticipant(); }))}>Find Game</button>
        </div>
        <div className="component buttons">
          <button className="navigation" disabled={this.state.fetchingData} onClick={() => this.changePage(Page.Intro)}>Back</button>
        </div>
      </div>;
    } else if (this.state.page === Page.LogInPlayer) {
      const players: JSX.Element[] = this.state.participants.sort((a: Participant, b: Participant) => a.name < b.name ? -1 : 1)
        .map((option, index) =>
        <option key={`player${index}`} value={option.id}>{option.name}</option>);

      components = <div key={Page.LogInPlayer}>
        <div className="component">
          <div className="information">List Players Here</div>
        </div>
        <div className="component">
          <select onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.changeParticipantId(event.currentTarget.value)}
            value={this.state.participantId}>
            {players}
          </select>
        </div>
        <div className="component">
          <div className="option selected">
            <div className="name">{this.state.participantName}</div>
            {this.state.participantBiography && <div className="description">{this.state.participantBiography}</div>}
          </div>
        </div>
        <div className="component buttons">
          <button className="action" onClick={() => this.changePage(Page.LogInPassword)}>Yes that's me!</button>
        </div>
      </div>;
    } else if (this.state.page === Page.LogInPassword) {
      components = <div key={Page.LogInPassword}>
        <div className="component">
          <label htmlFor="password">Password</label>
          <br />
          <input type="password" id="password" placeholder="What's the word?" defaultValue={this.state.password} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changePlayerPassword(event.target.value)} />
          <br />
        </div>
        <div className="component buttons">
          <button className="action" disabled={!this.state.password || this.state.fetchingData} onClick={() => this.logIn()}>Log in</button>
        </div>
      </div>;
    } else if (this.state.page === Page.BearerFound) {
      showGameTitle = false;

      components = <div key={Page.BearerFound}>
        <div className="component">
          <div className="information">Retrieving Game...</div>
        </div>
      </div>;
    } else {
      components = <div key={Page.ToDo}>
        <div className="component">
          <div className="information">To Do for page {this.state.page}</div>
        </div>
        <div className="component buttons">
          <button className="navigation" onClick={this.resetGame}>{localStorage.getItem('bearerMistletoe') ? "Exit Game" : "Reset Game"}</button>
        </div>
      </div>;
    }

    return (
      <div>
        {localStorage.getItem('bearerMistletoe') && this.state.participantId &&
          <div className="component header">
            <button className="header" onClick={this.resetGame}>leave game</button>
          </div>
        }
        <div className="component">
          <div className="title">{showGameTitle ? this.state.gameTitle : "Mistletoe"} unapprovedId: {this.state.selectedUnapprovedPlayerId}</div>
        </div>
        {this.state.errorMessage &&
          <div className="component">
            <div className="error-message">{this.state.errorMessage}</div>
          </div>
        }
        {components}
      </div>
    );
  }
}
