import * as React from "react";
import { getComponent } from "../components/ComponentContainer";
import { selectCheckboxOption, CheckboxComponentProps } from "../components/CheckboxComponent";
import { DisplayComponentProps } from "../components/DisplayComponent";
import { InfoComponentProps } from "../components/InfoComponent";
import { RadioComponentProps } from "../components/RadioComponent";
import { TextComponentProps, mapToTextComponents } from "../components/TextComponent";
import { TextType, FontFamily, LayerType, ImageFloat } from "../common/Enums";
import { SubstituteTexts, GameDetails, ProcessedTextsState, TextComponent, TextElement, RequiredText, GetProcessedTextsBody, LoadedImage, Layer, ProcessedText, Option } from "../common/Interfaces";
import { getFileImageObjectURL, getProcessedImageObjectURL, getProcessedTexts } from "../common/Utils";
import { StatusLoading, StatusReady, StatusChecking, StatusTooLong, StatusGood } from '../common/Assets';

enum Option1 {
  Octopus = "octopus",
  Robot = "robot"
}

enum Option2 {
  Alien = "octopus",
  Lizard = "robot"
}

enum Option3 {
  Acid = "acid",
  Electricity = "electricity",
  Lava = "lava",
  Terrible = "terrible"
}

enum Images {
  Aliens = "aliens",
  Lizards = "lizards",
  Octopuses = "octopuses",
  Robots = "robots"
}

interface CapitalPartyState {
  images: { [id: string]: LoadedImage },
  usedRandomTexts: number[],
  options1: Option[],
  options2: Option[],
  options3: Option[],
  textElements: TextElement[],
  stage: number,
  previewURL?: string,
  loadedImages: number,
  pageLoaded: boolean,
  imageLoaded: boolean,
  waitingToSubmit: boolean,
  waitingForReturn: boolean,
  layers: Layer[],
  isTooLong: boolean
}

const substituteTexts: SubstituteTexts[] = [
  {
    displayedText: "children",
    isRequired: true,
    variantTexts: [
      {
        shownText: "children",
        hiddenText: "monsters"
      },
      {
        shownText: "child",
        hiddenText: "monster"
      }
    ]
  },
  {
    displayedText: "dessert",
    isRequired: true,
    variantTexts: [
      {
        shownText: "desserts",
        hiddenText: "Government"
      },
      {
        shownText: "dessert",
        hiddenText: "Beehive"
      }
    ]
  }
];

const defaultTextElements: TextElement[] = [
  {
    type: TextType.Fixed,
    text: "The two children"
  },
  {
    type: TextType.Custom,
    placeholder: "(your text here)"
  },
  {
    type: TextType.Fixed,
    text: "the dessert"
  },
  {
    type: TextType.Custom,
    placeholder: "(your other text here)"
  }
];

export class CapitalParty extends React.Component<any, CapitalPartyState> {
  title: string = "Capital Party";
  requiredOptions: number = 2;
  timeout?: number;

  height: number = 600;
  width: number = 900;

  randomTexts: [number, string][][] = [
    [
      [1, ", unable to peacefully resolve their dispute over"],
      [3, ", had somehow reduced it to a toxic mess, useful to no one."]
    ],
    [
      [1, "took a 'scorched earth' approach to"],
      [3, ". Happily it was already full of scorched almonds."]
    ],
    [
      [1, ","],
      [3, ", and a whole lot of hurt feelings. This is why we can't have nice things."]
    ],
    [
      [1, "sustained multiple injuries attempting to attain"],
      [3, ", according to sources at the scene =("]
    ],
    [
      [1, "were already sick from eating too much of"],
      [3, ", but could not bring themselves to forfeit the rest"]
    ]
  ];

