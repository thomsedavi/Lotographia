import * as React from "react";
import { TovelundClue, TovelundDestination, TovelundDestinationName, TovelundElementId, TovelundElementType, TovelundFeatureSize, TovelundGame, TovelundGameDetails, TovelundIndexType, TovelundSymbol, TovelundPoint, TovelundRangeRule, TovelundRelationshipRule, TovelundRoute, TovelundRouteName, TovelundZone, TovelundZoneFeature, TovelundZoneName, TovelundColor, ITovelundRule, TovelundElementName } from "./TovelundEnums";
import { getTovelundMap } from "./TovelundMap";

interface ErrorData {
  title: string
}

interface TovelundAdminState {
  selectedGameId: number,
  games: TovelundGameDetails[],
  tempRelationship: TovelundElementId[],
  gameId?: number,
  gameTitle: string,
  game: TovelundGame,
  elementType: string,
  elementSymbol: string,
  elementName: string,
  selectedElementType: string,
  selectedElementId: number,
  selectedIndexType: string,
  selectedIndex: number,
  fetchingData: boolean,
  errorMessage: string,
  selectedClueIndex: number,
  selectedRuleType: string,
  selectedRuleIndex: number
}

export class TovelundAdmin extends React.Component<any, TovelundAdminState> {
  constructor(props: any) {
    super(props);

    this.state = {
      selectedGameId: -1,
      games: [],
      gameTitle: "Duck Island",
      game: {
        scale: 100,
        symbols: [],
        destinations: [],
        routes: [],
        zones: [],
        relationships: [],
        clues: []
      },
      elementType: TovelundElementType.None,
      elementSymbol: "",
      elementName: "NONE",
      selectedElementType: TovelundElementType.None,
      selectedElementId: -1,
      selectedIndexType: TovelundIndexType.None,
      selectedIndex: -1,
      tempRelationship: [],
      fetchingData: false,
      errorMessage: "",
      selectedClueIndex: -1,
      selectedRuleType: "RANGE",
      selectedRuleIndex: -1
    }
  }

