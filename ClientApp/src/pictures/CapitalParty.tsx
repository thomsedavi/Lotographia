import * as React from "react";
import { CheckboxOptionsComponent, CheckboxOptionsFunction } from "../components/CheckboxOptionsComponent";
import { DisplayComponent } from "../components/DisplayComponent";
import { InfoComponent } from "../components/InfoComponent";
import { ImageFloat } from "../components/Option";
import { RadioOptionsComponent } from "../components/RadioOptionsComponent";
import { CharacterProps, TextAreaProps, TextProps, isTextArea, TextComponent, convertText } from "../components/TextComponent";
import { getFileImageObjectURL, getSingleImageObjectURL } from "../utils/Utils";

interface LoadedImage {
  src: string;
  objectUrl?: string;
}

enum Option1 {
  Octopus = "octopus",
  Robot = "robot"
}

enum Option2 {
  Alien = "octopus",
  Lizard = "robot"
}

enum Options {
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
  images: { [id: string]: LoadedImage };
  usedRandomTexts: number[];
  option1?: Option1;
  option2?: Option2;
  selectedIds: string[];
  texts: (TextAreaProps | TextProps)[];
  stage: number;
  previewURL?: string;
  loadedImages: number;
  pageLoaded: boolean;
  imageLoaded: boolean;
}