  constructor(props: any) {
    super(props);

    this.state = {
      images: {
        [Images.Aliens]: { src: "CapitalParty/aliens.png" },
        [Images.Lizards]: { src: "CapitalParty/lizards.png" },
        [Images.Octopuses]: { src: "CapitalParty/octopuses.png" },
        [Images.Robots]: { src: "CapitalParty/robots.png" }
      },
      options1: [
        { id: Option1.Octopus, isSelected: false },
        { id: Option1.Robot, isSelected: false }
      ],
      options2: [
        { id: Option2.Alien, isSelected: false },
        { id: Option2.Lizard, isSelected: false }
      ],
      options3: [
        { id: Option3.Acid, isSelected: false },
        { id: Option3.Electricity, isSelected: false },
        { id: Option3.Lava, isSelected: false },
        { id: Option3.Terrible, isSelected: false }
      ],
      stage: 0,
      textElements: [...defaultTextElements],
      usedRandomTexts: [0, 1, 2],
      loadedImages: 0,
      pageLoaded: false,
      imageLoaded: false,
      waitingToSubmit: false,
      waitingForReturn: false,
      isTooLong: false,
      layers: [
        {
          layerType: LayerType.Image,
          isVisible: false,
          fileName: "CapitalParty/1_electricity.png",
          requiredOption: Option3.Electricity
        },
        {
          layerType: LayerType.Image,
          isVisible: false,
          fileName: "CapitalParty/2_terrible.png",
          requiredOption: Option3.Terrible
        },
        {
          layerType: LayerType.Image,
          isVisible: false,
          fileName: "CapitalParty/robot.png",
          requiredOption: Option1.Robot
        },
        {
          layerType: LayerType.Image,
          isVisible: false,
          fileName: "CapitalParty/octopus.png",
          requiredOption: Option1.Octopus
        },
        {
          layerType: LayerType.Image,
          isVisible: false,
          fileName: "CapitalParty/lizard.png",
          requiredOption: Option2.Lizard
        },
        {
          layerType: LayerType.Image,
          isVisible: false,
          fileName: "CapitalParty/alien.png",
          requiredOption: Option2.Alien
        },
        {
          layerType: LayerType.Image,
          isVisible: false,
          fileName: "CapitalParty/3_acid.png",
          requiredOption: Option3.Acid
        },
        {
          layerType: LayerType.Image,
          isVisible: false,
          fileName: "CapitalParty/4_terrible.png",
          requiredOption: Option3.Terrible
        },
        {
          layerType: LayerType.Image,
          isVisible: false,
          fileName: "CapitalParty/5_lava.png",
          requiredOption: Option3.Lava
        },
        {
          layerType: LayerType.Image,
          isVisible: false,
          fileName: "CapitalParty/6_terrible.png",
          requiredOption: Option3.Terrible
        },
        {
          layerType: LayerType.Phrase,
          isVisible: false,
          backgroundColor: "#000",
          horizontalPosition: 0.8,
          verticalPosition: 0.047,
          horizontalAlignment: 0.53,
          verticalAlignment: 0.5,
          fontSize: 9,
          textColor: "#FFF",
          fontFamily: FontFamily.Monospace,
          maximumLength: 25
        },
        {
          layerType: LayerType.Phrase,
          isVisible: false,
          backgroundColor: "#000",
          horizontalPosition: 0.86,
          verticalPosition: 0.1,
          horizontalAlignment: 0.38,
          verticalAlignment: 0.5,
          fontSize: 9,
          textColor: "#FFF",
          fontFamily: FontFamily.Monospace,
          maximumLength: 21
        },
        {
          layerType: LayerType.Phrase,
          isVisible: false,
          backgroundColor: "#000",
          horizontalPosition: 0.83,
          verticalPosition: 0.149,
          horizontalAlignment: 0.58,
          verticalAlignment: 0.5,
          fontSize: 9,
          textColor: "#FFF",
          fontFamily: FontFamily.Monospace,
          maximumLength: 20
        },
        {
          layerType: LayerType.Phrase,
          isVisible: false,
          backgroundColor: "#000",
          horizontalPosition: 0.87,
          verticalPosition: 0.202,
          horizontalAlignment: 0.41,
          verticalAlignment: 0.5,
          fontSize: 9,
          textColor: "#FFF",
          fontFamily: FontFamily.Monospace,
          maximumLength: 18
        },
        {
          layerType: LayerType.Phrase,
          isVisible: false,
          backgroundColor: "#000",
          horizontalPosition: 0.83,
          verticalPosition: 0.255,
          horizontalAlignment: 0.66,
          verticalAlignment: 0.5,
          fontSize: 9,
          textColor: "#FFF",
          fontFamily: FontFamily.Monospace,
          maximumLength: 18
        },
        {
          layerType: LayerType.Phrase,
          isVisible: false,
          backgroundColor: "#000",
          horizontalPosition: 0.88,
          verticalPosition: 0.312,
          horizontalAlignment: 0.41,
          verticalAlignment: 0.5,
          fontSize: 9,
          textColor: "#FFF",
          fontFamily: FontFamily.Monospace,
          maximumLength: 18
        },
        {
          layerType: LayerType.Phrase,
          isVisible: false,
          backgroundColor: "#000",
          horizontalPosition: 0.85,
          verticalPosition: 0.365,
          horizontalAlignment: 0.57,
          verticalAlignment: 0.5,
          fontSize: 9,
          textColor: "#FFF",
          fontFamily: FontFamily.Monospace,
          maximumLength: 18
        }
      ]
    };

    this.processTexts();
  }

