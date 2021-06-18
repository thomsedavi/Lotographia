import * as React from "react";
import { TovelundEntity, TovelundGame, TovelundFeatureType, TovelundColor, TovelundElementType, TovelundSequenceRule, TovelundFeatureCollection, TovelundEntityGroup, TovelundRelationshipRule, TovelundQuantityRule, TovelundDistanceRule } from "./TovelundEnums";
import { TovelundGameClass } from "./TovelundGameClass";
import { getTovelundMap } from "./TovelundMap";
import { convertClueDescription } from "./TovelundUtils";

interface ErrorData {
  title: string
}

interface TovelundAdminState {
  mode: string,
  selectedGameId: number,
  games: { id: number, title: string }[],
  gameId?: number,
  gameTitle: string,
  game: TovelundGameClass,
  elementSymbol: string,
  elementName: string,
  selectedEntityId?: string,
  selectedElementType?: string,
  selectedElementId?: string,
  selectedFeatureCollectionId?: string,
  selectedEntityGroupId?: string,
  selectedEntityGroupTypeId?: string,
  fetchingData: boolean,
  errorMessage: string,
  selectedClueId?: string,
  selectedRuleType: string,
  selectedRuleId?: string,
  selectedAvailableFeatureType?: string,
  selectedAvailableFeatureName?: string,
  selectedAvailableFeatureSymbol?: string,
  selectedFeatureId?: string,
  highlightMode: string,
  solutionCount: number,
  quantitiesString: string,
  selectedSequenceIndex?: number
}

