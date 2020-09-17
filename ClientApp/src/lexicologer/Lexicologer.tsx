import * as React from "react";
import { StatusLoading, StatusTooLong, StatusGood, StatusRequiredWords } from "../common/Assets";
import { RequiredText } from "../common/Interfaces";
import { getRequiredTextsElement } from "../components/TextComponent";

/* Game */

interface LexicologerNewState {
  title: string,
  details: string,
  characterLimitInput: string,
  requiredWords: string,
  errorMessage?: string,
  fetchingData: boolean,
  gameId?: number
}

interface ErrorData {
  title: string
}

interface SuccessData {
  gameId: number
}

interface RequiredWord {
  primaryWord: string,
  secondaryWords: string[]
}

export class LexicologerNew extends React.Component<any, LexicologerNewState> {
  title: string = "Lexicologer";

  constructor(props: any) {
    super(props);

    this.state = {
      title: "",
      details: "",
      characterLimitInput: "140",
      fetchingData: false,
      requiredWords: ""
    }
  }

  changeTitle = (title: string) => {
    this.setState({
      title: title
    });
  }

  changeDetails = (details: string) => {
    this.setState({
      details: details
    });
  }

  autofill = () => {
    this.setState({
      requiredWords: "Faith\nLove, lovi\nDuty, duti\nHonour, honor"
    });
  }

  changeRequiredWords = (requiredWords: string) => {
    this.setState({
      requiredWords: requiredWords
    });
  }

  changeCharacterLimit = (characterLimitInput: string) => {
    this.setState({
      characterLimitInput: characterLimitInput
    });
  }