  // recursively load images, if they all load at once
  // then the images can get jumbled up somehow
  loadImages = (ids: string[]) => {
    if (ids.length) {
      const id = ids.splice(0, 1)[0];
      const image = this.state.images[id];

      const body = JSON.stringify({
        fileName: image.src
      });

      const callback = (objectURL: string) => {
        image.objectUrl = objectURL;
        const images = this.state.images;
        images[id] = image;
    
        this.setState(prevState => ({
          images: images,
          loadedImages: prevState.loadedImages + 1
        }));

        this.loadImages(ids);
      }

      getFileImageObjectURL(body, callback);
    }
  }

  componentDidMount = () => {
    // looks odd if "loading" transitions to "ready" too fast
    setTimeout(() => {
      this.setState({
        pageLoaded: true
      });
    }, 3000);
  
    const ids = Object.keys(this.state.images);
    this.loadImages(ids);
  }

  selectOption1 = (id: Option1) => {
    const options1 = this.state.options1;
    options1.forEach(o => o.isSelected = false);
    options1.filter(o => o.id === id)[0].isSelected = true;

    const layers = this.state.layers;

    options1.forEach((option: Option) => {
      layers.filter(l => l.requiredOption === option.id).forEach(l => l.isVisible = option.isSelected);
    })

    this.setState({
      options1: options1,
      layers: layers
    })
  }

  selectOption2 = (id: Option2) => {
    const options2 = this.state.options2;
    options2.forEach(o => o.isSelected = false);
    options2.filter(o => o.id === id)[0].isSelected = true;

    const layers = this.state.layers;

    options2.forEach((option: Option) => {
      layers.filter(l => l.requiredOption === option.id).forEach(l => l.isVisible = option.isSelected);
    })

    this.setState({
      options2: options2,
      layers: layers
    });
  }

  selectCheckbox = (id: string) => {
    selectCheckboxOption(this.state.options3, id, this.requiredOptions, (options3: Option[]) => {
      const layers = this.state.layers;

      options3.forEach((option: Option) => {
        layers.filter(l => l.requiredOption === option.id).forEach(l => l.isVisible = option.isSelected);
      })

      this.setState({
        options3: options3,
        layers: layers
      })
    });
  }

  updateText = (value: string, index: number) => {
    const textElements = this.state.textElements;

    textElements[index].text = value;

    this.setState({
      textElements: textElements,
      waitingToSubmit: true
    });

    clearTimeout(this.timeout);

    this.timeout = setTimeout(() => {
      this.processTexts()
    }, 250);
  }