export class TovelundAdmin extends React.Component<any, TovelundAdminState> {
  constructor(props: any) {
    super(props);

    this.state = {
      mode: "LAYERS",
      selectedGameId: -1,
      games: [],
      gameTitle: "Duck Island",
      game: new TovelundGameClass(),
      elementSymbol: "",
      elementName: "NONE",
      fetchingData: false,
      errorMessage: "",
      selectedRuleType: "RELATIONSHIP",
      highlightMode: "ELEMENT",
      solutionCount: -1,
      quantitiesString: ""
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
            .then((data: { games: { id: number, title: string }[] }) => {
              this.setState({
                games: data.games
              });
            })
        }
      });
  }

  selectMode = (mode: string) => {
    this.setState({
      mode: mode
    });
  }

  changeTitle = (title: string) => {
    this.setState({
      gameTitle: title
    });
  }

  selectGame = (gameId: string) => {
    this.setState({
      selectedGameId: Number(gameId)
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
            .then((game: TovelundGame) => {
              this.setState({
                gameTitle: this.state.games.filter(g => g.id === this.state.selectedGameId)[0].title,
                game: new TovelundGameClass(game),
                gameId: this.state.selectedGameId,
                selectedEntityId: undefined,
                selectedElementType: undefined,
                selectedElementId: undefined,
                selectedEntityGroupId: undefined,
                selectedFeatureCollectionId: undefined,
                selectedClueId: undefined,
                selectedRuleId: undefined
              });
            })
        }
      });
  }

  addEntity = () => {
    if (this.state.selectedFeatureCollectionId) {
      const game = this.state.game;

      const entityId = game.addEntity(this.state.selectedFeatureCollectionId);

      this.setState({
        game: game,
        selectedEntityId: entityId,
        selectedElementType: undefined,
        selectedElementId: undefined
      });
    }
  }

  selectEntity = (entityId: string) => {
    this.setState({
      selectedEntityId: entityId,
      selectedElementType: undefined,
      selectedElementId: undefined
    });
  }

  setEntityFeatureCollection = (featureCollectionId: string) => {
    if (this.state.selectedEntityId) {
      const game = this.state.game;

      game.setEntityFeatureCollectionId(this.state.selectedEntityId, featureCollectionId);

      this.setState({
        game: game
      });
    }
  }


  selectEntityFeatureId = (featureId: string) => {
    if (this.state.selectedEntityId) {
      const game = this.state.game;

      game.setEntityFixedFeatureId(this.state.selectedEntityId, featureId === "NONE" ? undefined : featureId);

      this.setState({
        game: game
      });
    }
  }

  addRectangle = () => {
    if (this.state.selectedEntityId) {
      const game = this.state.game;

      const rectangleId = game.addRectangle(this.state.selectedEntityId);

      this.setState({
        game: game,
        selectedElementType: TovelundElementType.Rectangle,
        selectedElementId: rectangleId
      });
    }
  }

  addPoint = () => {
    if (this.state.selectedEntityId) {
      const game = this.state.game;

      const pointId = game.addPoint(this.state.selectedEntityId);

      this.setState({
        game: game,
        selectedElementType: TovelundElementType.Point,
        selectedElementId: pointId
      });
    }
  }

  addLine = () => {
    if (this.state.selectedEntityId) {
      const game = this.state.game;

      const lineId = game.addLine(this.state.selectedEntityId);

      this.setState({
        game: game,
        selectedElementType: TovelundElementType.Line,
        selectedElementId: lineId
      });
    }
  }

  addVertex = () => {
    if (this.state.selectedElementId) {
      const game = this.state.game;

      const vertexId = game.addVertex(this.state.selectedElementId);

      this.setState({
        game: game,
        selectedElementType: TovelundElementType.Vertex,
        selectedElementId: vertexId
      });
    }
  }

  addEntityGroupType = () => {
    const game = this.state.game;

    const entityGroupTypeId = game.addEntityGroupType();

    this.setState({
      game: game,
      selectedEntityGroupTypeId: entityGroupTypeId
    });
  }

  addEntityGroup = () => {
    if (this.state.selectedEntityGroupTypeId !== undefined) {
      const game = this.state.game;

      const entityGroupId = game.addEntityGroup(this.state.selectedEntityGroupTypeId);

      this.setState({
        game: game,
        selectedEntityGroupId: entityGroupId
      });
    }
  }

  deleteEntityGroup = () => {
    if (this.state.selectedEntityGroupId !== undefined) {
      const game = this.state.game;

      game.deleteEntityGroup(this.state.selectedEntityGroupId);

      this.setState({
        game: game,
        selectedEntityGroupId: undefined
      });
    }
  }

  addEntityToGroup = () => {
    if (this.state.selectedEntityGroupId) {
      if (this.state.selectedEntityId) {
        const game = this.state.game;

        game.addEntityToGroup(this.state.selectedEntityGroupId, this.state.selectedEntityId);

        this.setState({
          game: game
        });
      }
    }
  }

  addFeatureCollection = () => {
    const game = this.state.game;

    const featureCollectionId = game.addFeatureCollection();

    this.setState({
      game: game,
      selectedFeatureCollectionId: featureCollectionId
    });
  }

  addFeature = () => {
    const game = this.state.game;

    if (this.state.selectedFeatureCollectionId) {
      if (this.state.selectedAvailableFeatureType) {
        if (this.state.selectedAvailableFeatureSymbol) {
          if (this.state.selectedAvailableFeatureName) {
            game.addFeature(this.state.selectedFeatureCollectionId, this.state.selectedAvailableFeatureType, this.state.selectedAvailableFeatureName, this.state.selectedAvailableFeatureSymbol);
          }
        }
      }
    }

    this.setState({
      game: game,
      selectedAvailableFeatureType: undefined,
      selectedAvailableFeatureName: undefined,
      selectedAvailableFeatureSymbol: undefined
    });
  }

  delete = () => {
    const game = this.state.game;

    if (this.state.selectedElementId !== undefined) {
      if (this.state.selectedElementType === TovelundElementType.Point) {
        game.deletePoint(this.state.selectedElementId);
      }

      this.setState({
        game: game,
        selectedElementId: undefined,
        selectedElementType: undefined
      });

    } else if (this.state.selectedEntityId !== undefined) {
      console.log('here');

      game.deleteEntity(this.state.selectedEntityId);

      this.setState({
        game: game,
        selectedEntityId: undefined
      });
    }
  }

  selectFeatureCollection = (featureCollectionId: string) => {
    this.setState({
      selectedFeatureCollectionId: featureCollectionId,
      selectedFeatureId: undefined
    });
  }

  selectFeatureId = (featureId: string) => {
    this.setState({
      selectedFeatureId: featureId
    });
  }

  selectHighlightMode = (highlightMode: string) => {
    this.setState({
      highlightMode: highlightMode
    });
  }

  selectFeatureCollectionColor = (color: string) => {
    if (this.state.selectedFeatureCollectionId) {
      const game = this.state.game;

      game.setFeatureCollectionColor(this.state.selectedFeatureCollectionId, color);

      this.setState({
        game: game
      });
    }
  }

  changeAvailableFeatureName = (availableFeatureName: string) => {
    this.setState({
      selectedAvailableFeatureName: availableFeatureName
    });
  }

  selectAvailableFeatureType = (availableFeatureType: string) => {
    this.setState({
      selectedAvailableFeatureType: availableFeatureType
    });
  }

  selectAvailableFeatureName = (availableFeatureName: string) => {
    this.setState({
      selectedAvailableFeatureName: availableFeatureName
    });
  }

  selectAvailableFeatureSymbol = (availableFeatureSymbol: string) => {
    this.setState({
      selectedAvailableFeatureSymbol: availableFeatureSymbol
    });
  }

  changeFeatureCollectionName = (name: string) => {
    if (this.state.selectedFeatureCollectionId) {
      const game = this.state.game;

      game.changeFeatureCollectionName(this.state.selectedFeatureCollectionId, name);

      this.setState({
        game: game
      });
    }
  }

  selectElement = (value: string) => {
    const values = value.split("_");

    this.setState({
      selectedElementType: values[0],
      selectedElementId: values[1]
    });
  }

  selectEntityGroupType = (entityGroupTypeId: string) => {
    this.setState({
      selectedEntityGroupTypeId: entityGroupTypeId
    });
  }

  selectEntityGroup = (entityGroupId: string) => {
    this.setState({
      selectedEntityGroupId: entityGroupId
    });
  }

  selectElementShape = (shape: string) => {
    const game = this.state.game;

    if (this.state.selectedElementId) {
      if (this.state.selectedElementType === TovelundElementType.Rectangle) {
        game.setRectangleAttribute(this.state.selectedElementId, "Orientation", shape);
      } else if (this.state.selectedElementType === TovelundElementType.Point) {
        game.setPointAttribute(this.state.selectedElementId, "Size", shape);
      } else if (this.state.selectedElementType === TovelundElementType.Line) {
        const shapes = shape.split("_");

        game.setLineAttribute(this.state.selectedElementId, "IsClosed", shapes[0] === "CLOSED");
        game.setLineAttribute(this.state.selectedElementId, "IsBorder", shapes[1] === "BORDER");
      }
    }

    this.setState({
      game: game
    });
  }

  changeEntityName = (name: string) => {
    const game = this.state.game;

    if (this.state.selectedEntityId) {
      game.changeEntityName(this.state.selectedEntityId, name);
    }

    this.setState({
      game: game
    });
  }

  changeX = (x: string) => {
    if (this.state.selectedElementType !== undefined) {
      if (this.state.selectedElementId !== undefined) {
        const game = this.state.game;
      
        game.changeX(this.state.selectedElementType, this.state.selectedElementId, Number(x));
      
        this.setState({
          game: game
        });
      }
    }
  }

  changeY = (y: string) => {
    if (this.state.selectedElementType !== undefined) {
      if (this.state.selectedElementId !== undefined) {
        const game = this.state.game;
      
        game.changeY(this.state.selectedElementType, this.state.selectedElementId, Number(y));
      
        this.setState({
          game: game
        });
      }
    }
  }

  selectRuleType = (ruleType: string) => {
    this.setState({
      selectedRuleType: ruleType
    });
  }

  addClue = () => {
    const game = this.state.game;

    const clueId = game.addClue();

    this.setState({
      game: game,
      selectedClueId: clueId
    });
  }

  deleteClue = () => {
    const game = this.state.game;

    if (this.state.selectedClueId !== undefined) {
      game.deleteClue(this.state.selectedClueId);
    }

    this.setState({
      game: game,
      selectedClueId: undefined
    });
  }

  addRule = () => {
    if (this.state.selectedClueId) {
      const game = this.state.game;

      let ruleId: string | undefined;

      if (this.state.selectedRuleType === "RELATIONSHIP") {
        ruleId = game.addRelationshipRule(this.state.selectedClueId);
      } else if (this.state.selectedRuleType === "QUANTITY") {
        ruleId = game.addQuantityRule(this.state.selectedClueId);
      } else if (this.state.selectedRuleType === "DISTANCE") {
        ruleId = game.addDistanceRule(this.state.selectedClueId);
      } else if (this.state.selectedRuleType === "SEQUENCE") {
        ruleId = game.addSequenceRule(this.state.selectedClueId);
      }

      if (ruleId !== undefined) {
        this.setState({
          game: game,
          selectedRuleId: ruleId
        });
      } else {
        alert("failure");
      }
    }
  }

  deleteRule = () => {
    const game = this.state.game;

    if (this.state.selectedRuleId !== undefined) {
      game.deleteRule(this.state.selectedRuleId);
    }

    this.setState({
      game: game,
      selectedRuleId: undefined
    });
  }

  selectClueId = (clueId: string) => {
    this.setState({
      selectedClueId: clueId,
      selectedRuleId: undefined
    });
  }

  changeClueDescription = (description: string) => {
    const game = this.state.game;

    if (this.state.selectedClueId !== undefined) {
      game.changeClueDescription(this.state.selectedClueId, description);
    }

    this.setState({
      game: game
    });
  }

  moveClueUp = () => {
    const game = this.state.game;

    if (this.state.selectedClueId !== undefined) {
      game.moveClueUp(this.state.selectedClueId);
    }

    this.setState({
      game: game
    });
  }

  moveEntityUp = () => {
    const game = this.state.game;

    if (this.state.selectedEntityId !== undefined) {
      game.moveEntityUp(this.state.selectedEntityId);
    }

    this.setState({
      game: game
    });
  }

  selectRuleId = (ruleId: string) => {
    const rule = this.state.game.getRule(ruleId);

    if (rule.type === "QUANTITY") {
      const quantityRule = rule as TovelundQuantityRule;

      this.setState({
        selectedRuleId: ruleId,
        quantitiesString: quantityRule.quantities.join(",")
      });
    } else {
      this.setState({
        selectedRuleId: ruleId,
        selectedSequenceIndex: 0
      });
    }
  }

  selectRelationshipRuleMode = (mode: string) => {
    const game = this.state.game;

    if (this.state.selectedRuleId !== undefined) {
      game.setRelationshipRuleMode(this.state.selectedRuleId, mode);
    }

    this.setState({
      game: game
    });
  }

  selectRelationshipRuleLogic = (logic: string) => {
    const game = this.state.game;

    if (this.state.selectedRuleId !== undefined) {
      game.setRelationshipRuleLogic(this.state.selectedRuleId, logic);
    }

    this.setState({
      game: game
    });
  }

  addFeatureStartToRelationshipRule = () => {
    const game = this.state.game;

    if (this.state.selectedRuleId !== undefined) {
      if (this.state.selectedFeatureId !== undefined) {
        game.addFeatureStartToRelationshipRule(this.state.selectedRuleId, this.state.selectedFeatureId);
      }
    }

    this.setState({
      game: game
    });
  }

  addFeatureEndToRelationshipRule = () => {
    const game = this.state.game;

    if (this.state.selectedRuleId !== undefined) {
      if (this.state.selectedFeatureId !== undefined) {
        game.addFeatureEndToRelationshipRule(this.state.selectedRuleId, this.state.selectedFeatureId);
      }
    }

    this.setState({
      game: game
    });
  }

  addFeatureToQuantityRule = () => {
    const game = this.state.game;

    if (this.state.selectedRuleId !== undefined) {
      if (this.state.selectedFeatureId !== undefined) {
        game.addFeatureToQuantityRule(this.state.selectedRuleId, this.state.selectedFeatureId);
      }
    }

    this.setState({
      game: game
    });
  }

  changeQuantitiesOfQuantityRule = (quantitiesString: string) => {
    const game = this.state.game;

    if (this.state.selectedRuleId !== undefined) {
      const quantitiesSplit = quantitiesString.split(",");
      const quantities: number[] = [];

      quantitiesSplit.map((quantityString: string) => {
        const quantity = Number(quantityString);

        if (!isNaN(quantity) && quantity >= 0 && quantities.indexOf(quantity) === -1) {
          quantities.push(quantity);
        }
      });

      game.changeQuantitiesOfQuantityRule(this.state.selectedRuleId, quantities.sort());
    }

    this.setState({
      game: game,
      quantitiesString: quantitiesString
    });
  }

  selectDistanceRuleMode = (mode: string) => {
    const game = this.state.game;

    if (this.state.selectedRuleId !== undefined) {
      game.setDistanceRuleMode(this.state.selectedRuleId, mode);
    }

    this.setState({
      game: game
    });
  }

  addFeatureStartToDistanceRule = () => {
    const game = this.state.game;

    if (this.state.selectedRuleId !== undefined) {
      if (this.state.selectedFeatureId !== undefined) {
        game.addFeatureStartToDistanceRule(this.state.selectedRuleId, this.state.selectedFeatureId);
      }
    }

    this.setState({
      game: game
    });
  }

  addFeatureMiddleToDistanceRule = () => {
    const game = this.state.game;

    if (this.state.selectedRuleId !== undefined) {
      if (this.state.selectedFeatureId !== undefined) {
        game.addFeatureMiddleToDistanceRule(this.state.selectedRuleId, this.state.selectedFeatureId);
      }
    }

    this.setState({
      game: game
    });
  }

  addFeatureEndToDistanceRule = () => {
    const game = this.state.game;

    if (this.state.selectedRuleId !== undefined) {
      if (this.state.selectedFeatureId !== undefined) {
        game.addFeatureEndToDistanceRule(this.state.selectedRuleId, this.state.selectedFeatureId);
      }
    }

    this.setState({
      game: game
    });
  }

  selectSequenceRuleMode = (mode: string) => {
    const game = this.state.game;

    if (this.state.selectedRuleId !== undefined) {
      game.setSequenceRuleMode(this.state.selectedRuleId, mode);
    }

    this.setState({
      game: game
    });
  }

  selectSequenceCanRevisit = (canRevisit: string) => {
    const game = this.state.game;

    if (this.state.selectedRuleId !== undefined) {
      game.setSequenceCanRevisit(this.state.selectedRuleId, canRevisit === "CANREVISIT");
    }

    this.setState({
      game: game
    });
  }

  addIndexToSequenceRule = () => {
    const game = this.state.game;

    if (this.state.selectedRuleId !== undefined) {
      game.addIndexToSequenceRule(this.state.selectedRuleId);
    }

    this.setState({
      game: game
    });
  }

  selectSequenceIndex = (sequenceIndex: string) => {
    const index = sequenceIndex.split("_");

    this.setState({
      selectedSequenceIndex: Number(index[1])
    });
  }

  addFeatureToSequenceAtIndex = () => {
    const game = this.state.game;

    if (this.state.selectedRuleId !== undefined) {
      if (this.state.selectedFeatureId !== undefined) {
        if (this.state.selectedSequenceIndex !== undefined) {
          game.addFeatureToSequenceAtIndex(this.state.selectedRuleId, this.state.selectedSequenceIndex, this.state.selectedFeatureId);
        }
      }
    }

    this.setState({
      game: game
    });
  }

  changeScale = (scale: string) => {
    const game = this.state.game;

    game.setScale(Number(scale));

    this.setState({
      game: game
    });
  }

  countSolutions = () => {
    const game = this.state.game;

    const solutionCount = game.countSolutions();

    this.setState({
      solutionCount: solutionCount,
      game: game
    });
  }

  saveGame = () => {
    const game: TovelundGameClass = { ...this.state.game };

    game.clearMarkings();

    if (this.state.gameId) {
      fetch(`api/tovelund/${this.state.gameId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ "Title": this.state.gameTitle, "Design": game.getJSON() })
      })
        .then(response => { console.log(response) });
    } else {
      fetch("api/tovelund", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ "Title": this.state.gameTitle, "Design": game.getJSON() })
      })
        .then(response => { console.log(response) });
    }
  }

  render() {
    let x = 0;
    let y = 0;

    const shapeElements: JSX.Element[] = []
    let selectedShape: any = undefined;

    if (this.state.selectedElementType === TovelundElementType.Rectangle && this.state.selectedElementId) {
      const rectangle = this.state.game.getRectangle(this.state.selectedElementId);

      if (rectangle) {
        x = rectangle.x;
        y = rectangle.y;

        shapeElements.push(<option key="recangleHORIZONTAL" value="HORIZONTAL">HORIZONTAL</option>);
        shapeElements.push(<option key="recangleVERTICAL" value="VERTICAL">VERTICAL</option>);

        selectedShape = rectangle.attributes["Orientation"];
      }
    } else if (this.state.selectedElementType === TovelundElementType.Point && this.state.selectedElementId) {
      const point = this.state.game.getPoint(this.state.selectedElementId);

      if (point) {
        x = point.x;
        y = point.y;

        shapeElements.push(<option key="pointSMALL" value="SMALL">SMALL</option>);
        shapeElements.push(<option key="pointMEDIUM" value="MEDIUM">MEDIUM</option>);
        shapeElements.push(<option key="pointLARGE" value="LARGE">LARGE</option>);

        selectedShape = point.attributes["Size"];
      }
    } else if (this.state.selectedElementType === TovelundElementType.Line && this.state.selectedElementId) {
      const line = this.state.game.getLine(this.state.selectedElementId);

      if (line) {
        x = line.vertices[0].x;
        y = line.vertices[0].y;

        shapeElements.push(<option key="pointOPEN" value="OPEN_BORDER">Open, Border</option>);
        shapeElements.push(<option key="pointCLOSED" value="CLOSED_BORDER">Closed, Border</option>);
        shapeElements.push(<option key="pointOPEN" value="OPEN_NOTBORDER">Open, Not Border</option>);
        shapeElements.push(<option key="pointCLOSED" value="CLOSED_NOTBORDER">Closed, Not Border</option>);

        selectedShape = `${line.attributes["IsClosed"] ? "CLOSED" : "OPEN"}_${line.attributes["IsBorder"] ? "BORDER" : "NOTBORDER"}`;
      }
    } else if (this.state.selectedElementType === TovelundElementType.Vertex && this.state.selectedElementId) {
      const vertex = this.state.game.getVertex(this.state.selectedElementId);

      if (vertex) {
        x = vertex.x;
        y = vertex.y;
      }
    }

    const entityElements = this.state.game.getEntities().map((entity: TovelundEntity, index: number) => <option key={`entityOption${entity.id}`} value={entity.id}>
      {entity.name}
    </option>);

    let entityGroupElements: JSX.Element[] = this.state.game.getEntityGroups().map((group: TovelundEntityGroup) => <option key={`entityGroup${group.id}`} value={group.id}>
      {group.id}: {group.entityGroupTypeId}
    </option>);

    let entityGroupTypeElements: JSX.Element[] = this.state.game.getEntityGroupTypes().map((groupType: { id: string, name: string }) => <option key={`entityGroupType${groupType.id}`} value={groupType.id}>
      {groupType.id}: {groupType.name}
    </option>);

    let groupEntityElements: JSX.Element[] = [];

    if (this.state.selectedEntityGroupId) {
      groupEntityElements = this.state.game.getEntityGroup(this.state.selectedEntityGroupId).entityIds.map((entityId: string) => <div key={`groupEntity${entityId}`}>
        {this.state.game.getEntity(entityId).name}
      </div>);
    }

    let entityFeatureElements: JSX.Element[] = [];

    if (this.state.selectedEntityId) {
      entityFeatureElements.push(<option key={`entityType"NONE"`} value="NONE">
        NONE
      </option>);

      const entity = this.state.game.getEntity(this.state.selectedEntityId);

      const featureCollection = this.state.game.getFeatureCollection(entity.featureCollectionId);

      featureCollection.set.map((feature: { id: string, type: string, name: string }) => {
        entityFeatureElements.push(<option key={`entityId${feature.id}`} value={feature.id}>
          {feature.type}
        </option>);
      });
    }

    const featureCollectionElements = this.state.game.getFeatureCollections().map((collection: TovelundFeatureCollection) => <option key={`symbolOption${collection.id}`} value={collection.id}>
      {collection.name}
    </option>);

    const featureCollectionColorElements: JSX.Element[] = [];
    const collectionFeatureElements: JSX.Element[] = [];

    if (this.state.selectedFeatureCollectionId) {
      const featureCollection = this.state.game.getFeatureCollection(this.state.selectedFeatureCollectionId);

      featureCollection.set.map((feature: { id: string, name: string, symbol: string }, index: number) => {
        collectionFeatureElements.push(<option key={`featureName${index}`} value={feature.id}>
          {feature.symbol}: {feature.name}
        </option>);
      });

      Object.values(TovelundColor).map((color: string) => {
        featureCollectionColorElements.push(<option key={`featureColor${color}`} value={color} style={{ backgroundColor: color }}>
          {color}
        </option>);
      });
    }

    const availableFeatureTypeElements = Object.values(TovelundFeatureType).map((type: string) => <option key={`entityType_${type}`} value={type}>
      {type}
    </option>);

    const availableFeatureSymbolElements = this.state.game.getAvailableFeatureSymbols().map((featureSymbol: string) => <option key={`entitySybmol_${featureSymbol}`} value={featureSymbol}>
      {featureSymbol}
    </option>)

    const elementElements: JSX.Element[] = [];

    if (this.state.selectedEntityId) {
      const entity = this.state.game.getEntity(this.state.selectedEntityId);

      if (entity.rectangle) {
        elementElements.push(<option key={`rectangle${entity.rectangle.id}`} value={`${TovelundElementType.Rectangle}_${entity.rectangle.id}`}>
          Rectangle
        </option>);
      }

      entity.points.map((point: { id: string }, index: number) => {
        elementElements.push(<option key={`point${point.id}`} value={`${TovelundElementType.Point}_${point.id}`}>
          Point {index + 1}
        </option>);
      });

      entity.lines.map((line: { id: string, vertices: { id: string }[] }, lineIndex: number) => {
        elementElements.push(<option key={`line${line.id}`} value={`${TovelundElementType.Line}_${line.id}`}>
          Line {lineIndex + 1}
        </option>);

        line.vertices.map((vertex: { id: string }, vertexIndex: number) => {
          elementElements.push(<option key={`vertex${vertex.id}`} value={`${TovelundElementType.Vertex}_${vertex.id}`}>
            Line {lineIndex + 1} Vertex {vertexIndex + 1}
          </option>);
        });
      });
    }

    const gameOptions: JSX.Element[] = this.state.games.map((game: { id: number, title: string }) =>
      <option key={`gameId${game.id}`} value={game.id}>{game.title}</option>
    );

    const clueElements: JSX.Element[] = this.state.game.getClues().map((clue: { id: string, description: string }, index: number) => <option key={`clue${clue.id}`} value={clue.id}>
      {index}: {clue.description}
    </option>);

    const ruleElements: JSX.Element[] = [];

    if (this.state.selectedClueId) {
      const clue = this.state.game.getClue(this.state.selectedClueId);

      clue.rules.map((rule: { id: string, type: string }) => {
        ruleElements.push(<option key={`rule${rule.id}`} value={rule.id}>
          {rule.id}: {rule.type}
        </option>);
      });
    }

    const selectedElementIds: string[] = [];

    if (this.state.highlightMode === "ELEMENT" && this.state.selectedElementId !== undefined) {
      selectedElementIds.push(this.state.selectedElementId);
    } else if (this.state.highlightMode === "GROUP" && this.state.selectedEntityGroupId !== undefined) {
      const group = this.state.game.getEntityGroup(this.state.selectedEntityGroupId);

      group.entityIds.map((entityId: string) => {
        const entity = this.state.game.getEntity(entityId);

        entity.points.map((point: { id: string }) => {
          selectedElementIds.push(point.id);
        });

        entity.lines.map((line: { id: string }) => {
          selectedElementIds.push(line.id);
        });

        if (entity.rectangle !== undefined) {
          selectedElementIds.push(entity.rectangle.id);
        }
      });
    }

    const entitySelector = <div className="component">
      <select value={this.state.selectedEntityId ? this.state.selectedEntityId : "NONE"} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.selectEntity(event.currentTarget.value)} style={{ width: "10em" }}>
        <option disabled value="NONE">None</option>
        {entityElements}
      </select>
    </div>;

    const elementSelector = <div className="component">
      <select value={this.state.selectedElementType !== undefined ? `${this.state.selectedElementType}_${this.state.selectedElementId}` : "NONE"} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.selectElement(event.currentTarget.value)} style={{ width: "10em" }}>
        <option disabled value="NONE">None</option>
        {elementElements}
      </select>
    </div>;

    let ruleDetails: JSX.Element = <div className="component">
      <div className="information">No feature selected</div>
    </div>;

    if (this.state.selectedRuleId !== undefined) {
      const rule = this.state.game.getRule(this.state.selectedRuleId);

      if (rule.type === "RELATIONSHIP") {
        const relationshipRule = rule as TovelundRelationshipRule;

        ruleDetails = <>
          <div className="component">
            <div className="information">Group Type: {relationshipRule.entityGroupTypeIds}</div>
          </div>
          <div className="component">
            <select value={relationshipRule.mode} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.selectRelationshipRuleMode(event.currentTarget.value)} style={{ width: "10em" }}>
              <option value="INCLUDE">INCLUDE</option>
              <option value="EXCLUDE">EXCLUDE</option>
            </select>
          </div>
          <div className="component">
            <select value={relationshipRule.logic} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.selectRelationshipRuleLogic(event.currentTarget.value)} style={{ width: "10em" }}>
              <option value="AND">AND</option>
              <option value="OR">OR</option>
              <option value="XOR">XOR</option>
            </select>
          </div>
          <div className="component buttons">
            <button className="action" onClick={this.addFeatureStartToRelationshipRule} disabled={this.state.selectedFeatureId === undefined}>Add FeatureStartId</button>
            <button className="action" onClick={this.addFeatureEndToRelationshipRule} disabled={this.state.selectedFeatureId === undefined}>Add FeatureEndId</button>
          </div>
          <div className="component">
            <div className="information">Feature Starts: {relationshipRule.featureStartIds.map((id: string) => this.state.game.getFeature(id).name)}</div>
            <div className="information">Feature Ends: {relationshipRule.featureEndIds.map((id: string) => this.state.game.getFeature(id).name)}</div>
          </div>
        </>;
      } else if (rule.type === "QUANTITY") {
        const quantityRule = rule as TovelundQuantityRule;

        ruleDetails = <>
          <div className="component buttons">
            <button className="action" onClick={this.addFeatureToQuantityRule} disabled={this.state.selectedFeatureId === undefined}>Add FeatureId</button>
          </div>
          <div className="component">
            <label htmlFor="quantities">Quantities</label>
            <br />
            <input type="string" id="quantities" value={this.state.quantitiesString} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeQuantitiesOfQuantityRule(event.target.value)} />
          </div>
          <div className="component">
            <div className="information">Features: {quantityRule.featureIds.map(featureId => this.state.game.getFeature(featureId).name).join(",")}</div>
          </div>
          <div className="component">
            <div className="information">Quantities: {quantityRule.quantities.join(",")}</div>
          </div>
        </>;
      } else if (rule.type === "DISTANCE") {
        const distanceRule = rule as TovelundDistanceRule;

        ruleDetails = <>
          <div className="component">
            <select value={distanceRule.mode} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.selectDistanceRuleMode(event.currentTarget.value)} style={{ width: "10em" }}>
              <option value="MATCH">MATCH</option>
              <option value="MISMATCH">MISMATCH</option>
            </select>
          </div>
          <div className="component buttons">
            <button className="action" onClick={this.addFeatureStartToDistanceRule} disabled={this.state.selectedFeatureId === undefined}>Add Feature Start Id</button>
            <button className="action" onClick={this.addFeatureMiddleToDistanceRule} disabled={this.state.selectedFeatureId === undefined}>Add Feature Middle Id</button>
            <button className="action" onClick={this.addFeatureEndToDistanceRule} disabled={this.state.selectedFeatureId === undefined}>Add Feature End Id</button>
          </div>
          <div className="component">
            <div className="information">Feature Starts: {distanceRule.featureStartIds.map((id: string) => this.state.game.getFeature(id).name)}</div>
          </div>
          <div className="component">
            <div className="information">Feature Middles: {distanceRule.featureMiddleIds.map((id: string) => this.state.game.getFeature(id).name)}</div>
          </div>
          <div className="component">
            <div className="information">Feature Ends: {distanceRule.featureEndIds.map((id: string) => this.state.game.getFeature(id).name)}</div>
          </div>
        </>;
      } else if (rule.type === "SEQUENCE") {
        const sequenceRule = rule as TovelundSequenceRule;
        const sequenceElements = sequenceRule.featureIds.map((_featureIds: string[], index: number) => <option key={`SequenceIndex_${index}`} value={`SequenceIndex_${index}`}>
          Sequence Index {index}
        </option>);

        ruleDetails = <>
          <div className="component">
            <select value={sequenceRule.mode} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.selectSequenceRuleMode(event.currentTarget.value)} style={{ width: "10em" }}>
              <option value="MATCH">Match</option>
              <option value="MISMATCH">Mismatch</option>
            </select>
          </div>
          <div className="component">
            <select value={sequenceRule.canRevisit ? "CANREVISIT" : "CANNOTREVISIT"} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.selectSequenceCanRevisit(event.currentTarget.value)} style={{ width: "10em" }}>
              <option value="CANREVISIT">Can Revisit</option>
              <option value="CANNOTREVISIT">Cannot Revisit</option>
            </select>
          </div>
          <div className="component buttons">
            <button className="action" onClick={this.addIndexToSequenceRule}>Add Index To Sequence Rule</button>
          </div>
          <div className="component">
            <select value={`SequenceIndex_${this.state.selectedSequenceIndex}`} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.selectSequenceIndex(event.currentTarget.value)} style={{ width: "10em" }}>
              {sequenceElements}
            </select>
          </div>
          <div className="component buttons">
            <button className="action" onClick={this.addFeatureToSequenceAtIndex}>Add Feature To Sequence At Index</button>
          </div>
          {this.state.selectedSequenceIndex !== undefined && < div className="component">
            <div className="information">Features: {sequenceRule.featureIds[this.state.selectedSequenceIndex].map(featureId => this.state.game.getFeature(featureId).name).join(",")}</div>
          </div>}
        </>;
      }
    }

    return <div className="section">
      <div className="component">
        <select value={this.state.mode} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.selectMode(event.currentTarget.value)} style={{ width: "10em" }}>
          <option value="LAYERS">Layers</option>
          <option value="GROUPS">Groups</option>
          <option value="FEATURES">Features</option>
          <option value="CLUES">Clues</option>
        </select>
      </div>
      <hr />
      {this.state.mode === "LAYERS" && <>
        <div className="component buttons">
          <button className="action" onClick={this.addEntity} disabled={this.state.selectedFeatureCollectionId === undefined}>Add Entity</button>
          <button className="action" onClick={this.moveEntityUp}>Move Entity Up</button>
          <button className="action" onClick={this.addRectangle} disabled={this.state.selectedEntityId === undefined || this.state.game.getEntity(this.state.selectedEntityId).rectangle !== undefined}>Add Rectangle</button>
          <button className="action" onClick={this.addPoint} disabled={this.state.selectedEntityId === undefined}>Add Point</button>
          <button className="action" onClick={this.addLine} disabled={this.state.selectedEntityId === undefined}>Add Line</button>
          <button className="action" onClick={this.addVertex} disabled={!(this.state.selectedElementType === TovelundElementType.Line || this.state.selectedElementType === TovelundElementType.Vertex) || this.state.selectedElementId === undefined}>Add Vertex</button>
          <button className="action" onClick={this.delete}>Delete</button>
        </div>
        {entitySelector}
        <div className="component">
          <select value={this.state.selectedEntityId ? (this.state.game.getEntity(this.state.selectedEntityId).featureCollectionId) : "NONE"} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.setEntityFeatureCollection(event.currentTarget.value)} style={{ width: "10em" }}>
            {featureCollectionElements}
          </select>
        </div>
        <div className="component">
          <select value={this.state.selectedEntityId ? (this.state.game.getEntity(this.state.selectedEntityId).fixedFeatureId ? this.state.game.getEntity(this.state.selectedEntityId).fixedFeatureId : "NONE") : "NONE"} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.selectEntityFeatureId(event.currentTarget.value)} style={{ width: "10em" }}>
            {entityFeatureElements}
          </select>
        </div>
        {elementSelector}
        <div className="component">
          <select value={selectedShape} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.selectElementShape(event.currentTarget.value)} style={{ width: "10em" }}>
            {shapeElements}
          </select>
        </div>
        {this.state.selectedEntityId !== undefined && <div className="component">
          <label htmlFor="name">Name</label>
          <br />
          <input type="text" id="name" defaultValue={this.state.game.getEntity(this.state.selectedEntityId).name} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeEntityName(event.target.value)} />
        </div>}
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
          <label htmlFor="gameScale">Scale</label>
          <br />
          <input type="number" id="gameScale" value={this.state.game.getScale()} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeScale(event.target.value)} min={50} max={150} />
        </div>
      </>}
      {this.state.mode === "GROUPS" && <>
        <div className="component buttons">
          <button className="action" onClick={this.addEntityGroupType}>Add Entity Group Type</button>
        </div>
        <div className="component">
          <select value={this.state.selectedEntityGroupTypeId ? this.state.selectedEntityGroupTypeId : "NONE"} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.selectEntityGroupType(event.currentTarget.value)} style={{ width: "10em" }}>
            <option disabled value="NONE">None</option>
            {entityGroupTypeElements}
          </select>
        </div>
        <div className="component buttons">
          <button className="action" onClick={this.addEntityGroup}>Add Entity Group</button>
          <button className="action" onClick={this.deleteEntityGroup}>Delete Entity Group</button>
          <button className="action" onClick={this.addEntityToGroup} disabled={this.state.selectedEntityId === undefined}>Add Entity To Group</button>
        </div>
        {this.state.selectedEntityGroupId !== undefined && <div className="component">
          <div className="information">
            {this.state.game.getEntityGroupType(this.state.game.getEntityGroup(this.state.selectedEntityGroupId).entityGroupTypeId).name}
          </div>
        </div>}
        <div className="component">
          {groupEntityElements}
        </div>
        <div className="component">
          <select value={this.state.selectedEntityGroupId ? this.state.selectedEntityGroupId : "NONE"} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.selectEntityGroup(event.currentTarget.value)} style={{ width: "10em" }}>
            <option disabled value="NONE">None</option>
            {entityGroupElements}
          </select>
        </div>
      </>}
      {this.state.mode === "FEATURES" && <>
        <div className="component buttons">
          <button className="action" onClick={this.addFeatureCollection}>Add Feature Collection</button>
        </div>
        <div className="component">
          <select value={this.state.selectedFeatureCollectionId ? this.state.selectedFeatureCollectionId : "NONE"} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.selectFeatureCollection(event.currentTarget.value)} style={{ width: "10em" }}>
            <option disabled value="NONE">None</option>
            {featureCollectionElements}
          </select>
        </div>
        <div className="component">
          <label htmlFor="featureCollectionName">Feature Collection Name</label>
          <br />
          <input type="string" id="featureCollectionName" value={this.state.selectedFeatureCollectionId ? this.state.game.getFeatureCollection(this.state.selectedFeatureCollectionId).name : undefined} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeFeatureCollectionName(event.target.value)} />
        </div>
        <div className="component">
          <select value={this.state.selectedFeatureCollectionId ? this.state.game.getFeatureCollection(this.state.selectedFeatureCollectionId).color : undefined} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.selectFeatureCollectionColor(event.currentTarget.value)} style={{ width: "10em" }}>
            {featureCollectionColorElements}
          </select>
        </div>
        <div className="component">
          <select value={this.state.selectedFeatureId ? this.state.selectedFeatureId : "NONE"} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.selectFeatureId(event.currentTarget.value)} style={{ width: "10em" }}>
            <option disabled value="NONE">None</option>
            {collectionFeatureElements}
          </select>
        </div>
        <div className="component">
          <label htmlFor="featureName">Feature Name</label>
          <br />
          <input type="text" id="featureName" value={this.state.selectedAvailableFeatureName} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeAvailableFeatureName(event.target.value)} />
        </div>
        <div className="component">
          <select value={this.state.selectedAvailableFeatureType} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.selectAvailableFeatureType(event.currentTarget.value)} style={{ width: "10em" }}>
            {availableFeatureTypeElements}
          </select>
        </div>
        <div className="component">
          <select value={this.state.selectedAvailableFeatureSymbol} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.selectAvailableFeatureSymbol(event.currentTarget.value)} style={{ width: "10em" }}>
            {availableFeatureSymbolElements}
          </select>
        </div>
        <div className="component buttons">
          <button className="action" onClick={this.addFeature} disabled={this.state.selectedFeatureCollectionId === undefined || this.state.game.getFeatureCollection(this.state.selectedFeatureCollectionId).set.length === 8 || this.state.selectedAvailableFeatureType === undefined || this.state.selectedAvailableFeatureName === undefined || this.state.selectedAvailableFeatureSymbol === undefined}>Add Feature Type</button>
        </div>
      </>}
      {this.state.mode === "CLUES" && <>
        <div className="component buttons">
          <button className="action" onClick={this.addClue}>Add Clue</button>
          <button className="action" onClick={this.deleteClue}>Delete Clue</button>
        </div>
        <div className="component">
          <select value={this.state.selectedClueId !== undefined ? this.state.selectedClueId : "NONE"} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.selectClueId(event.currentTarget.value)} style={{ width: "10em" }}>
            <option value="NONE" disabled>None</option>
            {clueElements}
          </select>
        </div>
        {this.state.selectedClueId !== undefined && <>
          <div className="component buttons">
            <button className="action" onClick={this.moveClueUp}>Move Clue Up</button>
          </div>
          <div className="component">
            <label htmlFor="clueDescription">Clue Description</label>
            <br />
            <input type="text" id="clueDescription" value={this.state.game.getClue(this.state.selectedClueId).description} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeClueDescription(event.target.value)} />
          </div>
          <div className="component">
            <div className="information">
              {convertClueDescription(this.state.game.getClue(this.state.selectedClueId).description)}
            </div>
          </div>
        </>}
        <div className="component">
          <select value={this.state.selectedRuleType} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.selectRuleType(event.currentTarget.value)} style={{ width: "10em" }}>
            <option value="RELATIONSHIP">Relationship</option>
            <option value="QUANTITY">Quantity</option>
            <option value="DISTANCE">Distance</option>
            <option value="SEQUENCE">Sequence</option>
          </select>
        </div>
        <div className="component buttons">
          <button className="action" onClick={this.addRule} disabled={this.state.selectedClueId === undefined}>Add Rule</button>
          <button className="action" onClick={this.deleteRule} disabled={this.state.selectedRuleId === undefined}>Delete Rule</button>
        </div>
        <div className="component">
          <select value={this.state.selectedRuleId !== undefined ? this.state.selectedRuleId : "NONE"} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.selectRuleId(event.currentTarget.value)} style={{ width: "10em" }}>
            <option value="NONE" disabled>None</option>
            {ruleElements}
          </select>
        </div>
        {ruleDetails}
      </>}
      <hr />
      <div className="component">
        <select value={this.state.highlightMode} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.selectHighlightMode(event.currentTarget.value)} style={{ width: "10em" }}>
          <option key="ELEMENT" value="ELEMENT">Element</option>
          <option key="ENTITY" value="ENTITY">Entity</option>
          <option key="GROUP" value="GROUP">Group</option>
          <option key="LAYER" value="LAYER">Layer</option>
        </select>
      </div>
      <div className="component">
        <div style={{ width: "24em", margin: "auto" }}>
          {getTovelundMap(this.state.game, this.selectEntity, selectedElementIds, true)}
        </div>
      </div>
      <div className="component">
        <label htmlFor="gameTitle">Game Title</label>
        <br />
        <input type="string" id="gameTitle" value={this.state.gameTitle} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeTitle(event.target.value)} />
      </div>
      <div className="component buttons">
        <button className="action" onClick={this.countSolutions}>Count Solutions</button>
        <button className="action" onClick={this.saveGame}>Save</button>
      </div>
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
        <div className="text">Solution Count: {this.state.solutionCount}</div>
        <div className="text">Selected Entity Id: {this.state.selectedEntityId}</div>
        <div className="text">Selected Feature Type: {this.state.selectedElementType}</div>
        <div className="text">Selected Feature Id: {this.state.selectedElementId}</div>
        <div className="text">Selected Entity Type: {this.state.selectedEntityId && this.state.game.getEntity(this.state.selectedEntityId).fixedFeatureId}</div>
      </div>
      <div className="component buttons">
        <button className="action" onClick={() => { console.log(this.state.game.game) }}>Console Log</button>
      </div>
    </div>;
  }
}
