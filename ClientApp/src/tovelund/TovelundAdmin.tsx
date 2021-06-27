import * as React from "react";
import { TovelundEntity, TovelundPuzzleDesign, TovelundFeatureType, TovelundElementType, TovelundSequenceRule, TovelundFeatureCollection, TovelundEntityGroup, TovelundRelationshipRule, TovelundQuantityRule, TovelundDistanceRule } from "./TovelundEnums";
import { TovelundPuzzleDesignClass } from "./TovelundPuzzleDesignClass";
import { getTovelundMap } from "./TovelundMap";
import { convertClueDescription } from "./TovelundUtils";
import { LotographiaColor } from "../common/Colors";

interface ErrorData {
  title: string
}

interface TovelundAdminState {
  mode: string,
  selectedPuzzleId: number,
  puzzles: { id: number, title: string, difficulty: number }[],
  puzzleId?: number,
  puzzleTitle: string,
  puzzleDifficulty: number,
  puzzle: TovelundPuzzleDesignClass,
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
      selectedPuzzleId: -1,
      puzzles: [],
      puzzleTitle: "Duck Island",
      puzzleDifficulty: 1,
      puzzle: new TovelundPuzzleDesignClass(),
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
    fetch("api/tovelundpuzzles", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then((response: Response) => {
        if (response.status === 200) {
          response.json()
            .then((data: { puzzles: { id: number, title: string, difficulty: number }[] }) => {
              this.setState({
                puzzles: data.puzzles
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
      puzzleTitle: title
    });
  }

  changeDifficulty = (difficulty: string) => {
    this.setState({
      puzzleDifficulty: Number(difficulty)
    });
  }

  selectPuzzle = (puzzleId: string) => {
    this.setState({
      selectedPuzzleId: Number(puzzleId)
    });
  }

  loadPuzzle = () => {
    fetch(`api/tovelundpuzzles/${this.state.selectedPuzzleId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then((response: Response) => {
        if (response.status === 200) {
          response.json()
            .then((puzzle: TovelundPuzzleDesign) => {
              this.setState({
                puzzleTitle: this.state.puzzles.filter(g => g.id === this.state.selectedPuzzleId)[0].title,
                puzzleDifficulty: this.state.puzzles.filter(g => g.id === this.state.selectedPuzzleId)[0].difficulty,
                puzzle: new TovelundPuzzleDesignClass(puzzle),
                puzzleId: this.state.selectedPuzzleId,
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
      const puzzle = this.state.puzzle;

      const entityId = puzzle.addEntity(this.state.selectedFeatureCollectionId);

      this.setState({
        puzzle: puzzle,
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
      const puzzle = this.state.puzzle;

      puzzle.setEntityFeatureCollectionId(this.state.selectedEntityId, featureCollectionId);

      this.setState({
        puzzle: puzzle
      });
    }
  }


  selectEntityFeatureId = (featureId: string) => {
    if (this.state.selectedEntityId) {
      const puzzle = this.state.puzzle;

      puzzle.setEntityFixedFeatureId(this.state.selectedEntityId, featureId === "NONE" ? undefined : featureId);

      this.setState({
        puzzle: puzzle
      });
    }
  }

  addRectangle = () => {
    if (this.state.selectedEntityId) {
      const puzzle = this.state.puzzle;

      const rectangleId = puzzle.addRectangle(this.state.selectedEntityId);

      this.setState({
        puzzle: puzzle,
        selectedElementType: TovelundElementType.Rectangle,
        selectedElementId: rectangleId
      });
    }
  }

  addPoint = () => {
    if (this.state.selectedEntityId) {
      const puzzle = this.state.puzzle;

      const pointId = puzzle.addPoint(this.state.selectedEntityId);

      this.setState({
        puzzle: puzzle,
        selectedElementType: TovelundElementType.Point,
        selectedElementId: pointId
      });
    }
  }

  addLine = () => {
    if (this.state.selectedEntityId) {
      const puzzle = this.state.puzzle;

      const lineId = puzzle.addLine(this.state.selectedEntityId);

      this.setState({
        puzzle: puzzle,
        selectedElementType: TovelundElementType.Line,
        selectedElementId: lineId
      });
    }
  }

  addVertex = () => {
    if (this.state.selectedElementId) {
      const puzzle = this.state.puzzle;

      const vertexId = puzzle.addVertex(this.state.selectedElementId);

      this.setState({
        puzzle: puzzle,
        selectedElementType: TovelundElementType.Vertex,
        selectedElementId: vertexId
      });
    }
  }

  addEntityGroupType = () => {
    const puzzle = this.state.puzzle;

    const entityGroupTypeId = puzzle.addEntityGroupType();

    this.setState({
      puzzle: puzzle,
      selectedEntityGroupTypeId: entityGroupTypeId
    });
  }

  addEntityGroup = () => {
    if (this.state.selectedEntityGroupTypeId !== undefined) {
      const puzzle = this.state.puzzle;

      const entityGroupId = puzzle.addEntityGroup(this.state.selectedEntityGroupTypeId);

      this.setState({
        puzzle: puzzle,
        selectedEntityGroupId: entityGroupId
      });
    }
  }

  deleteEntityGroup = () => {
    if (this.state.selectedEntityGroupId !== undefined) {
      const puzzle = this.state.puzzle;

      puzzle.deleteEntityGroup(this.state.selectedEntityGroupId);

      this.setState({
        puzzle: puzzle,
        selectedEntityGroupId: undefined
      });
    }
  }

  addEntityToGroup = () => {
    if (this.state.selectedEntityGroupId) {
      if (this.state.selectedEntityId) {
        const puzzle = this.state.puzzle;

        puzzle.addEntityToGroup(this.state.selectedEntityGroupId, this.state.selectedEntityId);

        this.setState({
          puzzle: puzzle
        });
      }
    }
  }

  addFeatureCollection = () => {
    const puzzle = this.state.puzzle;

    const featureCollectionId = puzzle.addFeatureCollection();

    this.setState({
      puzzle: puzzle,
      selectedFeatureCollectionId: featureCollectionId
    });
  }

  addFeature = () => {
    const puzzle = this.state.puzzle;

    if (this.state.selectedFeatureCollectionId) {
      if (this.state.selectedAvailableFeatureType) {
        if (this.state.selectedAvailableFeatureSymbol) {
          if (this.state.selectedAvailableFeatureName) {
            puzzle.addFeature(this.state.selectedFeatureCollectionId, this.state.selectedAvailableFeatureType, this.state.selectedAvailableFeatureName, this.state.selectedAvailableFeatureSymbol);
          }
        }
      }
    }

    this.setState({
      puzzle: puzzle,
      selectedAvailableFeatureType: undefined,
      selectedAvailableFeatureName: undefined,
      selectedAvailableFeatureSymbol: undefined
    });
  }

  deleteFeature = () => {
    if (this.state.selectedFeatureId !== undefined) {
      const puzzle = this.state.puzzle;

      puzzle.deleteFeature(this.state.selectedFeatureId);

      this.setState({
        puzzle: puzzle,
        selectedFeatureId: undefined,
      });
    }
  }

  delete = () => {
    const puzzle = this.state.puzzle;

    if (this.state.selectedElementId !== undefined) {
      if (this.state.selectedElementType === TovelundElementType.Point) {
        puzzle.deletePoint(this.state.selectedElementId);
      }

      this.setState({
        puzzle: puzzle,
        selectedElementId: undefined,
        selectedElementType: undefined
      });

    } else if (this.state.selectedEntityId !== undefined) {
      console.log('here');

      puzzle.deleteEntity(this.state.selectedEntityId);

      this.setState({
        puzzle: puzzle,
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
      const puzzle = this.state.puzzle;

      puzzle.setFeatureCollectionColor(this.state.selectedFeatureCollectionId, color);

      this.setState({
        puzzle: puzzle
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
      const puzzle = this.state.puzzle;

      puzzle.changeFeatureCollectionName(this.state.selectedFeatureCollectionId, name);

      this.setState({
        puzzle: puzzle
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
    const puzzle = this.state.puzzle;

    if (this.state.selectedElementId) {
      if (this.state.selectedElementType === TovelundElementType.Rectangle) {
        puzzle.setRectangleAttribute(this.state.selectedElementId, "Orientation", shape);
      } else if (this.state.selectedElementType === TovelundElementType.Point) {
        puzzle.setPointAttribute(this.state.selectedElementId, "Size", shape);
      } else if (this.state.selectedElementType === TovelundElementType.Line) {
        const shapes = shape.split("_");

        puzzle.setLineAttribute(this.state.selectedElementId, "IsClosed", shapes[0] === "CLOSED");
        puzzle.setLineAttribute(this.state.selectedElementId, "IsBorder", shapes[1] === "BORDER");
      }
    }

    this.setState({
      puzzle: puzzle
    });
  }

  changeEntityName = (name: string) => {
    const puzzle = this.state.puzzle;

    if (this.state.selectedEntityId) {
      puzzle.changeEntityName(this.state.selectedEntityId, name);
    }

    this.setState({
      puzzle: puzzle
    });
  }

  changeX = (x: string) => {
    if (this.state.selectedElementType !== undefined) {
      if (this.state.selectedElementId !== undefined) {
        const puzzle = this.state.puzzle;
      
        puzzle.changeX(this.state.selectedElementType, this.state.selectedElementId, Number(x));
      
        this.setState({
          puzzle: puzzle
        });
      }
    }
  }

  changeY = (y: string) => {
    if (this.state.selectedElementType !== undefined) {
      if (this.state.selectedElementId !== undefined) {
        const puzzle = this.state.puzzle;
      
        puzzle.changeY(this.state.selectedElementType, this.state.selectedElementId, Number(y));
      
        this.setState({
          puzzle: puzzle
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
    const puzzle = this.state.puzzle;

    const clueId = puzzle.addClue();

    this.setState({
      puzzle: puzzle,
      selectedClueId: clueId
    });
  }

  deleteClue = () => {
    const puzzle = this.state.puzzle;

    if (this.state.selectedClueId !== undefined) {
      puzzle.deleteClue(this.state.selectedClueId);
    }

    this.setState({
      puzzle: puzzle,
      selectedClueId: undefined
    });
  }

  addRule = () => {
    if (this.state.selectedClueId) {
      const puzzle = this.state.puzzle;

      let ruleId: string | undefined;

      if (this.state.selectedRuleType === "RELATIONSHIP") {
        ruleId = puzzle.addRelationshipRule(this.state.selectedClueId);
      } else if (this.state.selectedRuleType === "QUANTITY") {
        ruleId = puzzle.addQuantityRule(this.state.selectedClueId);
      } else if (this.state.selectedRuleType === "DISTANCE") {
        ruleId = puzzle.addDistanceRule(this.state.selectedClueId);
      } else if (this.state.selectedRuleType === "SEQUENCE") {
        ruleId = puzzle.addSequenceRule(this.state.selectedClueId);
      }

      if (ruleId !== undefined) {
        this.setState({
          puzzle: puzzle,
          selectedRuleId: ruleId
        });
      } else {
        alert("failure");
      }
    }
  }

  deleteRule = () => {
    const puzzle = this.state.puzzle;

    if (this.state.selectedRuleId !== undefined) {
      puzzle.deleteRule(this.state.selectedRuleId);
    }

    this.setState({
      puzzle: puzzle,
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
    const puzzle = this.state.puzzle;

    if (this.state.selectedClueId !== undefined) {
      puzzle.changeClueDescription(this.state.selectedClueId, description);
    }

    this.setState({
      puzzle: puzzle
    });
  }

  moveClueUp = () => {
    const puzzle = this.state.puzzle;

    if (this.state.selectedClueId !== undefined) {
      puzzle.moveClueUp(this.state.selectedClueId);
    }

    this.setState({
      puzzle: puzzle
    });
  }

  moveEntityUp = () => {
    const puzzle = this.state.puzzle;

    if (this.state.selectedEntityId !== undefined) {
      puzzle.moveEntityUp(this.state.selectedEntityId);
    }

    this.setState({
      puzzle: puzzle
    });
  }

  selectRuleId = (ruleId: string) => {
    const rule = this.state.puzzle.getRule(ruleId);

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
    const puzzle = this.state.puzzle;

    if (this.state.selectedRuleId !== undefined) {
      puzzle.setRelationshipRuleMode(this.state.selectedRuleId, mode);
    }

    this.setState({
      puzzle: puzzle
    });
  }

  selectRelationshipRuleLogic = (logic: string) => {
    const puzzle = this.state.puzzle;

    if (this.state.selectedRuleId !== undefined) {
      puzzle.setRelationshipRuleLogic(this.state.selectedRuleId, logic);
    }

    this.setState({
      puzzle: puzzle
    });
  }

  addFeatureStartToRelationshipRule = () => {
    const puzzle = this.state.puzzle;

    if (this.state.selectedRuleId !== undefined) {
      if (this.state.selectedFeatureId !== undefined) {
        puzzle.addFeatureStartToRelationshipRule(this.state.selectedRuleId, this.state.selectedFeatureId);
      }
    }

    this.setState({
      puzzle: puzzle
    });
  }

  addFeatureEndToRelationshipRule = () => {
    const puzzle = this.state.puzzle;

    if (this.state.selectedRuleId !== undefined) {
      if (this.state.selectedFeatureId !== undefined) {
        puzzle.addFeatureEndToRelationshipRule(this.state.selectedRuleId, this.state.selectedFeatureId);
      }
    }

    this.setState({
      puzzle: puzzle
    });
  }

  addGroupTypeToRelationshipRule = () => {
    const puzzle = this.state.puzzle;

    if (this.state.selectedRuleId !== undefined) {
      if (this.state.selectedEntityGroupTypeId !== undefined) {
        puzzle.addGroupTypeToRelationshipRule(this.state.selectedRuleId, this.state.selectedEntityGroupTypeId);
      }
    }

    this.setState({
      puzzle: puzzle
    });
  }

  addFeatureToQuantityRule = () => {
    const puzzle = this.state.puzzle;

    if (this.state.selectedRuleId !== undefined) {
      if (this.state.selectedFeatureId !== undefined) {
        puzzle.addFeatureToQuantityRule(this.state.selectedRuleId, this.state.selectedFeatureId);
      }
    }

    this.setState({
      puzzle: puzzle
    });
  }

  changeQuantitiesOfQuantityRule = (quantitiesString: string) => {
    const puzzle = this.state.puzzle;

    if (this.state.selectedRuleId !== undefined) {
      const quantitiesSplit = quantitiesString.split(",");
      const quantities: number[] = [];

      quantitiesSplit.map((quantityString: string) => {
        const quantity = Number(quantityString);

        if (!isNaN(quantity) && quantity >= 0 && quantities.indexOf(quantity) === -1) {
          quantities.push(quantity);
        }
      });

      puzzle.changeQuantitiesOfQuantityRule(this.state.selectedRuleId, quantities.sort());
    }

    this.setState({
      puzzle: puzzle,
      quantitiesString: quantitiesString
    });
  }

  selectDistanceRuleMode = (mode: string) => {
    const puzzle = this.state.puzzle;

    if (this.state.selectedRuleId !== undefined) {
      puzzle.setDistanceRuleMode(this.state.selectedRuleId, mode);
    }

    this.setState({
      puzzle: puzzle
    });
  }

  addFeatureStartToDistanceRule = () => {
    const puzzle = this.state.puzzle;

    if (this.state.selectedRuleId !== undefined) {
      if (this.state.selectedFeatureId !== undefined) {
        puzzle.addFeatureStartToDistanceRule(this.state.selectedRuleId, this.state.selectedFeatureId);
      }
    }

    this.setState({
      puzzle: puzzle
    });
  }

  addFeatureMiddleToDistanceRule = () => {
    const puzzle = this.state.puzzle;

    if (this.state.selectedRuleId !== undefined) {
      if (this.state.selectedFeatureId !== undefined) {
        puzzle.addFeatureMiddleToDistanceRule(this.state.selectedRuleId, this.state.selectedFeatureId);
      }
    }

    this.setState({
      puzzle: puzzle
    });
  }

  addFeatureEndToDistanceRule = () => {
    const puzzle = this.state.puzzle;

    if (this.state.selectedRuleId !== undefined) {
      if (this.state.selectedFeatureId !== undefined) {
        puzzle.addFeatureEndToDistanceRule(this.state.selectedRuleId, this.state.selectedFeatureId);
      }
    }

    this.setState({
      puzzle: puzzle
    });
  }

  selectSequenceRuleMode = (mode: string) => {
    const puzzle = this.state.puzzle;

    if (this.state.selectedRuleId !== undefined) {
      puzzle.setSequenceRuleMode(this.state.selectedRuleId, mode);
    }

    this.setState({
      puzzle: puzzle
    });
  }

  selectSequenceCanRevisit = (canRevisit: string) => {
    const puzzle = this.state.puzzle;

    if (this.state.selectedRuleId !== undefined) {
      puzzle.setSequenceCanRevisit(this.state.selectedRuleId, canRevisit === "CANREVISIT");
    }

    this.setState({
      puzzle: puzzle
    });
  }

  addIndexToSequenceRule = () => {
    const puzzle = this.state.puzzle;

    if (this.state.selectedRuleId !== undefined) {
      puzzle.addIndexToSequenceRule(this.state.selectedRuleId);
    }

    this.setState({
      puzzle: puzzle
    });
  }

  selectSequenceIndex = (sequenceIndex: string) => {
    const index = sequenceIndex.split("_");

    this.setState({
      selectedSequenceIndex: Number(index[1])
    });
  }

  addFeatureToSequenceAtIndex = () => {
    const puzzle = this.state.puzzle;

    if (this.state.selectedRuleId !== undefined) {
      if (this.state.selectedFeatureId !== undefined) {
        if (this.state.selectedSequenceIndex !== undefined) {
          puzzle.addFeatureToSequenceAtIndex(this.state.selectedRuleId, this.state.selectedSequenceIndex, this.state.selectedFeatureId);
        }
      }
    }

    this.setState({
      puzzle: puzzle
    });
  }

  addEntityGroupTypeToSequenceRule = () => {
    const puzzle = this.state.puzzle;

    if (this.state.selectedRuleId !== undefined) {
      if (this.state.selectedEntityGroupTypeId !== undefined) {
        puzzle.addEntityGroupTypeToSequenceRule(this.state.selectedRuleId, this.state.selectedEntityGroupTypeId);
      }
    }

    this.setState({
      puzzle: puzzle
    });
  }

  changeScale = (scale: string) => {
    const puzzle = this.state.puzzle;

    puzzle.setScale(Number(scale));

    this.setState({
      puzzle: puzzle
    });
  }

  countSolutions2 = () => {
    const puzzle = this.state.puzzle;

    const solutionCount = puzzle.countSolutions();

    this.setState({
      solutionCount: solutionCount,
      puzzle: puzzle
    });
  }

  countSolutions = () => {
    this.setState({
      solutionCount: -1
    }, () => { setTimeout(this.countSolutions2, 1000) });
  }

  savePuzzle = () => {
    const puzzle: TovelundPuzzleDesignClass = { ...this.state.puzzle };

    puzzle.clearMarkings();

    if (this.state.puzzleId) {
      fetch(`api/tovelundpuzzles/${this.state.puzzleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ "Title": this.state.puzzleTitle, "Design": puzzle.getJSON(), "Difficulty": this.state.puzzleDifficulty })
      })
        .then(response => { console.log(response) });
    } else {
      fetch("api/tovelundpuzzles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ "Title": this.state.puzzleTitle, "Design": puzzle.getJSON(), "Difficulty": this.state.puzzleDifficulty })
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
      const rectangle = this.state.puzzle.getRectangle(this.state.selectedElementId);

      if (rectangle) {
        x = rectangle.x;
        y = rectangle.y;

        shapeElements.push(<option key="recangleHORIZONTAL" value="HORIZONTAL">HORIZONTAL</option>);
        shapeElements.push(<option key="recangleVERTICAL" value="VERTICAL">VERTICAL</option>);

        selectedShape = rectangle.attributes["Orientation"];
      }
    } else if (this.state.selectedElementType === TovelundElementType.Point && this.state.selectedElementId) {
      const point = this.state.puzzle.getPoint(this.state.selectedElementId);

      if (point) {
        x = point.x;
        y = point.y;

        shapeElements.push(<option key="pointSMALL" value="SMALL">SMALL</option>);
        shapeElements.push(<option key="pointMEDIUM" value="MEDIUM">MEDIUM</option>);
        shapeElements.push(<option key="pointLARGE" value="LARGE">LARGE</option>);

        selectedShape = point.attributes["Size"];
      }
    } else if (this.state.selectedElementType === TovelundElementType.Line && this.state.selectedElementId) {
      const line = this.state.puzzle.getLine(this.state.selectedElementId);

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
      const vertex = this.state.puzzle.getVertex(this.state.selectedElementId);

      if (vertex) {
        x = vertex.x;
        y = vertex.y;
      }
    }

    const entityElements = this.state.puzzle.getEntities().map((entity: TovelundEntity, index: number) => <option key={`entityOption${entity.id}`} value={entity.id}>
      {entity.name}
    </option>);

    let entityGroupElements: JSX.Element[] = this.state.puzzle.getEntityGroups().map((group: TovelundEntityGroup) => <option key={`entityGroup${group.id}`} value={group.id}>
      {group.id}: {group.entityGroupTypeId}
    </option>);

    let entityGroupTypeElements: JSX.Element[] = this.state.puzzle.getEntityGroupTypes().map((groupType: { id: string, name: string }) => <option key={`entityGroupType${groupType.id}`} value={groupType.id}>
      {groupType.id}: {groupType.name}
    </option>);

    let groupEntityElements: JSX.Element[] = [];

    if (this.state.selectedEntityGroupId) {
      groupEntityElements = this.state.puzzle.getEntityGroup(this.state.selectedEntityGroupId).entityIds.map((entityId: string) => <div key={`groupEntity${entityId}`}>
        {this.state.puzzle.getEntity(entityId).name}
      </div>);
    }

    let entityFeatureElements: JSX.Element[] = [];

    if (this.state.selectedEntityId) {
      entityFeatureElements.push(<option key={`entityType"NONE"`} value="NONE">
        NONE
      </option>);

      const entity = this.state.puzzle.getEntity(this.state.selectedEntityId);

      const featureCollection = this.state.puzzle.getFeatureCollection(entity.featureCollectionId);

      featureCollection.set.map((feature: { id: string, type: string, name: string }) => {
        entityFeatureElements.push(<option key={`entityId${feature.id}`} value={feature.id}>
          {feature.type}
        </option>);
      });
    }

    const featureCollectionElements = this.state.puzzle.getFeatureCollections().map((collection: TovelundFeatureCollection) => <option key={`symbolOption${collection.id}`} value={collection.id}>
      {collection.name}
    </option>);

    const featureCollectionColorElements: JSX.Element[] = [];
    const collectionFeatureElements: JSX.Element[] = [];

    if (this.state.selectedFeatureCollectionId) {
      const featureCollection = this.state.puzzle.getFeatureCollection(this.state.selectedFeatureCollectionId);

      featureCollection.set.map((feature: { id: string, name: string, symbol: string }, index: number) => {
        collectionFeatureElements.push(<option key={`featureName${index}`} value={feature.id}>
          {feature.symbol}: {feature.name}
        </option>);
      });

      featureCollectionColorElements.push(<option key={`featureColorOrange`} value="ORANGE" style={{ backgroundColor: LotographiaColor.Orange5 }}>
        Orange
      </option>);
      featureCollectionColorElements.push(<option key={`featureColorPurple`} value="PURPLE" style={{ backgroundColor: LotographiaColor.Purple5 }}>
        Purple
      </option>);
      featureCollectionColorElements.push(<option key={`featureColorViolet`} value="VIOLET" style={{ backgroundColor: LotographiaColor.Violet5 }}>
        Violet
      </option>);
      featureCollectionColorElements.push(<option key={`featureColorBlue`} value="BLUE" style={{ backgroundColor: LotographiaColor.Blue5 }}>
        Blue
      </option>);
      featureCollectionColorElements.push(<option key={`featureColorGreen`} value="GREEN" style={{ backgroundColor: LotographiaColor.Green5 }}>
        Green
      </option>);
      featureCollectionColorElements.push(<option key={`featureColorLime`} value="LIME" style={{ backgroundColor: LotographiaColor.Lime5 }}>
        Lime
      </option>);
    }

    const availableFeatureTypeElements = Object.values(TovelundFeatureType).map((type: string) => <option key={`entityType_${type}`} value={type}>
      {type}
    </option>);

    const availableFeatureSymbolElements = this.state.puzzle.getAvailableFeatureSymbols().map((featureSymbol: string) => <option key={`entitySybmol_${featureSymbol}`} value={featureSymbol}>
      {featureSymbol}
    </option>)

    const elementElements: JSX.Element[] = [];

    if (this.state.selectedEntityId) {
      const entity = this.state.puzzle.getEntity(this.state.selectedEntityId);

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

    const puzzleOptions: JSX.Element[] = this.state.puzzles.map((puzzle: { id: number, title: string }) =>
      <option key={`puzzleId${puzzle.id}`} value={puzzle.id}>{puzzle.title}</option>
    );

    const clueElements: JSX.Element[] = this.state.puzzle.getClues().map((clue: { id: string, description: string }, index: number) => <option key={`clue${clue.id}`} value={clue.id}>
      {index}: {clue.description}
    </option>);

    const ruleElements: JSX.Element[] = [];

    if (this.state.selectedClueId) {
      const clue = this.state.puzzle.getClue(this.state.selectedClueId);

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
      const group = this.state.puzzle.getEntityGroup(this.state.selectedEntityGroupId);

      group.entityIds.map((entityId: string) => {
        const entity = this.state.puzzle.getEntity(entityId);

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
      const rule = this.state.puzzle.getRule(this.state.selectedRuleId);

      if (rule.type === "RELATIONSHIP") {
        const relationshipRule = rule as TovelundRelationshipRule;

        ruleDetails = <>
          <div className="component">
            <div className="information">Group Type: {relationshipRule.entityGroupTypeIds.map((id: string) => this.state.puzzle.getEntityGroupType(id).name)}</div>
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
            <button className="action" onClick={this.addGroupTypeToRelationshipRule} disabled={this.state.selectedEntityGroupTypeId === undefined}>Add Group Type</button>
          </div>
          <div className="component">
            <div className="information">Feature Starts: {relationshipRule.featureStartIds.map((id: string) => this.state.puzzle.getFeature(id).name)}</div>
            <div className="information">Feature Ends: {relationshipRule.featureEndIds.map((id: string) => this.state.puzzle.getFeature(id).name)}</div>
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
            <div className="information">Features: {quantityRule.featureIds.map(featureId => this.state.puzzle.getFeature(featureId).name).join(",")}</div>
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
            <div className="information">Feature Starts: {distanceRule.featureStartIds.map((id: string) => this.state.puzzle.getFeature(id).name)}</div>
          </div>
          <div className="component">
            <div className="information">Feature Middles: {distanceRule.featureMiddleIds.map((id: string) => this.state.puzzle.getFeature(id).name)}</div>
          </div>
          <div className="component">
            <div className="information">Feature Ends: {distanceRule.featureEndIds.map((id: string) => this.state.puzzle.getFeature(id).name)}</div>
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
          {this.state.selectedSequenceIndex !== undefined && <div className="component">
            <div className="information">Features: {sequenceRule.featureIds[this.state.selectedSequenceIndex].length === 0 ? "Any" : sequenceRule.featureIds[this.state.selectedSequenceIndex].map(featureId => this.state.puzzle.getFeature(featureId).name).join(",")}</div>
          </div>}
          <div className="component buttons">
            <button className="action" onClick={this.addEntityGroupTypeToSequenceRule}>Add Entity Group Type To Sequence Rule</button>
          </div>
          <div className="component">
            <div className="information">Entity Group Types: {sequenceRule.entityGroupTypeIds.map(entityGroupTypeId => this.state.puzzle.getEntityGroupType(entityGroupTypeId).name).join(",")}</div>
          </div>
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
          <button className="action" onClick={this.addRectangle} disabled={this.state.selectedEntityId === undefined || this.state.puzzle.getEntity(this.state.selectedEntityId).rectangle !== undefined}>Add Rectangle</button>
          <button className="action" onClick={this.addPoint} disabled={this.state.selectedEntityId === undefined}>Add Point</button>
          <button className="action" onClick={this.addLine} disabled={this.state.selectedEntityId === undefined}>Add Line</button>
          <button className="action" onClick={this.addVertex} disabled={!(this.state.selectedElementType === TovelundElementType.Line || this.state.selectedElementType === TovelundElementType.Vertex) || this.state.selectedElementId === undefined}>Add Vertex</button>
          <button className="action" onClick={this.delete}>Delete</button>
        </div>
        {entitySelector}
        <div className="component">
          <select value={this.state.selectedEntityId ? (this.state.puzzle.getEntity(this.state.selectedEntityId).featureCollectionId) : "NONE"} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.setEntityFeatureCollection(event.currentTarget.value)} style={{ width: "10em" }}>
            {featureCollectionElements}
          </select>
        </div>
        <div className="component">
          <select value={this.state.selectedEntityId ? (this.state.puzzle.getEntity(this.state.selectedEntityId).fixedFeatureId ? this.state.puzzle.getEntity(this.state.selectedEntityId).fixedFeatureId : "NONE") : "NONE"} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.selectEntityFeatureId(event.currentTarget.value)} style={{ width: "10em" }}>
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
          <input type="text" id="name" defaultValue={this.state.puzzle.getEntity(this.state.selectedEntityId).name} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeEntityName(event.target.value)} />
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
          <label htmlFor="puzzleScale">Scale</label>
          <br />
          <input type="number" id="puzzleScale" value={this.state.puzzle.getScale()} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeScale(event.target.value)} min={50} max={150} />
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
            {this.state.puzzle.getEntityGroupType(this.state.puzzle.getEntityGroup(this.state.selectedEntityGroupId).entityGroupTypeId).name}
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
          <input type="string" id="featureCollectionName" value={this.state.selectedFeatureCollectionId ? this.state.puzzle.getFeatureCollection(this.state.selectedFeatureCollectionId).name : undefined} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeFeatureCollectionName(event.target.value)} />
        </div>
        <div className="component">
          <select value={this.state.selectedFeatureCollectionId ? this.state.puzzle.getFeatureCollection(this.state.selectedFeatureCollectionId).color : undefined} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.selectFeatureCollectionColor(event.currentTarget.value)} style={{ width: "10em" }}>
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
          <button className="action" onClick={this.addFeature} disabled={this.state.selectedFeatureCollectionId === undefined || this.state.puzzle.getFeatureCollection(this.state.selectedFeatureCollectionId).set.length === 8 || this.state.selectedAvailableFeatureType === undefined || this.state.selectedAvailableFeatureName === undefined || this.state.selectedAvailableFeatureSymbol === undefined}>Add Feature Type</button>
          <button className="action" onClick={this.deleteFeature} disabled={this.state.selectedFeatureId === undefined}>Delete Feature Type</button>
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
            <input type="text" id="clueDescription" value={this.state.puzzle.getClue(this.state.selectedClueId).description} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeClueDescription(event.target.value)} />
          </div>
          <div className="component">
            <div className="information">
              {convertClueDescription(this.state.puzzle.getClue(this.state.selectedClueId).description)}
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
          {getTovelundMap(this.state.puzzle, this.selectEntity, selectedElementIds, "DEV")}
        </div>
      </div>
      <div className="component">
        <label htmlFor="puzzleTitle">Puzzle Title</label>
        <br />
        <input type="string" id="puzzleTitle" value={this.state.puzzleTitle} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeTitle(event.target.value)} />
      </div>
      <div className="component">
        <label htmlFor="puzzleDifficulty">Puzzle Difficuly</label>
        <br />
        <input type="number" min={1} max={5} id="puzzleDifficulty" value={this.state.puzzleDifficulty} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeDifficulty(event.target.value)} />
      </div>
      <div className="component buttons">
        <button className="action" onClick={this.countSolutions}>Count Solutions</button>
        <button className="action" onClick={this.savePuzzle}>Save</button>
      </div>
      <div className="component">
        <select value={this.state.selectedPuzzleId} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.selectPuzzle(event.currentTarget.value)} style={{ width: "10em" }}>
          <option value="-1" disabled>Choose</option>
          {puzzleOptions}
        </select>
      </div>
      <div className="component buttons">
        <button className="action" onClick={this.loadPuzzle} disabled={this.state.selectedPuzzleId === -1}>Load Puzzle</button>
      </div>
      <div className="component">
        <div className="text">Solution Count: {this.state.solutionCount}</div>
        <div className="text">Selected Entity Id: {this.state.selectedEntityId}</div>
        <div className="text">Selected Feature Type: {this.state.selectedElementType}</div>
        <div className="text">Selected Feature Id: {this.state.selectedElementId}</div>
        <div className="text">Selected Entity Type: {this.state.selectedEntityId && this.state.puzzle.getEntity(this.state.selectedEntityId).fixedFeatureId}</div>
      </div>
      <div className="component buttons">
        <button className="action" onClick={() => { console.log(this.state.puzzle.puzzleDesign) }}>Console Log</button>
      </div>
    </div>;
  }
}
