import * as React from "react";
import { getComponent } from "../components/ComponentContainer";
import { InfoComponentProps } from "../components/InfoComponent";
import { RadioComponentProps } from "../components/RadioComponent";
import { SelectComponentProps } from "../components/SelectComponent";
import { DisplayComponentProps } from "../components/DisplayComponent";
import { TextComponentProps, mapToTextComponents } from "../components/TextComponent";
import { SubstituteTexts, GameDetails, ProcessedTextsState, TextComponent, GameOptionDetails, TextElement, RequiredText, GetProcessedTextsBody, LoadedImage, Layer, ProcessedText, Option } from "../common/Interfaces";
import { TextType, FontFamily } from "../common/Enums";
import { getFileImageObjectURL, getProcessedImageObjectURL, getProcessedTexts } from "../common/Utils";
import { StatusLoading, StatusReady, StatusChecking, StatusTooLong, StatusGood, StatusRequiredWords } from '../common/Assets';
import { Images, Games, DefaultGameId } from "./CapricottaCollection";

enum GameMode {
  Curated = "Curated",
  FullyRandom = "FullyRandom",
  SomewhatRandom = "SomewhatRandom"
}

interface CapricottaState {
  stage: number,
  gameMode?: GameMode,
  game?: GameOptionDetails,
  isTooLong: boolean,
  requiredTexts: RequiredText[],
  waitingToSubmit: boolean,
  waitingForReturn: boolean,
  textElement: TextElement,
  previewURL?: string,
  imageLoaded: boolean,
  optionImages: { [id: string]: LoadedImage },
  loadingOptionImage: boolean,
  waitingOptionImageIds: [],
  usedRandomGames: string[]
}

export class Capricotta extends React.Component<any, CapricottaState> {
  title: string = "Capricotta";

  timeout?: number;

  constructor(props: any) {
    super(props);

    this.state = {
      optionImages: Images,
      loadingOptionImage: false,
      waitingOptionImageIds: [],
      stage: 1,
      textElement: {
        type: TextType.Custom,
        placeholder: "(your text here)"
      },
      waitingToSubmit: false,
      waitingForReturn: false,
      imageLoaded: false,
      isTooLong: false,
      requiredTexts: [],
      usedRandomGames: [DefaultGameId]
    };
  }

  loadOptionImage = (id: string) => {
    const optionImage = this.state.optionImages[id];

    const body = JSON.stringify({
      fileName: optionImage.src
    });

    const callback = (objectURL: string) => {
      optionImage.objectUrl = objectURL;
      const optionImages = this.state.optionImages;
      optionImages[id] = optionImage;

      this.setState({
        optionImages: optionImages
      });
    }

    getFileImageObjectURL(body, callback);
  }

  componentDidMount = () => {
    const searchParams = new URLSearchParams(window.location.search);

    this.selectGame(searchParams.get("gameid") || DefaultGameId);
  }

  previous = (stages: number) => {
    this.setState((state) => ({
      stage: state.stage - stages
    }));
  }

  next = () => {
    this.setState((state) => ({
      stage: state.stage + 1
    }));
  }

  getBody = (game: GameOptionDetails) => {
    const imageDetails: GameDetails = {
      substituteTexts: game.substituteTexts,
      base: game.base,
      layers: game.layers,
      height: game.height,
      width: game.width,
      lotoColour: game.lotoColour,
      lotoBackground: game.lotoBackground
    }

    return imageDetails;
  }

  selectGameMode = (gameMode: GameMode) => {
    this.setState({
      gameMode: gameMode
    })
  }

  selectGame = (gameId: string) => {
    let game = Games.filter(g => g.id === gameId)[0];

    if (game === undefined)
      game = Games.filter(g => g.id === DefaultGameId)[0];

    const usedRandomGames = this.state.usedRandomGames;

    usedRandomGames.splice(0, 1);
    usedRandomGames.push(game.id);

    const requiredWords: SubstituteTexts[] = game.substituteTexts;

    const requiredTexts: RequiredText[] = requiredWords.filter(w => w.isRequired).map((w: SubstituteTexts) => {
      return {
        text: w.displayedText,
        isMissing: true
      }
    });

    this.setState({
      game: game,
      requiredTexts: requiredTexts,
      usedRandomGames: usedRandomGames
    }, () => this.loadOptionImage(gameId));

    this.updateText("");
  }