  postGame = () => {
    this.setState({
      errorMessage: ""
    });

    let title: string = this.state.title.trim();

    while (title.indexOf("  ") > 0) {
      title = title.replace("  ", " ");
    }

    const details: string[] = this.state.details.split("\n");

    for (var x = 0; x < details.length; x++) {
      let detail: string = details[x].trim();

      while (detail.indexOf("  ") > 0) {
        detail = detail.replace("  ", " ");
      }

      details[x] = detail;
    }

    const words: RequiredWord[] = [];

    const requiredWords: string[] = this.state.requiredWords.split("\n");

    for (let x = 0; x < requiredWords.length; x++) {
      const requiredWord = requiredWords[x].trim();

      if (requiredWord.split(",")[0].trim() !== "") {
        const split = requiredWord.split(",");

        let primaryWord: string = split[0].trim();

        while (primaryWord.indexOf("  ") > 0) {
          primaryWord = primaryWord.replace("  ", " ");
        }

        const rWord: RequiredWord = {
          primaryWord: primaryWord,
          secondaryWords: []
        }

        for (var y = 1; y < split.length; y++) {
          let secondaryWord: string = split[y].trim();

          while (secondaryWord.indexOf("  ") > 0) {
            secondaryWord = secondaryWord.replace("  ", " ");
          }

          if (secondaryWord !== "") {
            rWord.secondaryWords.push(secondaryWord);
          }
        }

        words.push(rWord);
      }
    }

    if (words.length === 0) {
      this.setState({
        errorMessage: "No words!"
      })

      return;
    }

    if (!this.state.fetchingData) {
      this.setState({
        fetchingData: true
      });

      const body = {
        title: title,
        details: details.join("\n"),
        characterLimit: Number(this.state.characterLimitInput),
        words: words
      };

      fetch("api/lexicologer", {
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
              .then((data: SuccessData) => {
                this.setState({
                  gameId: data.gameId
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

  render() {
    const lines: string[] = this.state.requiredWords.split("\n");
    const requiredWords: string[] = [];

    for (let x = 0; x < lines.length; x++) {
      const requiredWord: string = lines[x].split(",")[0].trim();

      if (requiredWord !== "") {
        requiredWords.push(requiredWord);
      }
    }

    const texts: (JSX.Element | string)[] = [`Required word${requiredWords.length === 1 ? "" : "s"}: `];

    if (requiredWords.length >= 1) {
      requiredWords.map((text: string, index: number) => {
        // use classes instead of styles
        texts.push(<div style={{ fontWeight: 700, display: "inline-block", color: "#048" }}>{text}</div>)

        if (requiredWords !== undefined && requiredWords.length === 2 && index === requiredWords.length - 2)
          texts.push(" and ");

        if (requiredWords !== undefined && requiredWords.length > 2 && index < requiredWords.length - 2)
          texts.push(", ");

        if (requiredWords !== undefined && requiredWords.length > 2 && index === requiredWords.length - 2)
          texts.push(", and ");
      });
    } else {
      texts.push("...");
    }


    return (
      <div>
        <div className="component">
          <div className="title">Lexicologer</div>
        </div>
        {!this.state.gameId ? <div>
          <div className="component">
            <div className="information">Lexicologer is a simple game where the player is asked to use a set of required words within a particular character limit.</div>
            <div className="information">Create a game here and share the link to it!</div>
          </div>
          <div className="component">
            <label htmlFor="gameTitle">Game Title (Optional)</label>
            <br />
            <input type="text" id="gameTitle" placeholder="Lexicologer" maxLength={255} defaultValue={this.state.title} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeTitle(event.target.value)} />
          </div>
          <div className="component">
            <label htmlFor="description">Game Details (Optional)</label>
            <br />
            <textarea id="details" value={this.state.details} placeholder="Lexicologer Details" rows={4} cols={40} maxLength={4000} onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => this.changeDetails(event.target.value)} />
          </div>
          <div className="component">
            <label htmlFor="gameCharacterLimit">Character Limit</label>
            <br />
            <input type="text" id="characterLimit" className={isNaN(Number(this.state.characterLimitInput)) ? "error" : ""} placeholder="How many characters?" defaultValue={this.state.characterLimitInput} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeCharacterLimit(event.target.value)} />
          </div>
          <div className="component">
            <label htmlFor="description">Required Words</label>
          </div>
          <div className="component">
            <div className="information">Write each required word on a new line.</div>
            <div className="information">For variations on a word, follow the word with comma separated alternative matches (for example, if a required word is '<b>priority</b>', follow it with a comma and then by '<b>priorit</b>' so that '<b>priorit</b>ise', '<b>priorit</b>ize' and other words will also be matched. Only the first word will be shown).</div>
            <div className="information">Case will be shown as written, but will be ignored when matching words.</div>
          </div>
          <div className="component buttons">
            <button className="action" onClick={this.autofill}>Fill with examples</button>
          </div>
          <div className="component">
            <textarea id="details" value={this.state.requiredWords} placeholder="Required Words" rows={4} cols={40} maxLength={4000} onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => this.changeRequiredWords(event.target.value)} />
          </div>
          <div className="component">
            <div className="information">{texts}</div>
          </div>
          <div className="component buttons">
            <button className="action" disabled={this.state.fetchingData || isNaN(Number(this.state.characterLimitInput))} onClick={this.postGame}>Create Game</button>
          </div>
          {this.state.errorMessage &&
            <div className="component">
              <div className="error-message">{this.state.errorMessage}</div>
            </div>
          }
          </div>
          : <div className="component">
            <div className="information">Game created! Share this URL:</div>
            <br />
            <div className="information"><code>{window.location.origin}/lexicologer/{this.state.gameId}</code></div>
          </div>
        }
      </div>
    );
  }
}

/* Game */

enum GamePage {
  RetrievingGame = "retrievingGame",
  Game = "game",
  Error = "error"
}

interface LexicologerGameState {
  gameId: number,
  page: GamePage,
  title?: string,
  details?: string,
  characterLimit: number,
  words: Word[],
  text: string
}

interface Word {
  primaryWord: string,
  secondaryWords: string
}

interface GameData {
  title: string,
  details: string,
  words: Word[],
  characterLimit: number
}

export class LexicologerGame extends React.Component<any, LexicologerGameState> {
  title: string = "Lexicologer";

  constructor(props: any) {
    super(props);

    const { match: { params } } = props;

    this.state = {
      gameId: Number(params.gameId),
      page: GamePage.RetrievingGame,
      words: [],
      text: "",
      characterLimit: 140
    }
  }

  componentDidMount = () => {
    if (!isNaN(this.state.gameId)) {
      const startTime = new Date().getTime();

      fetch(`api/lexicologer/${this.state.gameId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      })
        .then((response: Response) => {
          // make sure loading screen is shown for at least two seconds to avoid flickering
          const difference = new Date().getTime() - startTime;
          const timeout = difference > 2000 ? 0 : 2000 - difference;

          setTimeout(() => {
            if (response.status === 200) {
              response.json()
                .then((data: GameData) => {
                  this.setState({
                    page: GamePage.Game,
                    title: data.title,
                    details: data.details,
                    words: data.words,
                    characterLimit: data.characterLimit
                  });
                })
            } else {
              this.setState({
                page: GamePage.Error
              });
            }
          }, timeout);
        });
    } else {
      setTimeout(() => {
        this.setState({
          page: GamePage.Error
        });
      }, 2000);
    }
  }

  changeText = (text: string) => {
    this.setState({
      text: text
    });
  }

  render() {
    let page: JSX.Element = <div>
      <div className="component">
        <div className="information">
          Game not found, sorry! Check out the website for other games.
        </div>
      </div>
    </div>;

    if (this.state.page === GamePage.RetrievingGame) {
      page = <div>
        <div className="component">
          {StatusLoading}
        </div>
      </div>;
    } else if (this.state.page === GamePage.Game) {
      const requiredTexts: RequiredText[] = [];
      const textLowerCase: string = this.state.text.toLowerCase();
      let wordsMissing: boolean = false;

      for (let x = 0; x < this.state.words.length; x++) {
        const word: Word = this.state.words[x];
        let matchFound = textLowerCase.indexOf(word.primaryWord.toLowerCase()) >= 0;

        for (let y = 0; y < word.secondaryWords.length; y++) {
          const secondaryWord: string = word.secondaryWords[y];

          if (textLowerCase.indexOf(secondaryWord.toLowerCase()) >= 0) {
            matchFound = true;
          }
        }

        requiredTexts.push({
          text: word.primaryWord,
          isMissing: !matchFound
        });

        wordsMissing = wordsMissing || !matchFound;
      }

      let textExcludingBreaks = this.state.text;

      while (textExcludingBreaks.indexOf("\n") >= 0) {
        textExcludingBreaks = textExcludingBreaks.replace("\n", "");
      }

      const textLength = textExcludingBreaks.length

      const requiredTextsElement: (JSX.Element | string)[] = getRequiredTextsElement(requiredTexts);

      page = <div>
        {this.state.title && <div className="component">
          <div className="subtitle">{this.state.title}</div>
        </div>}
        {this.state.details && <div className="component">
          <div className="information">{this.state.details}</div>
        </div>}
        <div className="component">
          <div className="information">{requiredTextsElement}</div>
        </div>
        <div className="component">
          <textarea className={textLength > this.state.characterLimit ? "error" : ""} value={this.state.text} onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => this.changeText(event.target.value)} rows={4} cols={40} />
          <br />
          <div className="note">{textLength}/{this.state.characterLimit}</div>
        </div>
        <div className="component">
          {wordsMissing ? StatusRequiredWords : (textLength > this.state.characterLimit ? StatusTooLong : StatusGood)}
        </div>
      </div>;
    }

    return (
      <div>
        <div className="component">
          <div className="title">Lexicologer</div>
        </div>
        <div className="component">
          <div className="emphasis">By Lotographia</div>
        </div>
        <div className="component">
          <hr />
        </div>
        {page}
      </div>
    );
  }
}