  componentDidMount = () => {
    fetch("api/tovelund", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then((response: Response) => {
        if (response.status === 200) {
          response.json()
            .then((data: { games: TovelundGameDetails[] }) => {
              this.setState({
                games: data.games
              });
            })
        }
      });
  }

  loadGame = () => {
    fetch(`api/tovelund/${this.state.selectedGameId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then((response: Response) => {
        if (response.status === 200) {
          response.json()
            .then((data: TovelundGame) => {
              this.setState({
                selectedElementType: TovelundElementType.None,
                selectedClueIndex: -1,
                gameTitle: this.state.games.filter(g => g.id === this.state.selectedGameId)[0].title,
                game: {
                  scale: data.scale ? data.scale : 100,
                  routes: data.routes ? data.routes : [],
                  destinations: data.destinations ? data.destinations : [],
                  symbols: data.symbols ? data.symbols : [],
                  zones: data.zones ? data.zones : [],
                  relationships: data.relationships ? data.relationships : [],
                  clues: data.clues ? data.clues : []
                },
                gameId: this.state.selectedGameId
              });
            })
        }
      });
  }

  addSymbol = () => {
    const game = this.state.game;

    game.symbols.push({ type: TovelundElementType.Destination, name: this.state.elementName, symbol: this.state.elementSymbol });
    game.symbols.sort((a: TovelundSymbol, b: TovelundSymbol) => a.symbol < b.symbol ? -1 : 1);

    this.setState({
      elementType: TovelundElementType.None,
      elementSymbol: "",
      elementName: "NONE",
      game: game
    });
  }

  addDestination = () => {
    const game = this.state.game;

    const id = game.destinations.length + 1;

    game.destinations.push({
      id: id,
      point: { x: 0, y: 0 },
      angle: "HORIZONTAL",
      symbolColors: {}
    });

    this.setState({
      selectedElementType: TovelundElementType.Destination,
      selectedElementId: id,
      selectedIndexType: TovelundIndexType.None,
      selectedIndex: -1,
      game: game
    });
  }

  selectDestination = (id: number) => {
    this.setState({
      selectedElementType: TovelundElementType.Destination,
      selectedElementId: id,
      selectedIndexType: TovelundIndexType.None,
      selectedIndex: -1
    });
  }

  addRoute = () => {
    const game = this.state.game;

    const id = game.routes.length + 1;

    game.routes.push({
      id: id,
      name: TovelundRouteName.None,
      points: [
        { x: -10, y: -10 },
        { x: 10, y: 10 }
      ]
    });

    this.setState({
      selectedElementType: TovelundElementType.Route,
      selectedElementId: id,
      selectedIndexType: TovelundIndexType.Point,
      selectedIndex: 0,
      game: game
    });
  }

  addZone = (isBase: boolean) => {
    const game = this.state.game;

    const id = isBase ? 0 : game.zones.filter(z => z.id !== 0).length + 1;

    game.zones.push({
      id: id,
      name: TovelundZoneName.None,
      points: isBase ? undefined : [
        { x: -10, y: -10 },
        { x: 10, y: -10 },
        { x: 10, y: 10 }
      ],
      features: []
    });

    this.setState({
      selectedElementType: TovelundElementType.Zone,
      selectedElementId: id,
      selectedIndexType: TovelundIndexType.Point,
      selectedIndex: 0,
      game: game
    });
  }

  addPoint = () => {
    const game = this.state.game;

    let index: number = 0;

    if (this.state.selectedElementType === TovelundElementType.Route) {
      index = game.routes.filter(r => r.id === this.state.selectedElementId)[0].points.length;
      game.routes.filter(r => r.id === this.state.selectedElementId)[0].points.push({ x: 0, y: 0 });
    } else if (this.state.selectedElementType === TovelundElementType.Zone) {
      const points = game.zones.filter(z => z.id === this.state.selectedElementId)[0].points;

      if (points) {
        index = points.length;
        // TODO will this work?
        points.push({ x: 0, y: 0 });
      }
    }

    this.setState({
      game: game,
      selectedIndexType: TovelundIndexType.Point,
      selectedIndex: index
    });
  }

  addFeature = () => {
    const game = this.state.game;

    if (this.state.selectedElementType === TovelundElementType.Zone) {
      game.zones.filter(r => r.id === this.state.selectedElementId)[0].features.push({ shape: TovelundFeatureSize.Medium, point: { x: 0, y: 0 } });

      this.setState({
        game: game,
        selectedIndexType: TovelundIndexType.Feature,
        selectedIndex: game.zones.filter(z => z.id === this.state.selectedElementId)[0].features.length - 1
      });
    }
  }

  addClue = () => {
    const game = this.state.game;

    game.clues.push({
      description: "",
      rules: []
    });

    this.setState({
      game: game
    });
  }

  addElementToRelation = () => {
    const tempRelationship = this.state.tempRelationship;

    tempRelationship.push({
      type: this.state.selectedElementType,
      id: this.state.selectedElementId
    });

    this.setState({
      tempRelationship: tempRelationship
    });
  }

  createRelationship = () => {
    const game = this.state.game;

    game.relationships.push(this.state.tempRelationship);

    this.setState({
      game: game,
      tempRelationship: []
    });
  }

  selectElement = (value: string) => {
    const split = value.split("_");

    this.setState({
      elementType: split[0],
      elementName: split[1]
    });
  }

  selectGame = (gameId: string) => {
    this.setState({
      selectedGameId: Number(gameId)
    });
  }

  selectSelectedElement = (value: string) => {
    const split = value.split("_");

    this.setState({
      selectedElementType: split[0],
      selectedElementId: Number(split[1]),
      selectedIndex: split[0] === TovelundElementType.Route || split[0] === TovelundElementType.Zone ? 0 : -1
    });
  }

  selectObjectIndex = (index: string) => {
    var indexComponents = index.split("_");

    this.setState({
      selectedIndexType: indexComponents[0],
      selectedIndex: Number(indexComponents[1])
    });
  }

  selectShape = (shape: string) => {
    const game = this.state.game;

    if (this.state.selectedElementType === TovelundElementType.Destination) {
      game.destinations.filter(d => d.id === this.state.selectedElementId)[0].angle = shape === "HORIZONTAL" ? "HORIZONTAL" : "VERTICAL";
    } else if (this.state.selectedElementType === TovelundElementType.Zone && this.state.selectedIndexType === TovelundIndexType.Feature) {
      game.zones.filter(z => z.id === this.state.selectedElementId)[0].features[this.state.selectedIndex].shape = shape;
    }

    this.setState({
      game: game
    });
  }

  selectFixedElementName = (elementName: string) => {
    const game = this.state.game;

    if (this.state.selectedElementType === TovelundElementType.Destination) {
      game.destinations.filter(d => d.id === this.state.selectedElementId)[0].fixedName = elementName === TovelundElementType.None ? undefined : elementName;
    } else if (this.state.selectedElementType === TovelundElementType.Route) {
      game.routes.filter(r => r.id === this.state.selectedElementId)[0].name = elementName;
    } else if (this.state.selectedElementType === TovelundElementType.Zone) {
      game.zones.filter(z => z.id === this.state.selectedElementId)[0].name = elementName;
    }

    this.setState({
      game: game
    });
  }

  changeElementSymbol = (symbol: string) => {
    this.setState({
      elementSymbol: symbol
    });
  }

  changeX = (x: string) => {
    const game = this.state.game;

    if (this.state.selectedElementType === TovelundElementType.Destination) {
      game.destinations.filter(d => d.id === this.state.selectedElementId)[0].point.x = Number(x);
    } else if (this.state.selectedElementType === TovelundElementType.Route) {
      game.routes.filter(r => r.id === this.state.selectedElementId)[0].points[this.state.selectedIndex].x = Number(x);
    } else if (this.state.selectedElementType === TovelundElementType.Zone) {
      if (this.state.selectedIndexType === TovelundIndexType.Point) {
        const points = game.zones.filter(r => r.id === this.state.selectedElementId)[0].points;

        if (points) {
          points[this.state.selectedIndex].x = Number(x);
        }
      } else if (this.state.selectedIndexType === TovelundIndexType.Feature) {
        game.zones.filter(z => z.id === this.state.selectedElementId)[0].features[this.state.selectedIndex].point.x = Number(x);
      }
    }

    this.setState({
      game: game
    });
  }

  changeY = (y: string) => {
    const game = this.state.game;

    if (this.state.selectedElementType === TovelundElementType.Destination) {
      game.destinations.filter(d => d.id === this.state.selectedElementId)[0].point.y = Number(y);
    } else if (this.state.selectedElementType === TovelundElementType.Route) {
      game.routes.filter(r => r.id === this.state.selectedElementId)[0].points[this.state.selectedIndex].y = Number(y);
    } else if (this.state.selectedElementType === TovelundElementType.Zone) {
      if (this.state.selectedIndexType === TovelundIndexType.Point) {
        const points = game.zones.filter(r => r.id === this.state.selectedElementId)[0].points;

        if (points) {
          points[this.state.selectedIndex].y = Number(y);
        }
      } else if (this.state.selectedIndexType === TovelundIndexType.Feature) {
        game.zones.filter(z => z.id === this.state.selectedElementId)[0].features[this.state.selectedIndex].point.y = Number(y);
      }
    }

    this.setState({
      game: game
    });
  }

  changeTitle = (title: string) => {
    this.setState({
      gameTitle: title
    });
  }

  changeScale = (scale: string) => {
    const game = this.state.game;

    if (Number(scale) <= 150 && Number(scale) >= 50) {
      game.scale = Number(scale);
    }

    this.setState({
      game: game
    });
  }

  selectClueIndex = (index: string) => {
    this.setState({
      selectedClueIndex: Number(index),
      selectedRuleIndex: -1
    });
  }

  selectRuleType = (ruleType: string) => {
    this.setState({
      selectedRuleType: ruleType
    });
  }

  selectRuleIndex = (index: string) => {
    this.setState({
      selectedRuleIndex: Number(index)
    });
  }

  addRule = () => {
    const game = this.state.game;
    const clue = this.state.game.clues[this.state.selectedClueIndex];

    if (this.state.selectedRuleType === "RANGE") {
      const rule: TovelundRangeRule = {
        ruleType: "RANGE",
        element: {
          type: TovelundElementType.Destination,
          name: "HOUSE"
        },
        min: 1,
        max: 1
      }

      clue.rules.push(rule);
    } else if (this.state.selectedRuleType === "RELATIONSHIP") {
      const rule: TovelundRelationshipRule = {
        ruleType: "RELATIONSHIP",
        mode: "INCLUDE",
        element: {
          type: TovelundElementType.Destination,
          name: "HOUSE"
        },
        relationshipElements: [{
          type: TovelundElementType.Zone,
          name: "MOUNTAINS"
        }]
      }

      clue.rules.push(rule);
    }

    this.setState({
      game: game
    });
  }

  changeClueDescription = (description: string) => {
    const game = this.state.game;

    if (this.state.selectedClueIndex !== -1) {
      game.clues[this.state.selectedClueIndex].description = description;
    }

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

      const body = {
        title: "This Game 2",
        design: "{}"
      };

      fetch("api/tovelund", {
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
              .then((data) => {
                console.log(data);
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

  saveGame = () => {
    if (this.state.gameId) {
      fetch(`api/tovelund/${this.state.gameId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ "Title": this.state.gameTitle, "Design": JSON.stringify(this.state.game) })
      })
        .then(response => { console.log(response) });
    } else {
      fetch("api/tovelund", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ "Title": this.state.gameTitle, "Design": JSON.stringify(this.state.game) })
      })
        .then(response => { console.log(response) });
    }
  }

  changeRangeName = (name: string) => {
    const game = this.state.game;
    const rangeRule = this.state.game.clues[this.state.selectedClueIndex].rules[this.state.selectedRuleIndex] as TovelundRangeRule;

    rangeRule.element.name = name;

    this.setState({
      game: game
    });
  }

  changeRangeMin = (min: string) => {
    const game = this.state.game;
    const rangeRule = this.state.game.clues[this.state.selectedClueIndex].rules[this.state.selectedRuleIndex] as TovelundRangeRule;

    rangeRule.min = Number(min);

    this.setState({
      game: game
    });
  }

  changeRangeMax = (max: string) => {
    const game = this.state.game;
    const rangeRule = this.state.game.clues[this.state.selectedClueIndex].rules[this.state.selectedRuleIndex] as TovelundRangeRule;

    rangeRule.max = Number(max);

    this.setState({
      game: game
    });
  }

  changeElementType = (type: string) => {
    const game = this.state.game;
    const requirementRule = this.state.game.clues[this.state.selectedClueIndex].rules[this.state.selectedRuleIndex] as TovelundRelationshipRule;

    requirementRule.element.type = type;

    this.setState({
      game: game
    });
  }

  changeElementName = (name: string) => {
    const game = this.state.game;
    const requirementRule = this.state.game.clues[this.state.selectedClueIndex].rules[this.state.selectedRuleIndex] as TovelundRelationshipRule;

    requirementRule.element.name = name;

    this.setState({
      game: game
    });
  }

  changeRequiredType = (type: string, index: number) => {
    const game = this.state.game;
    const requirementRule = this.state.game.clues[this.state.selectedClueIndex].rules[this.state.selectedRuleIndex] as TovelundRelationshipRule;

    requirementRule.relationshipElements[index].type = type;

    this.setState({
      game: game
    });
  }

  changeRequiredName = (name: string, index: number) => {
    const game = this.state.game;
    const requirementRule = this.state.game.clues[this.state.selectedClueIndex].rules[this.state.selectedRuleIndex] as TovelundRelationshipRule;

    requirementRule.relationshipElements[index].name = name;

    this.setState({
      game: game
    });
  }

  render() {
    const objectOptions: JSX.Element[] = [];

    this.state.game.zones.map((zone: TovelundZone) => {
      objectOptions.push(<option key={`${TovelundElementType.Zone}_${zone.id}`} value={`${TovelundElementType.Zone}_${zone.id}`}>{TovelundElementType.Zone} {zone.id}</option>);
    });

    this.state.game.routes.map((route: TovelundRoute) => {
      objectOptions.push(<option key={`${TovelundElementType.Route}_${route.id}`} value={`${TovelundElementType.Route}_${route.id}`}>{TovelundElementType.Route} {route.id}</option>);
    });

    this.state.game.destinations.map((destination: TovelundDestination) => {
      objectOptions.push(<option key={`${TovelundElementType.Destination}_${destination.id}`} value={`${TovelundElementType.Destination}_${destination.id}`}>{TovelundElementType.Destination} {destination.id}</option>);
    });

    const featureOptions: JSX.Element[] = [];
    const shapeOptions: JSX.Element[] = [];

    let x: number = 0;
    let y: number = 0;

    if (this.state.selectedElementType === TovelundElementType.Destination) {
      const destination: TovelundDestination = this.state.game.destinations.filter(s => s.id === this.state.selectedElementId)[0];

      shapeOptions.push(<option key="horizontal" value="HORIZONTAL">Horizontal</option>);
      shapeOptions.push(<option key="vertical" value="VERTICAL">Vertical</option>);

      x = destination.point.x;
      y = destination.point.y;
    } else if (this.state.selectedElementType === TovelundElementType.Route) {
      const route: TovelundRoute = this.state.game.routes.filter(r => r.id === this.state.selectedElementId)[0];

      route.points.map((_point: TovelundPoint, index: number) => {
        featureOptions.push(<option key={`${TovelundIndexType.Point}_${index}`}>{TovelundIndexType.Point}_{index}</option>);
      });

      x = route.points[this.state.selectedIndex].x;
      y = route.points[this.state.selectedIndex].y;
    } else if (this.state.selectedElementType === TovelundElementType.Zone) {
      const zone: TovelundZone = this.state.game.zones.filter(z => z.id === this.state.selectedElementId)[0];
      const points = zone.points;

      if (points) {
        points.map((_point: TovelundPoint, index: number) => {
          featureOptions.push(<option key={`${TovelundIndexType.Point}_${index}`}>{TovelundIndexType.Point}_{index}</option>);
        });
      }

      zone.features.map((_feature: TovelundZoneFeature, index: number) => {
        featureOptions.push(<option key={`${TovelundIndexType.Feature}_${index}`}>{TovelundIndexType.Feature}_{index}</option>);
      });

      if (this.state.selectedIndexType === TovelundIndexType.Point) {
        if (points) {
          x = points[this.state.selectedIndex].x;
          y = points[this.state.selectedIndex].y;
        }
      } else if (this.state.selectedIndexType === TovelundIndexType.Feature) {
        shapeOptions.push(<option key="small" value={TovelundFeatureSize.Small}>{TovelundFeatureSize.Small}</option>);
        shapeOptions.push(<option key="medium" value={TovelundFeatureSize.Medium}>{TovelundFeatureSize.Medium}</option>);
        shapeOptions.push(<option key="large" value={TovelundFeatureSize.Large}>{TovelundFeatureSize.Large}</option>);

        x = zone.features[this.state.selectedIndex].point.x;
        y = zone.features[this.state.selectedIndex].point.y;
      }
    }

    const availableElementTypeOptions: JSX.Element[] = []
    const typeOptions: JSX.Element[] = [];

    for (let type in TovelundDestinationName) {
      if (type.toUpperCase() !== TovelundDestinationName.None) {
        if (this.state.selectedElementType === TovelundElementType.Destination) {
          typeOptions.push(
            <option key={`destinationType_${type}`} value={type.toUpperCase()}>{type}</option>
          );
        }
        availableElementTypeOptions.push(
          <option key={`elementTypeOption_${type}`} value={`${TovelundElementType.Destination}_${type.toUpperCase()}`}>{type}</option>
        );
      }
    }

    for (let type in TovelundRouteName) {
      if (type.toUpperCase() !== TovelundRouteName.None) {
        if (this.state.selectedElementType === TovelundElementType.Route) {
          typeOptions.push(
            <option key={`routeType_${type}`} value={type.toUpperCase()}>{type}</option>
          );
        }
        availableElementTypeOptions.push(
          <option key={`elementTypeOption_${type}`} value={`${TovelundElementType.Destination}_${type.toUpperCase()}`}>{type}</option>
        );
      }
    }

    for (let type in TovelundZoneName) {
      if (type.toUpperCase() !== TovelundDestinationName.None) {
        if (this.state.selectedElementType === TovelundElementType.Zone) {
          typeOptions.push(
            <option key={`zoneType_${type}`} value={type.toUpperCase()}>{type}</option>
          );
        }
        availableElementTypeOptions.push(
          <option key={`elementTypeOption_${type}`} value={`${TovelundElementType.Destination}_${type.toUpperCase()}`}>{type}</option>
        );
      }
    }

    const gameOptions: JSX.Element[] = this.state.games.map((game: TovelundGameDetails, index: number) =>
      <option key={`gameId${game.id}`} value={game.id}>{game.title}</option>
    );

    const destinationTypes = this.state.game.symbols.filter(s => s.type === TovelundElementType.Destination);

    const destinationTypeElements: JSX.Element[] = destinationTypes.map((type: TovelundSymbol, index: number) =>
      <div key={`types${index}`} className="information">{type.symbol}: {type.name}</div>
    );

    const tempRelationship: JSX.Element[] = this.state.tempRelationship.map((element: TovelundElementId, index: number) =>
      <div key={`elements${index}`} className="information">{element.type}_{element.id}</div>
    );

    const gameRelationships: JSX.Element[] = this.state.game.relationships.map((value: TovelundElementId[], index: number) => {
      const relationships: JSX.Element[] = value.map((element: TovelundElementId, elementIndex: number) =>
        <div key={`relationship${index}element${elementIndex}`} className="information">{element.type} {element.id}</div>
      );

      return <div key={`relationship${index}`}>
        <div className="text">Relationship {index}</div>
        {relationships}
      </div>;
    });

    let shape = "NONE";
    let elementName = "NONE";

    if (this.state.selectedElementType === TovelundElementType.Destination) {
      const destination: TovelundDestination = this.state.game.destinations.filter(d => d.id === this.state.selectedElementId)[0];

      shape = destination.angle;
      elementName = destination.fixedName ? destination.fixedName : "NONE";
    } else if (this.state.selectedElementType === TovelundElementType.Route) {
      const route: TovelundRoute = this.state.game.routes.filter(r => r.id === this.state.selectedElementId)[0];

      elementName = route.name;
    } else if (this.state.selectedElementType === TovelundElementType.Zone) {
      const zone: TovelundZone = this.state.game.zones.filter(z => z.id === this.state.selectedElementId)[0];

      elementName = zone.name;

      if (this.state.selectedIndexType === TovelundIndexType.Feature) {
        var feature = zone.features[this.state.selectedIndex];

        shape = feature ? feature.shape : "NONE";
      }
    }

    const clueOptions = this.state.game.clues.map((clue: TovelundClue, index: number) =>
      <option key={`clue${index}`} value={index}>{index}: {clue.description}</option>
    );

    let descriptionPreview: (string | JSX.Element)[] = [];

    if (this.state.selectedClueIndex !== -1) {
      const descriptionElements = this.state.game.clues[this.state.selectedClueIndex].description.split("|");

      for (let i = 0; i < descriptionElements.length; i++) {
        const descriptionElement = descriptionElements[i];

        if (this.state.game.symbols.filter(s => s.name === descriptionElement).length) {
          const symbol = this.state.game.symbols.filter(s => s.name === descriptionElement)[0].symbol;

          descriptionPreview.push(<span style={{ color: TovelundColor.Blue }}>{symbol}</span>);
        } else {
          descriptionPreview.push(descriptionElement);
        }
      }
    }

    let clueRules: JSX.Element[] = [];

    if (this.state.selectedClueIndex !== -1) {
      clueRules = this.state.game.clues[this.state.selectedClueIndex].rules.map((rule: ITovelundRule, index: number) => <option key={`rule${index}`} value={index}>
        {index}: {rule.ruleType}
      </option>);
    }

    let ruleSettings: (JSX.Element | undefined) = undefined;

    if (this.state.selectedClueIndex !== -1 && this.state.selectedRuleIndex !== -1 && this.state.game.clues[this.state.selectedClueIndex].rules[this.state.selectedRuleIndex].ruleType == "RANGE") {
      var rangeRule = this.state.game.clues[this.state.selectedClueIndex].rules[this.state.selectedRuleIndex] as TovelundRangeRule;

      ruleSettings = <div className="section">
        Name
        <input type="text" id="rangeRuleType" value={rangeRule.element.name} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeRangeName(event.target.value)} />
        Min
        <input type="number" id="rangeRuleMin" value={rangeRule.min} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeRangeMin(event.target.value)} />
        Max
        <input type="number" id="rangeRuleMax" value={rangeRule.max} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeRangeMax(event.target.value)} />
      </div>;
    } else if (this.state.selectedClueIndex !== -1 && this.state.selectedRuleIndex !== -1 && this.state.game.clues[this.state.selectedClueIndex].rules[this.state.selectedRuleIndex].ruleType == "RELATIONSHIP") {
      var requirementRule = this.state.game.clues[this.state.selectedClueIndex].rules[this.state.selectedRuleIndex] as TovelundRelationshipRule;

      const requirementOptions = requirementRule.relationshipElements.map((rule: TovelundElementName, index: number) =>
        <div key={`requirement${index}`}>
          Required Type {index}
          <input type="text" id="requiredRuleType" value={rule.type} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeRequiredType(event.target.value, index)} />
          Required Name {index}
          <input type="text" id="requiredRuleName" value={rule.name} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeRequiredName(event.target.value, index)} />
        </div>
      );

      ruleSettings = <div className="section">
        Type
        <input type="text" id="elementRuleType" value={requirementRule.element.type} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeElementType(event.target.value)} />
        Name
        <input type="text" id="elementRuleName" value={requirementRule.element.name} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeElementName(event.target.value)} />
        {requirementOptions}
      </div>;
    }

    return <div className="section">
      <div className="component">
        <select value={this.state.selectedGameId} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.selectGame(event.currentTarget.value)} style={{ width: "10em" }}>
          <option value="-1" disabled>Choose</option> 
          {gameOptions}
        </select>
      </div>
      <div className="component buttons">
        <button className="action" onClick={this.loadGame} disabled={this.state.selectedGameId === -1}>Load Game</button>
      </div>
      <div className="component">
        <input type="text" value={this.state.elementSymbol} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeElementSymbol(event.target.value)} maxLength={1} style={{ width: "2em", marginRight: "1em" }} />
        <select value={`${this.state.elementType}_${this.state.elementName}`} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.selectElement(event.currentTarget.value)} style={{ width: "10em" }}>
          <option value={TovelundDestinationName.None} disabled>Choose</option> 
          {availableElementTypeOptions}
        </select>
      </div>
      <div className="component buttons">
        <button className="action" onClick={this.addSymbol} disabled={this.state.elementType === "NONE" || this.state.elementSymbol === "" || this.state.game.symbols.filter((value: TovelundSymbol) => this.state.elementSymbol === value.symbol).length > 0}>
          Add Symbol</button>
        <button className="action" onClick={this.addDestination}>Add destination</button>
        <button className="action" onClick={this.addRoute}>Add Route</button>
        <button className="action" onClick={() => this.addZone(false)}> Add Zone</button>
        <button className="action" onClick={() => this.addZone(true)} disabled={this.state.game.zones.filter(z => z.id === 0).length > 0}> Add Base Zone</button>
        <button className="action" onClick={this.addPoint} disabled={(this.state.selectedElementType !== TovelundElementType.Route && this.state.selectedElementType !== TovelundElementType.Zone) || this.state.selectedElementId === 0}>Add Point</button>
        <button className="action" onClick={this.addFeature} disabled={this.state.selectedElementType !== TovelundElementType.Zone}>Add Feature</button>
        <button className="action" onClick={this.addClue}>Add Clue</button>
        <button className="action" onClick={this.addElementToRelation} disabled={this.state.selectedElementType === "NONE"}>Add Element To Relation</button>
        <button className="action" onClick={this.createRelationship} disabled={this.state.tempRelationship.length < 2}>Create Relationship</button>
      </div>
      <div className="component">
        <select value={`${this.state.selectedElementType}_${this.state.selectedElementId}`} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.selectSelectedElement(event.currentTarget.value)} style={{ width: "10em" }}>
          <option value="NONE_-1" disabled>Choose</option> 
          {objectOptions}
        </select>
      </div>
      <div className="component">
        <select value={`${this.state.selectedIndexType}_${this.state.selectedIndex}`} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.selectObjectIndex(event.currentTarget.value)} style={{ width: "10em" }}>
          <option value="NONE_-1" disabled>Choose</option> 
          {featureOptions}
        </select>
      </div>
      <div className="component">
        <select value={shape} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.selectShape(event.currentTarget.value)} style={{ width: "10em" }}>
          <option value="NONE" disabled={this.state.selectedElementType === TovelundElementType.Destination}>N/A</option>
          {shapeOptions}
        </select>
      </div>
      <div className="component">
        <select value={elementName} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.selectFixedElementName(event.currentTarget.value)} style={{ width: "10em" }}>
          <option value="NONE">None</option>
          {typeOptions}
        </select>
      </div>
      <div className="component">
        <label htmlFor="xValue">X</label>
        <br />
        <input type="number" id="xValue" value={x} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeX(event.target.value)} />
      </div>
      <div className="component">
        <label htmlFor="yValue">Y</label>
        <br />
        <input type="number" id="yValue" value={y} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeY(event.target.value)} />
      </div>
      <div className="component">
        <label htmlFor="gameTitle">Name</label>
        <br />
        <input type="string" id="gameTitle" value={this.state.gameTitle} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeTitle(event.target.value)} />
      </div>
      <div className="component">
        <label htmlFor="gameScale">Scale</label>
        <br />
        <input type="number" id="gameScale" value={this.state.game.scale} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeScale(event.target.value)} />
      </div>
      <div className="component">
        <div style={{ width: "24em", margin: "auto" }}>
          {getTovelundMap(this.state.game, this.state.selectedElementType, this.state.selectedElementId, this.state.selectedIndexType, this.state.selectedIndex, this.selectDestination)}
        </div>
      </div>
      <div className="component">
        <div className="text">destination types:</div>
        {destinationTypeElements}
      </div>
      <div className="component">
        <div className="text">temp relationship:</div>
        {tempRelationship}
      </div>
      <div className="component">
        <div className="subtitle">game relationships:</div>
        {gameRelationships}
      </div>
      <div className="component">
        <div className="subtitle">game clues:</div>
      </div>
      <div className="component">
        <select value={this.state.selectedClueIndex} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.selectClueIndex(event.currentTarget.value)} style={{ width: "10em" }}>
          <option value={-1}>None</option>
          {clueOptions}
        </select>
      </div>
      <div className="component">
        <label htmlFor="clueDescription">Description</label>
        <br />
        <input type="text" id="clueDescription" value={this.state.selectedClueIndex === -1 ? "" : this.state.game.clues[this.state.selectedClueIndex].description} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeClueDescription(event.target.value)} />
      </div>
      <div className="component">
        <div className="text">{descriptionPreview}</div>
      </div>
      <div className="component">
        <select value={this.state.selectedRuleType} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.selectRuleType(event.currentTarget.value)} style={{ width: "10em" }}>
          <option value="RANGE">RANGE</option>
          <option value="RELATIONSHIP">RELATIONSHIP</option>
          <option value="OTHER">OTHER</option>
        </select>
      </div>
      <div className="component buttons">
        <button className="action" onClick={this.addRule}>Add Rule</button>
      </div>
      <div className="component">
        <select value={this.state.selectedRuleIndex} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.selectRuleIndex(event.currentTarget.value)} style={{ width: "10em" }}>
          <option value={-1}>NONE</option>
          {clueRules}
        </select>
      </div>
      {ruleSettings}
      <div className="component buttons">
        <button className="action" onClick={this.saveGame}>Save</button>
      </div>
      <div className="component">
        <div className="text">Selected Element Type: {this.state.selectedElementType}</div>
        <div className="text">Selected Element Id: {this.state.selectedElementId}</div>
        <div className="text">Selected Index Type: {this.state.selectedIndexType}</div>
        <div className="text">Selected Index: {this.state.selectedIndex}</div>
      </div>
    </div>;
  }
}