export class CapitalParty extends React.Component<any, CapitalPartyState> {
  title: string = "Capital Party";
  textLengths: number[] = [25, 21, 20, 18, 18, 18, 18];
  requiredOptions: number = 2;

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
      selectedIds: [],
      stage: 0,
      texts: [
        {
          originalValue: "The two children",
          updatedValue: "The two monsters"
        },
        {
          customValue: "",
          onChange: (text: string) => this.updateText(1, text),
          placeholder: "(your text here)"
        },
        {
          originalValue: "the dessert",
          updatedValue: "the Beehive"
        },
        {
          onChange: (text: string) => this.updateText(3, text),
          placeholder: "(your other text here)",
          customValue: ""
        }
      ],
      usedRandomTexts: [0, 1, 2],
      loadedImages: 0,
      pageLoaded: false,
      imageLoaded: false
    };
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

  componentWillUnmount = () => {
    for (var id in this.state.images) {
      const image = this.state.images[id];

      image.objectUrl !== undefined &&
        URL.revokeObjectURL(image.objectUrl);
    }

    this.state.previewURL != undefined &&
      URL.revokeObjectURL(this.state.previewURL);
  }

  selectOption1 = (id: Option1) => {
    this.setState({
      option1: id
    })
  }

  selectOption2 = (id: Option2) => {
    this.setState({
      option2: id
    });
  }

  selectCheckbox = (id: string) => {
    CheckboxOptionsFunction(this.state.selectedIds, id, this.requiredOptions, (selectedIds: string[]) => {
      this.setState({
        selectedIds: selectedIds
      })
    });
  }

  updateText = (index: number, text: string) => {
    const texts = this.state.texts;

    const textArea = texts[index];

    if (isTextArea(textArea))
      textArea.customValue = text;

    texts[index] = textArea;

    this.setState({
      texts: texts
    });
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
      this.updateText(p[0], p[1]);
    });
  }

  next = () => {
    this.setState((state) => ({
      stage: state.stage + 1
    }));
  }

  previous = () => {
    this.setState((state) => ({
      stage: state.stage - 1
    }));
  }

  getBody = () => {
    const convertedText: { convertedTexts: CharacterProps[][]; tooLong: boolean; } = convertText(this.state.texts, this.textLengths, false);

    var layers: string[] = [];

    if (this.state.selectedIds.indexOf(Options.Electricity) >= 0)
      layers.push("CapitalParty/1_electricity.png");

    if (this.state.selectedIds.indexOf(Options.Terrible) >= 0)
      layers.push("CapitalParty/2_terrible.png");

    if (this.state.option1 === Option1.Robot)
      layers.push("CapitalParty/robot.png");

    if (this.state.option1 === Option1.Octopus)
      layers.push("CapitalParty/octopus.png");

    if (this.state.option2 === Option2.Lizard)
      layers.push("CapitalParty/lizard.png");

    if (this.state.option2 === Option2.Alien)
      layers.push("CapitalParty/alien.png");

    if (this.state.selectedIds.indexOf(Options.Acid) >= 0)
      layers.push("CapitalParty/3_acid.png");

    if (this.state.selectedIds.indexOf(Options.Terrible) >= 0)
      layers.push("CapitalParty/4_terrible.png");

    if (this.state.selectedIds.indexOf(Options.Lava) >= 0)
      layers.push("CapitalParty/5_lava.png");

    if (this.state.selectedIds.indexOf(Options.Terrible) >= 0)
      layers.push("CapitalParty/6_terrible.png");

    return {
      base: "CapitalParty/background.png",
      height: this.height,
      layers: layers,
      phrases: [
        {
          backgroundColor: "#000000",
          x: 0.965,
          y: 0.055,
          horizontalAlignment: 1,
          verticalAlignment: 0,
          scale: "small",
          text: convertedText.convertedTexts[0].map(t => t.character).join("").trim(),
          textColor: "#FFFFFF"
        },
        {
          backgroundColor: "#000000",
          x: 0.96,
          y: 0.1,
          horizontalAlignment: 1,
          verticalAlignment: 0,
          scale: "small",
          text: convertedText.convertedTexts[1].map(t => t.character).join("").trim(),
          textColor: "#FFFFFF"
        },
        {
          backgroundColor: "#000000",
          x: 0.97,
          y: 0.155,
          horizontalAlignment: 1,
          verticalAlignment: 0,
          scale: "small",
          text: convertedText.convertedTexts[2].map(t => t.character).join("").trim(),
          textColor: "#FFFFFF"
        },
        {
          backgroundColor: "#000000",
          x: 0.96,
          y: 0.2,
          horizontalAlignment: 1,
          verticalAlignment: 0,
          scale: "small",
          text: convertedText.convertedTexts[3].map(t => t.character).join("").trim(),
          textColor: "#FFFFFF"
        },
        {
          backgroundColor: "#000000",
          x: 0.965,
          y: 0.25,
          horizontalAlignment: 1,
          verticalAlignment: 0,
          scale: "small",
          text: convertedText.convertedTexts[4].map(t => t.character).join("").trim(),
          textColor: "#FFFFFF"
        },
        {
          backgroundColor: "#000000",
          x: 0.97,
          y: 0.305,
          horizontalAlignment: 1,
          verticalAlignment: 0,
          scale: "small",
          text: convertedText.convertedTexts[5].map(t => t.character).join("").trim(),
          textColor: "#FFFFFF"
        },
        {
          backgroundColor: "#000000",
          x: 0.965,
          y: 0.355,
          horizontalAlignment: 1,
          verticalAlignment: 0,
          scale: "small",
          text: convertedText.convertedTexts[6].map(t => t.character).join("").trim(),
          textColor: "#FFFFFF"
        }
      ],
      width: this.width
    }
  }

  render() {
    const info1Component = <InfoComponent key="info1Component"
      buttons={[
        {
          class: "navigation",
          isActive: this.state.loadedImages === 4 && this.state.pageLoaded,
          name: "Next",
          onClick: this.next
        }
      ]}
      isLoading={this.state.loadedImages < 4 || !this.state.pageLoaded}
      content={[
        "It is a lovely day in the capital city of Aotearoa and you are going to have a party",
        "Oh no! Despite this being the 21st Century, somehow no one has a device that they can take photos on",
        "Never mind, if you answer a few questions I should be able to piece something together for you",
        "(btw: the image at the end of this game is probably better viewed on desktop than mobile)"
      ]}
    />;

    const radio1Component = <RadioOptionsComponent key="radio1Component"
      buttons={[
        {
          class: "navigation",
          isActive: true,
          name: "Previous",
          onClick: this.previous
        },
        {
          class: "navigation",
          isActive: this.state.option1 !== undefined,
          name: "Next",
          onClick: this.next
        }
      ]}
      context="Your party is going to be super memorable. Pick a theme!"
      options={
        [
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
        ]
      }
      onClick={this.selectOption1}
      selectedId={this.state.option1}
    />;

    const radio2Component = <RadioOptionsComponent key="radio2Component"
      buttons={[
        {
          class: "navigation",
          isActive: true,
          name: "Previous",
          onClick: this.previous
        },
        {
          class: "navigation",
          isActive: this.state.option2 !== undefined,
          name: "Next",
          onClick: this.next
        }
      ]}
      context={`${this.state.option1 == Option1.Robot ? "Robots" : "Octopuses"}, eh? This is fun, let"s add another theme`}
      options={
        [
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
        ]
      }
      onClick={this.selectOption2}
      selectedId={this.state.option2}
    />;

    const checkboxComponent = <CheckboxOptionsComponent key="checkboxComponent"
      buttons={[
        {
          class: "navigation",
          isActive: true,
          name: "Previous",
          onClick: this.previous
        },
        {
          class: "navigation",
          isActive: this.state.selectedIds.length === 2,
          name: "Next",
          onClick: this.next
        }
      ]}
      maximum={2}
      context="I forgot to mention, this is a kids party. You are 12, or 12-like. Choose a couple of games to play"
      onClick={this.selectCheckbox}
      options={
        [
          { description: "Don't touch the floor! A classic game where the floor is literally lava", id: Options.Lava, name: "The Floor Is Lava" },
          { description: "Don't touch the walls! A variant of the original game intended to discourage loafing", id: Options.Acid, name: "The Walls Are Acid" },
          { description: "Don't touch the ceiling! An intenionally easy game for beginners", id: Options.Electricity, name: "The Ceiling Is Electrity" },
          { description: "Don't touch anything! A metaphor for life", id: Options.Terrible, name: "Everything Is Terrible" }
        ]
      }
      selectedIds={this.state.selectedIds}
    />

    const convertedText: { convertedTexts: CharacterProps[][], tooLong: boolean } = convertText(this.state.texts, this.textLengths, true);

    const textComponent = <TextComponent key="textComponent"
      buttons={[
        {
          class: "navigation",
          isActive: true,
          name: "Previous",
          onClick: this.previous
        },
        {
          class: "navigation",
          isActive: !convertedText.tooLong,
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

            getSingleImageObjectURL(body, callback);

            this.next();
          }
        }
      ]}
      autofill={this.autofill}
      context="There is one piece of dessert left and two children who desire it. Do they share it? Do they fight over it? YOU get to fill in the details. (make sure it fits into the preview below)"
      lineLengths={this.textLengths}
      texts={this.state.texts}
    />;

    const info2Component = <InfoComponent key="info2Component"
      buttons={[
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
      ]}
      isLoading={this.state.previewURL === undefined || !this.state.imageLoaded}
      content={[
        "Oh no! My mistake, you weren't having a party after all",
        `${this.state.option1 === Option1.Robot ? "A robot" : "An octopus"}, ${this.state.option2 === Option2.Alien ? "an alien" : "a lizard"}...`,
        "What was this all about, then?"
      ]}
    />;

    const displayComponent = <DisplayComponent key="displayComponent"
      buttons={[
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

            this.setState({
              imageLoaded: false,
              stage: 0,
              option1: undefined,
              option2: undefined,
              previewURL: undefined,
              selectedIds: [],
              texts: [
                {
                  originalValue: "The two children",
                  updatedValue: "The two monsters"
                },
                {
                  customValue: "",
                  onChange: (text: string) => this.updateText(1, text),
                  placeholder: "(your text here)"
                },
                {
                  originalValue: "the dessert",
                  updatedValue: "the Beehive"
                },
                {
                  onChange: (text: string) => this.updateText(3, text),
                  placeholder: "(your other text here)",
                  customValue: ""
                }
              ]
            })
          }
        }
      ]}
      previewURL={this.state.previewURL}
    />;

    const stages = [
      info1Component,
      radio1Component,
      radio2Component,
      checkboxComponent,
      textComponent,
      info2Component,
      displayComponent
    ];

    return (
      <div>
        <div className="component">
          <div className="title">{this.title}</div>
        </div>

        {stages[this.state.stage]}
      </div>
    );
  }
}