  processTexts = () => {
    if (this.state.waitingForReturn)
      return;

    this.setState({
      waitingForReturn: true,
      waitingToSubmit: false
    });

    const textComponentState: {
      textComponents: TextComponent[],
      requiredTexts: RequiredText[]
    } = mapToTextComponents(this.state.textElements, substituteTexts);

    const getProcessedTextsBody: GetProcessedTextsBody = {
      textComponents: textComponentState.textComponents,
      lines: this.state.layers.map(l => {
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
        this.processTexts()
      } else {
        const layers = this.state.layers;

        json.processedTexts.forEach((processedText: ProcessedText, index: number) => {
          if (processedText.remainderFraction !== -1 && processedText.remainderFraction <= 1) {
            const layer = layers[index];

            // can use clever code for this mapping?
            layer.isVisible = processedText.shownText.length > 0;
            layer.shownText = processedText.shownText;
            layer.hiddenText = processedText.hiddenText;
            layer.displayRemainder = processedText.displayRemainder;
            layer.remainderFraction = processedText.remainderFraction;

            layers[index] = layer;
          }
        });

        this.setState({
          isTooLong: json.isTooLong,
          layers: layers
        });
      }
    }

    getProcessedTexts(getProcessedTextsBody, callback);
  }

  autofill = () => {
    let usedRandomTexts = this.state.usedRandomTexts;
    
    let randInt = Math.floor(Math.random() * this.randomTexts.length);
    
    while (usedRandomTexts.indexOf(randInt) >= 0) {
      randInt = Math.floor(Math.random() * this.randomTexts.length);
    }
  
    const phrase = this.randomTexts[randInt];
    
    usedRandomTexts.splice(0, 1);
    usedRandomTexts.push(randInt);
  
    phrase.forEach((p: [number, string]) => {
      this.updateText(p[1], p[0]);
    });
  }

  previous = () => {
    this.setState((state) => ({
      stage: state.stage - 1
    }));
  }

  next = () => {
    this.setState((state) => ({
      stage: state.stage + 1
    }));
  }

  getBody = () => {
    const imageDetails: GameDetails = {
      base: "CapitalParty/background.png",
      layers: this.state.layers,
      height: this.height,
      width: this.width,
      lotoColour: "#000",
      lotoBackground: "#fff",
      substituteTexts: substituteTexts
    }

    return imageDetails;
  }

  render() {
    let componentProps: InfoComponentProps | RadioComponentProps | CheckboxComponentProps | TextComponentProps | DisplayComponentProps;

    const selectedId1 = this.state.options1.filter(o => o.isSelected).length > 0
      ? this.state.options1.filter(o => o.isSelected)[0].id : undefined;
    const selectedId2 = this.state.options2.filter(o => o.isSelected).length > 0
      ? this.state.options2.filter(o => o.isSelected)[0].id : undefined;

    switch (this.state.stage) {
      case 0:
        componentProps = {
          navigationButtons: [{
            class: "navigation",
            isActive: this.state.loadedImages === 4 && this.state.pageLoaded,
            name: "Next",
            onClick: this.next
          }],
          loadingState: this.state.loadedImages < 4 || !this.state.pageLoaded ? StatusLoading : StatusReady,
          contents: [
            "It is a lovely day in the capital city of Aotearoa and you are going to have a party",
            "Oh no! Despite this being the 21st Century, somehow no one has a device that they can take photos on",
            "Never mind, if you answer a few questions I should be able to piece something together for you",
            "(btw: the image at the end of this game is probably better viewed on desktop than mobile)"
            ],
          infoTitle: this.title
        };
        break;
      case 1:
        componentProps = {
          navigationButtons: [
            {
              class: "navigation",
              isActive: true,
              name: "Previous",
              onClick: this.previous
            },
            {
              class: "navigation",
              isActive: selectedId1 !== undefined,
              name: "Next",
              onClick: this.next
            }
          ],
          contents: ["Your party is going to be super memorable. Pick a theme!"],
          selectOptions: [
            {
              description: "Probably safe, I'm sure they follow Chekhov's Laws of Robotics",
              float: ImageFloat.Left,
              id: Option1.Robot,
              name: "Robots",
              objectUrl: this.state.images[Images.Robots].objectUrl
            },
            {
              description: "Did you know that the average octopus has 2.4 pet goldfish and 1 television?",
              float: ImageFloat.Right,
              id: Option1.Octopus,
              name: "Octopuses",
              objectUrl: this.state.images[Images.Octopuses].objectUrl
            }
          ],
          onClick: this.selectOption1,
          selectedId: selectedId1,
          radioTitle: this.title
        }
        break;
      case 2:
        componentProps = {
          navigationButtons: [
            {
              class: "navigation",
              isActive: true,
              name: "Previous",
              onClick: this.previous
            },
            {
              class: "navigation",
              isActive: selectedId2 !== undefined,
              name: "Next",
              onClick: this.next
            }

          ],
          contents: [`${selectedId1 == Option1.Robot ? "Robots" : "Octopuses"}, eh? This is fun, let"s add another theme`],
          selectOptions: [
            {
              description: "Either humans with bumpy foreheads and pointy ears, or rejected Muppet concepts",
              float: ImageFloat.Right,
              id: Option2.Alien,
              name: "Aliens",
              objectUrl: this.state.images[Images.Aliens].objectUrl
            },
            {
              description: "As a child of the '80s, dinosaurs will always be more like giant lizards to me than lizardy birds",
              float: ImageFloat.Left,
              id: Option2.Lizard,
              name: "Lizards",
              objectUrl: this.state.images[Images.Lizards].objectUrl
            }
          ],
          onClick: this.selectOption2,
          selectedId: selectedId2,
          radioTitle: this.title
        };
        break;
      case 3:
        componentProps = {
          navigationButtons: [
            {
              class: "navigation",
              isActive: true,
              name: "Previous",
              onClick: this.previous
            },
            {
              class: "navigation",
              isActive: this.state.options3.filter(id => id.isSelected).length === 2,
              name: "Next",
              onClick: this.next
            }
          ],
          maximum: 2,
          contents: ["I forgot to mention, this is a kids party. You are 12, or 12-like. Choose a couple of games to play"],
          onClick: this.selectCheckbox,
          selectOptions: [
            { description: "Don't touch the floor! A classic game where the floor is literally lava", id: Option3.Lava, name: "The Floor Is Lava" },
            { description: "Don't touch the walls! A variant of the original game intended to discourage loafing", id: Option3.Acid, name: "The Walls Are Acid" },
            { description: "Don't touch the ceiling! An intenionally easy game for beginners", id: Option3.Electricity, name: "The Ceiling Is Electrity" },
            { description: "Don't touch anything! A metaphor for life", id: Option3.Terrible, name: "Everything Is Terrible" }
          ],
          options: this.state.options3,
          checkboxTitle: this.title
        };
        break;
      case 4:
        componentProps = {
          actionButtons: [
            {
              class: "action",
              isActive: true,
              name: "Random Autofill",
              onClick: this.autofill
            }
          ],
          navigationButtons: [
            {
              class: "navigation",
              isActive: true,
              name: "Previous",
              onClick: this.previous
            },
            {
              class: "navigation",
              isActive: !this.state.waitingToSubmit && !this.state.waitingForReturn && !this.state.isTooLong,
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
                  this.getBody()
                )

                getProcessedImageObjectURL(body, callback);

                this.next();
              }
            }
          ],
          contents: ["There is one piece of dessert left and two children who desire it. Do they share it? Do they fight over it? YOU get to fill in the details. (make sure it fits into the preview below)"],
          textTitle: this.title,
          textElements: this.state.textElements,
          onChange: this.updateText,
          layers: this.state.layers,
          isTooLong: this.state.isTooLong,
          loadingState: this.state.waitingToSubmit || this.state.waitingForReturn ? StatusChecking : (this.state.isTooLong ? StatusTooLong : StatusGood)
        };
        break;
      case 5:
        componentProps = {
          navigationButtons: [
            {
              class: "navigation",
              isActive: true,
              name: "Previous",
              onClick: () => {
                this.state.previewURL !== undefined &&
                  URL.revokeObjectURL(this.state.previewURL);

                this.setState({
                  previewURL: undefined,
                  imageLoaded: false
                });

                this.previous();
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
            "Oh no! My mistake, you weren't having a party after all",
            `${selectedId1 === Option1.Robot ? "A robot" : "An octopus"}, ${selectedId2 === Option2.Alien ? "an alien" : "a lizard"}...`,
            "What was this all about, then?"
          ],
          infoTitle: this.title
        };
        break;
      case 6:
        componentProps = {
          navigationButtons: [
            {
              class: "navigation",
              isActive: true,
              name: "Previous",
              onClick: this.previous
            },
            {
              class: "navigation",
              isActive: true,
              name: "Reset",
              onClick: () => {
                this.state.previewURL !== undefined &&
                  URL.revokeObjectURL(this.state.previewURL);

                const textElements = this.state.textElements;

                textElements.forEach(textElement => {
                  if (textElement.type == TextType.Custom)
                    textElement.text = "";
                });

                this.setState({
                  imageLoaded: false,
                  stage: 0,
                  previewURL: undefined,
                  options1: [
                    { id: Option1.Octopus, isSelected: false },
                    { id: Option1.Robot, isSelected: false }
                  ],
                  options2: [
                    { id: Option2.Alien, isSelected: false },
                    { id: Option2.Lizard, isSelected: false }
                  ],
                  options3: [
                    { id: Option3.Acid, isSelected: false },
                    { id: Option3.Electricity, isSelected: false },
                    { id: Option3.Lava, isSelected: false },
                    { id: Option3.Terrible, isSelected: false }
                  ],
                  textElements: textElements
                });

                this.processTexts();
              }
            }
          ],
          contents: [],
          previewURL: this.state.previewURL,
          displayTitle: this.title,
        };
        break;
      default:
        componentProps = {
          infoTitle: "",
          navigationButtons: [],
          contents: []
        };
    }

    return getComponent(componentProps);
  }
}