  // TODO makes used randoms a common util, share with CapitalParty autofill
  randomPoetry = () => {
    const usedRandomGames = this.state.usedRandomGames;

    let randInt = Math.floor(Math.random() * Games.length);
    let randomGame = Games[randInt];

    while (usedRandomGames.indexOf(randomGame.id) >= 0) {
      randInt = Math.floor(Math.random() * Games.length);

      randomGame = Games[randInt];
    }

    this.selectGame(randomGame.id);
  }

  updateText = (value: string, _?: number) => {
    const textElement = this.state.textElement;

    textElement.text = value;

    this.setState({
      textElement: textElement,
      waitingToSubmit: true
    });

    clearTimeout(this.timeout);

    this.timeout = setTimeout(() => {
      this.processTexts(this.state.game!)
    }, 250);
  }

  processTexts = (game: GameDetails) => {
    if (this.state.waitingForReturn)
      return;

    this.setState({
      waitingForReturn: true,
      waitingToSubmit: false
    });

    const textComponentState: {
      textComponents: TextComponent[],
      requiredTexts: RequiredText[]
    } = mapToTextComponents([this.state.textElement], game.substituteTexts);

    const getProcessedTextsBody: GetProcessedTextsBody = {
      textComponents: textComponentState.textComponents,
      lines: game.layers.map(l => {
        return {
          maximumLength: l.maximumLength || 0,
          fontFamily: l.fontFamily || FontFamily.Monospace
        }
      })
    }

    const callback = (json: ProcessedTextsState) => {
      this.setState({
        waitingForReturn: false
      });

      if (this.state.waitingToSubmit) {
        this.processTexts(game)
      } else {
        const layers = game.layers;

        json.processedTexts.forEach((processedText: ProcessedText, index: number) => {
          if (processedText.remainderFraction <= 1) {
            const layer = layers[index];

            layer.isVisible = processedText.shownText.length > 0;
            layer.shownText = processedText.shownText;
            layer.hiddenText = processedText.hiddenText;
            layer.displayRemainder = processedText.displayRemainder;
            layer.remainderFraction = processedText.remainderFraction;

            layers[index] = layer;
          }
        });

        const gameState = this.state.game!;
        gameState.layers = layers;

        this.setState({
          isTooLong: json.isTooLong,
          game: gameState,
          requiredTexts: textComponentState.requiredTexts
        });
      }
    }

    getProcessedTexts(getProcessedTextsBody, callback);
  }

  render() {
    const infoProps = {
      navigationButtons: [{
        class: "navigation",
        name: "Next",
        isActive: true,
        onClick: this.next
      }],
      contents: [
        //`Capricotta was named by combining the words "Capricious" and "Ricotta". So I guess it means something like "Fancy Cheese"?`,
        //`Then I was told that "-cotta" meant "cooked", so maybe I unintentionally named this game "Cooked Whimsy", which makes more sense`,
        `In this game, you will write a short piece of poetry or fiction and have it modified in unexpected ways and then applied to a picture`
      ],
      infoTitle: this.title
    };

    let componentProps: InfoComponentProps | RadioComponentProps | SelectComponentProps | DisplayComponentProps | TextComponentProps;

    if (this.state.game === undefined) {
      return getComponent(infoProps);
    }

    const game = this.state.game!;

    switch (this.state.stage) {
      case 0:
        componentProps = infoProps;
        break;

      //case 0:
      //  componentProps = {
      //    navigationButtons: [
      //      {
      //        class: "navigation",
      //        isActive: this.state.gameMode !== undefined,
      //        name: "Next",
      //        onClick: this.next
      //      }
      //    ],
      //    contents: ["Pick a game mode"],
      //    buttonOptions: [
      //      {
      //        description: "Curated",
      //        id: GameMode.Curated,
      //        name: "Curated"
      //      },
      //      {
      //        description: "Somewhat Random",
      //        id: GameMode.SomewhatRandom,
      //        name: "Somewhat Random"
      //      },
      //      {
      //        description: "Fully Random",
      //        id: GameMode.FullyRandom,
      //        name: "Fully Random"
      //      }
      //    ],
      //    onClick: this.selectGameMode,
      //    selectedId: this.state.gameMode,
      //    radioTitle: this.title
      //  }
      //  break;
      case 1:
        const footnote: JSX.Element = <div className="component" key="urlLink">
          <div className="note">Share this game:</div>
          <div className="information"><code>{window.location.origin}/capricotta?gameid={this.state.game.id}</code></div>
        </div>;

        const isReady: boolean = !this.state.waitingToSubmit &&
          !this.state.waitingForReturn &&
          this.state.optionImages[game.id].objectUrl !== undefined;

        componentProps = {
          navigationButtons: [
            {
              class: "navigation",
              isActive: isReady,
              name: "Next",
              onClick: this.next
            }
          ],
          contents: ["Each game will give you a set of words to compose a short piece of poetry or fiction out of. After you've finished, your writing will be modified in unexpected ways and added to a picture..."],
          options: Games,
          //actionButtons: [
          //  {
          //    class: "action",
          //    name: "Random",
          //    isActive: !this.state.waitingToSubmit && !this.state.waitingForReturn,
          //    onClick: this.randomPoetry
          //  }
          //],
          loadingState: isReady ? StatusReady : StatusLoading,
          onClick: this.selectGame,
          selectedId: game.id,
          selectedName: game.name,
          selectedDescription: game.prompt,
          hasImage: true,
          selectedImageUrl: this.state.optionImages[game.id].objectUrl,
          selectTitle: this.title,
          footnote: footnote
        }
        break;
      case 2:
        componentProps = {
          textTitle: this.title,
          textElements: [this.state.textElement],
          contents: [
            "Fill in the writing space below with a short piece of poetry or fiction. Use the required words and allow the Mysterious Algorithm to determine whether your text fits in the available space",
            "Tip: Try to use as many lines of the available lines as you can",
            "(results will vary...)"
          ],
          onChange: this.updateText,
          layers: game.layers,
          isTooLong: this.state.isTooLong,
          requiredTexts: this.state.requiredTexts,
          loadingState: this.state.waitingToSubmit || this.state.waitingForReturn ? StatusChecking : (this.state.requiredTexts.filter(t => t.isMissing).length > 0 ? StatusRequiredWords : this.state.isTooLong ? StatusTooLong : StatusGood),
          navigationButtons: [
            {
              class: "navigation",
              isActive: true,
              name: "Back",
              onClick: () => this.previous(1)
            },
            {
              class: "navigation",
              isActive: !this.state.waitingToSubmit && !this.state.waitingForReturn && !this.state.isTooLong && this.state.requiredTexts.filter(t => t.isMissing).length === 0,
              name: "Next",
              onClick: () => {
                setTimeout(() => {
                  this.setState({
                    imageLoaded: true
                  });
                }, 3000);

                const callback = (objectURL: string) => {
                  this.setState({
                    previewURL: objectURL
                  });
                }

                const body = JSON.stringify(
                  this.getBody(game)
                )

                getProcessedImageObjectURL(body, callback);

                this.next();
              }
            }
          ]
        }
        break;
      case 3:
        componentProps = {
          navigationButtons: [
            {
              class: "navigation",
              isActive: true,
              name: "Back",
              onClick: () => {
                this.state.previewURL !== undefined &&
                  URL.revokeObjectURL(this.state.previewURL);

                this.setState({
                  previewURL: undefined,
                  imageLoaded: false
                });

                this.previous(1);
              }
            },
            {
              class: "navigation",
              isActive: this.state.previewURL !== undefined && this.state.imageLoaded,
              name: "Next",
              onClick: this.next
            }
          ],
          loadingState: this.state.previewURL === undefined || !this.state.imageLoaded ? StatusLoading : StatusReady,
          contents: [
            "Calculating possible futures..."
          ],
          infoTitle: this.title
        };
        break;
      case 4:
        componentProps = {
          navigationButtons: [
            {
              class: "navigation",
              isActive: true,
              name: "Back",
              onClick: () => this.previous(2)
            },
            {
              class: "navigation",
              isActive: true,
              name: "Reset",
              onClick: () => {
                this.state.previewURL !== undefined &&
                  URL.revokeObjectURL(this.state.previewURL);

                const textElement = this.state.textElement;

                textElement.text = "";

                this.setState({
                  imageLoaded: false,
                  stage: 1,
                  previewURL: undefined,
                  textElement: textElement
                });

                this.processTexts(game);
              }
            }
          ],
          contents: [],
          information: game.footnote,
          previewURL: this.state.previewURL,
          displayTitle: this.title,
          caption: game.caption
        };
        break;
      default:
        componentProps = {
          infoTitle: `Broken! Stage is ${this.state.stage}`,
          navigationButtons: [],
          contents: []
        };
    }

    return getComponent(componentProps);
  }
}
