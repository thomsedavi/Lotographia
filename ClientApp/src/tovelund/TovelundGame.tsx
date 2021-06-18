import * as React from "react";
import { TovelundColor, TovelundGame, TovelundClue } from "./TovelundEnums";
import { TovelundGameClass } from "./TovelundGameClass";
import { getTovelundMap } from "./TovelundMap";
import { convertClueDescription } from "./TovelundUtils";

interface TovelundGameState {
  stage: string,
  selectedGameId?: number,
  games: { id: number, title: string, design: TovelundGameClass }[],
  selectedEntityId?: string,
  solutionPasses?: boolean,
  mode: string,
  clueIndex: number,
  showHelp: boolean
}

export class Tovelund extends React.Component<any, TovelundGameState> {
  constructor(props: any) {
    super(props);

    this.state = {
      stage: "LOADING",
      games: [],
      mode: "SELECT",
      clueIndex: 0,
      showHelp: false
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
            .then((data: { games: { id: number, title: string, design: string }[] }) => {
              const games = data.games.map((game: { id: number, title: string, design: string }) => {
                const designObject = JSON.parse(game.design);

                const design: TovelundGame = {
                  clues: designObject.clues,
                  entities: designObject.entities,
                  entityGroups: designObject.entityGroups,
                  entityGroupTypes: designObject.entityGroupTypes,
                  featureCollections: designObject.featureCollections,
                  scale: designObject.scale
                };

                return {
                  id: game.id,
                  title: game.title,
                  design: new TovelundGameClass(design)
                }
              });

              this.setState({
                games: games,
                stage: "MENU",
                selectedGameId: games[0].id
              });
            })
        }
      });
  }

  selectGame = (gameId: string) => {
    this.setState({
      selectedGameId: Number(gameId)
    });
  }

  startPuzzle = () => {
    this.setState({
      stage: "PLAY" 
    });
  }

  selectEntityId = (entityId: string) => {
    this.setState({
      selectedEntityId: entityId
    });
  }

  //selectDestination = (id: number) => {
  //  this.setState({
  //    selectedElementType: TovelundElementType.Destination,
  //    selectedElementId: id
  //  });
  //}
  
  selectDrawMode = (mode: string) => {
    this.setState({
      mode: mode
    });
  }

  displayHelp = () => {
    this.setState(prevState => ({
      showHelp: !prevState.showHelp
    }));
  }

  clickSymbol = (featureId: string) => {
    const games = this.state.games;

    if (this.state.selectedGameId !== undefined) {
      const design = this.state.games.filter(g => g.id === this.state.selectedGameId)[0].design;

      if (this.state.selectedEntityId) {
        const entity = design.getEntity(this.state.selectedEntityId);

        if (this.state.mode === "SELECT") {
          design.setEntitySelectedFeatureId(this.state.selectedEntityId, entity.selectedFeatureId === featureId ? undefined : featureId);
        } else if (this.state.mode === "INNER") {
          design.toggleInnerPencilFeatureIds(this.state.selectedEntityId, featureId);
        } else if (this.state.mode === "OUTER") {
          design.toggleOuterPencilFeatureIds(this.state.selectedEntityId, featureId);
        }
      }
    }
  
    this.setState({
      games: games
    });
  }

  nextClue = () => {
    if (this.state.selectedGameId !== undefined) {
      const design = this.state.games.filter(g => g.id === this.state.selectedGameId)[0].design;

      const clueIndex = this.state.clueIndex
      const cluesLength = design.getClues().length;

      if (clueIndex === cluesLength - 1) {
        this.setState({
          clueIndex: 0
        });
      } else {
        this.setState({
          clueIndex: clueIndex + 1
        });
      }
    }
  }

  prevClue = () => {
    if (this.state.selectedGameId !== undefined) {
      const design = this.state.games.filter(g => g.id === this.state.selectedGameId)[0].design;

      const clueIndex = this.state.clueIndex
      const cluesLength = design.getClues().length;

      if (clueIndex === 0) {
        this.setState({
          clueIndex: cluesLength - 1
        });
      } else {
        this.setState({
          clueIndex: clueIndex - 1
        });
      }
    }
  }

  toggleCheckClue = (clueId: string) => {
    const games = this.state.games;

    if (this.state.selectedGameId !== undefined) {
      const design = this.state.games.filter(g => g.id === this.state.selectedGameId)[0].design;

      design.toggleCheckClue(clueId);
    }

    this.setState({
      games: games
    });
  }

  checkSolution = () => {
    if (this.state.selectedGameId !== undefined) {
      const design = this.state.games.filter(g => g.id === this.state.selectedGameId)[0].design;

      const solutionPasses = design.checkSolution();

      this.setState({
        solutionPasses: solutionPasses
      });
    }
  }
  
  //checkSolution = () => {
  //  const game = this.state.game;
  //  var solutionPasses = true;
  //
  //  for (var i = 0; i < game.clues.length; i++) {
  //    var cluePasses = true;
  //    const clue = game.clues[i];
  //
  //    for (var j = 0; j < clue.rules.length; j++) {
  //      const rule = clue.rules[j];
  //
  //      if (rule.ruleType === "RANGE") {
  //        const rangeRule = rule as TovelundRangeRule;
  //        let count = 0;
  //
  //        if (rangeRule.element.type === TovelundElementType.Destination) {
  //          for (var k = 0; k < game.destinations.length; k++) {
  //            const destination = game.destinations[k];
  //
  //            if (destination.fixedName === rangeRule.element.name || destination.selectedName === rangeRule.element.name) {
  //              count++;
  //            }
  //          }
  //        }
  //
  //        if ((rangeRule.min && count < rangeRule.min) || (rangeRule.max && count > rangeRule.max)) {
  //          solutionPasses = false;
  //          cluePasses = false;
  //        }
  //      }
  //
  //      if (rule.ruleType === "RELATIONSHIP") {
  //        const requirementRule = rule as TovelundRelationshipRule;
  //
  //        if (requirementRule.element.type === TovelundElementType.Destination) {
  //          for (var k = 0; k < game.destinations.length; k++) {
  //            const destination = game.destinations[k];
  //
  //            if (destination.fixedName === requirementRule.element.name || destination.selectedName === requirementRule.element.name) {
  //              const relationships = game.relationships.filter(r => r.filter(s => s.type === TovelundElementType.Destination && s.id === destination.id).length > 0);
  //              let match = requirementRule.mode === "INCLUDE" ? false : true;
  //
  //              for (var l = 0; l < relationships.length; l++) {
  //                const relationship: TovelundElementId[] = relationships[l].filter(r => !(r.type === TovelundElementType.Destination && r.id === destination.id));
  //
  //                for (var m = 0; m < relationship.length; m++) {
  //                  const relationshipElement = relationship[m];
  //
  //                  const relationshipElements = requirementRule.relationshipElements;
  //
  //                  for (var n = 0; n < relationshipElements.length; n++) {
  //                    const relationship = relationshipElements[n];
  //                    const requiredType = relationship.type;
  //                    const requiredName = relationship.name;
  //                    const relationshipType = relationshipElement.type;
  //                    const relationshipId = relationshipElement.id;
  //
  //                    if (requiredType === relationshipType) {
  //                      if (requiredType === TovelundElementType.Zone) {
  //                        const zone = game.zones.filter(z => z.id === relationshipId)[0];
  //
  //                        if (zone.name === requiredName) {
  //                          match = requirementRule.mode === "INCLUDE" ? true : false;
  //                        }
  //                      }
  //                    }
  //                  }
  //                }
  //              }
  //
  //              if (!match) {
  //                solutionPasses = false;
  //                cluePasses = false;
  //              }
  //            }
  //          }
  //        }
  //      }
  //    }
  //
  //    clue.passes = cluePasses;
  //  }
  //
  //  this.setState({
  //    game: game,
  //    solutionPasses: solutionPasses
  //  });
  //}

  render() {
    // could do with maths, or store somewhere else
    const symbolMapLists = [
      [{ x: 0.9, y: 7.25, size: 8 }],
      [{ x: 2.9, y: 15.25, size: 4 }, { x: 2.9, y: 19.25, size: 4 }],
      [{ x: 0.9, y: 7.25, size: 4 }, { x: 4.9, y: 7.25, size: 4 }, { x: 0.9, y: 11.25, size: 4 }],
      [{ x: 0.9, y: 11.25, size: 4 }, { x: 4.9, y: 11.25, size: 4 }, { x: 0.9, y: 15.25, size: 4 }, { x: 4.9, y: 15.25, size: 4 }],
      [{ x: 0.9, y: 7.25, size: 4 }, { x: 4.9, y: 7.25, size: 4 }, { x: 0.9, y: 11.25, size: 4 }, { x: 4.9, y: 11.25, size: 4 }, { x: 0.9, y: 15.25, size: 4 }],
      [{ x: 0.9, y: 13.25, size: 4 }, { x: 4.9, y: 13.25, size: 4 }, { x: 0.9, y: 17.25, size: 4 }, { x: 4.9, y: 17.25, size: 4 }, { x: 0.9, y: 21.25, size: 4 }, { x: 4.9, y: 21.25, size: 4 }],
      [{ x: 0.9, y: 7.25, size: 4 }, { x: 4.9, y: 7.25, size: 4 }, { x: 0.9, y: 11.25, size: 4 }, { x: 4.9, y: 11.25, size: 4 }, { x: 0.9, y: 15.25, size: 4 }, { x: 4.9, y: 15.25, size: 4 }, { x: 0.9, y: 19.25, size: 4 }],
      [{ x: 0.9, y: 7.25, size: 4 }, { x: 4.9, y: 7.25, size: 4 }, { x: 0.9, y: 11.25, size: 4 }, { x: 4.9, y: 11.25, size: 4 }, { x: 0.9, y: 15.25, size: 4 }, { x: 4.9, y: 15.25, size: 4 }, { x: 0.9, y: 19.25, size: 4 }, { x: 4.9, y: 19.25, size: 4 }]
    ];



    //const symbols = design.symbols.filter(s => s.type === this.state.selectedElementType);
    ////const symbolMap = symbolMapList[symbols.length];
    //
    //symbols.map((symbol: TovelundSymbol, index: number) => {
    //  if (this.state.selectedElementType === TovelundElementType.Destination) {
    //    const destination = design.destinations.filter(d => d.id === this.state.selectedElementId)[0];
    //
    //    let fill = TovelundColor.Orange;
    //
    //    if (destination.fixedName === symbol.name || destination.selectedName === symbol.name) {
    //      fill = TovelundColor.White;
    //    } else if (destination.symbolColors[symbol.name]) {
    //      fill = destination.symbolColors[symbol.name];
    //    }
    //
    //    symbolsElement.push(<text key={`symbol${index}`} x={symbolMap[index].x} y={symbolMap[index].y} onClick={() => this.selectSymbol(symbol.name)} style={{ fill: fill, cursor: "pointer", fontFamily: "monospace", fontSize: 4 }}>
    //      {symbol.symbol}
    //    </text>);
    //  } else {
    //    // TODO for different Element Types
    //    return <text key={`symbol${index}`} x={symbolMap[index].x} y={symbolMap[index].y} onClick={() => this.selectSymbol(symbol.name)} style={{ fill: TovelundColor.Orange, cursor: "pointer", fontFamily: "monospace", fontSize: 4 }}>?</text>;
    //  }
    //});

    //let descriptions: JSX.Element[] = [];
    //
    //for (var i = 0; i < design.clues.length; i++) {
    //  const clue = design.clues[i];
    //  const descriptionElements = clue.description.split("|");
    //
    //  const description: (string | JSX.Element)[] = [];
    //
    //  for (let i = 0; i < descriptionElements.length; i++) {
    //    const descriptionElement = descriptionElements[i];
    //
    //    if (design.symbols.filter(s => s.name === descriptionElement).length) {
    //      const symbol = design.symbols.filter(s => s.name === descriptionElement)[0].symbol;
    //
    //      description.push(<span style={{ color: TovelundColor.Blue }}>{symbol}</span>);
    //    } else {
    //      description.push(descriptionElement);
    //    }
    //  }
    //
    //  descriptions.push(<div className="text" style={{ color: clue.passes === undefined || clue.passes ? TovelundColor.Black : TovelundColor.ReddishPurple }}>
    //    {description}
    //  </div>);
    //}

    if (this.state.stage === "LOADING") {
      return <div className="section">
        <div className="component">
          <div className="title">Tovelund Puzzles</div>
        </div>
        <div className="component">
          <div className="emphasis">Receiving puzzles...</div>
        </div>
      </div>;
    } else if (this.state.stage === "MENU") {
      const gameOptions: JSX.Element[] = this.state.games.map((game: {id: number, title: string}) =>
        <option key={`gameId${game.id}`} value={game.id}>{game.title}</option>
      );

      return <div className="section">
        <div className="component">
          <div className="title">Tovelund Puzzles</div>
        </div>
        <div className="component">
          <select value={this.state.selectedGameId ? this.state.selectedGameId : "NONE"} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this.selectGame(event.currentTarget.value)} style={{ width: "10em" }}>
            <option value="NONE" disabled>Choose</option>
            {gameOptions}
          </select>
        </div>
        <div className="component">
          <div style={{ width: "24em", margin: "auto" }}>
            {getTovelundMap(this.state.games.filter(g => g.id === this.state.selectedGameId)[0].design, (entityId: string) => { }, [], false)}
          </div>
        </div>
        <div className="component buttons">
          <button className="action" onClick={this.startPuzzle} disabled={this.state.selectedGameId === undefined}>Start Puzzle</button>
        </div>
      </div>;
    } else {
      if (this.state.selectedGameId !== undefined) {
        const design = this.state.games.filter(g => g.id === this.state.selectedGameId)[0].design;

        const symbolsElement: JSX.Element[] = [];

        if (this.state.selectedEntityId !== undefined) {
          const entity = design.getEntity(this.state.selectedEntityId);
          const featureCollection = design.getFeatureCollection(entity.featureCollectionId);
          const featureSet = [...featureCollection.set];
          const symbolMapList = symbolMapLists[featureSet.length - 1];

          featureSet.sort((a: { symbol: string }, b: { symbol: string }) => a.symbol > b.symbol ? 1 : -1)
          featureSet.map((feature: { id: string, symbol: string, name: string, type: string }, index: number) => {
            const symbolCoordinates = symbolMapList[index];

            symbolsElement.push(<text key={`feature${feature.id}`} x={symbolCoordinates.x} y={symbolCoordinates.y} onClick={() => this.clickSymbol(feature.id)} style={{ fill: featureCollection.color, cursor: "pointer", fontFamily: "monospace", fontSize: symbolCoordinates.size }}>
              {feature.symbol}
            </text>);
          });
        }

        const selectedElements: string[] = [];

        if (this.state.selectedEntityId !== undefined) {
          const selectedEntity = design.getEntity(this.state.selectedEntityId);

          if (selectedEntity.rectangle !== undefined) {
            selectedElements.push(selectedEntity.rectangle.id);
          }
        }

        const selectedClue = design.getClues()[this.state.clueIndex];
        const canCheckSolution = design.getEntities().filter(e => e.fixedFeatureId === undefined && e.selectedFeatureId === undefined).length === 0;

        const help = <svg
          key="TovelundMap"
          viewBox={"0 0 45 30"}
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          xmlSpace="preserve"
          className="image right"
          style={{ fillRule: "evenodd", clipRule: "evenodd", strokeLinejoin: "round", strokeMiterlimit: 2, overflow: "visible", maxWidth: "100%" }}>
          <rect x="0" y="0" width={45} height={30} style={{ fill: TovelundColor.White, stroke: TovelundColor.Black, strokeWidth: 0.1875 }} />
          <text x={43} y={2.5} onClick={this.displayHelp} style={{ fill: TovelundColor.ReddishPurple, fontFamily: "monospace", fontSize: 2, cursor: "pointer" }}>X</text>
          <g transform={`matrix(1,0,0,1,2,2)`}>
            <rect x={0} y={0} width={4} height={4} style={{ fill: TovelundColor.White, stroke: TovelundColor.Black, strokeWidth: 0.2 }} />
            <text x={0.4} y={1.25} style={{ fill: TovelundColor.Black, fontFamily: "monospace", fontSize: 1.5, cursor: "pointer" }}>X</text>
            <text x={2.8} y={1.25} style={{ fill: TovelundColor.Black, fontFamily: "monospace", fontSize: 1.5, cursor: "pointer" }}>Y</text>
            <text x={0.4} y={3.75} style={{ fill: TovelundColor.Black, fontFamily: "monospace", fontSize: 1.5, cursor: "pointer" }}>Z</text>
          </g>
          <text x={7} y={3.5} style={{ fill: TovelundColor.Black, fontFamily: "monospace", fontSize: 2}}>Use outer pencil markings to</text>
          <text x={7} y={6} style={{ fill: TovelundColor.Black, fontFamily: "monospace", fontSize: 2}}>show that a value is limited</text>
          <text x={7} y={8.5} style={{ fill: TovelundColor.Black, fontFamily: "monospace", fontSize: 2}}>to these positions</text>
          <g transform={`matrix(1,0,0,1,2,10.5)`}>
            <rect x={0} y={0} width={4} height={4} style={{ fill: TovelundColor.White, stroke: TovelundColor.Black, strokeWidth: 0.2 }} />
            <text x={0.8} y={2.5} style={{ fill: TovelundColor.Black, fontFamily: "monospace", fontSize: 1.5, cursor: "pointer" }}>X</text>
            <text x={1.6} y={2.5} style={{ fill: TovelundColor.Black, fontFamily: "monospace", fontSize: 1.5, cursor: "pointer" }}>Y</text>
            <text x={2.4} y={2.5} style={{ fill: TovelundColor.Black, fontFamily: "monospace", fontSize: 1.5, cursor: "pointer" }}>Z</text>
          </g>
          <text x={7} y={12} style={{ fill: TovelundColor.Black, fontFamily: "monospace", fontSize: 2 }}>Use inner pencil markings to</text>
          <text x={7} y={14.4} style={{ fill: TovelundColor.Black, fontFamily: "monospace", fontSize: 2 }}>show that a position is</text>
          <text x={7} y={17} style={{ fill: TovelundColor.Black, fontFamily: "monospace", fontSize: 2 }}>limited to these values</text>
          <g transform={`matrix(1,0,0,1,2,19)`}>
            <rect x={0} y={0} width={4} height={4} style={{ fill: TovelundColor.White, stroke: TovelundColor.Black, strokeWidth: 0.2 }} />
            <text x={0.9} y={3.3} style={{ fill: TovelundColor.Black, fontFamily: "monospace", fontSize: 4, cursor: "pointer" }}>X</text>
          </g>
          <text x={7} y={20.5} style={{ fill: TovelundColor.Black, fontFamily: "monospace", fontSize: 2 }}>Use this for your final answer</text>
        </svg>;

        return <div className="section">
          <div className="component">
            <div className="title">Tovelund Puzzles</div>
          </div>
          <div className="component">
            <div className="subtitle">{this.state.games.filter(g => g.id === this.state.selectedGameId)[0].title}</div>
          </div>
          <div className="component">
            <div style={{ width: "24em", margin: "auto", display: "inline-block" }}>
              {this.state.showHelp ? help : getTovelundMap(design, this.selectEntityId, selectedElements, false)}
            </div>
            <div style={{ width: "4em", margin: "1em auto auto 1em", display: "inline-block" }}>
              <svg
                key="TovelundTools"
                viewBox={`0 0 8 24`}
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                xmlSpace="preserve"
                className="image right"
                style={{ fillRule: "evenodd", clipRule: "evenodd", strokeLinejoin: "round", strokeMiterlimit: 2, overflow: "visible", maxWidth: "100%" }}>
                <g onClick={() => this.selectDrawMode("OUTER")}>
                  <rect x={0} y={0} width={4} height={4} style={{ fill: this.state.mode === "OUTER" ? TovelundColor.Yellow : TovelundColor.White, stroke: TovelundColor.Transparent, cursor: "pointer" }} />
                  <text x={0.4} y={1.25} style={{ fill: TovelundColor.Black, fontFamily: "monospace", fontSize: 1.5, cursor: "pointer" }}>X</text>
                  <text x={2.8} y={1.25} style={{ fill: TovelundColor.Black, fontFamily: "monospace", fontSize: 1.5, cursor: "pointer" }}>Y</text>
                  <text x={0.4} y={3.75} style={{ fill: TovelundColor.Black, fontFamily: "monospace", fontSize: 1.5, cursor: "pointer" }}>Z</text>
                </g>
                <g onClick={() => this.selectDrawMode("INNER")}>
                  <rect x={4} y={0} width={4} height={4} style={{ fill: this.state.mode === "INNER" ? TovelundColor.Yellow : TovelundColor.White, stroke: TovelundColor.Transparent, cursor: "pointer" }} />
                  <text x={4.8} y={2.5} style={{ fill: TovelundColor.Black, fontFamily: "monospace", fontSize: 1.5, cursor: "pointer" }}>X</text>
                  <text x={5.6} y={2.5} style={{ fill: TovelundColor.Black, fontFamily: "monospace", fontSize: 1.5, cursor: "pointer" }}>Y</text>
                  <text x={6.4} y={2.5} style={{ fill: TovelundColor.Black, fontFamily: "monospace", fontSize: 1.5, cursor: "pointer" }}>Z</text>
                </g>
                <g onClick={() => this.selectDrawMode("SELECT")}>
                  <rect x={0} y={4} width={4} height={4} style={{ fill: this.state.mode === "SELECT" ? TovelundColor.Yellow : TovelundColor.White, stroke: TovelundColor.Transparent, cursor: "pointer" }} />
                  <text x={0.9} y={7.3} style={{ fill: TovelundColor.Black, fontFamily: "monospace", fontSize: 4, cursor: "pointer" }}>X</text>
                </g>
                <g onClick={() => this.displayHelp()}>
                  <rect x={4} y={4} width={4} height={4} style={{ fill: TovelundColor.White, stroke: TovelundColor.Transparent, cursor: "pointer" }} />
                  <text x={4.9} y={7.3} style={{ fill: TovelundColor.ReddishPurple, cursor: "pointer", fontFamily: "monospace", fontSize: 4 }}>?</text>
                </g>
                <rect x={0} y={0} width={8} height={24} style={{ fill: TovelundColor.None, stroke: TovelundColor.Black, strokeWidth: 0.2 }} />
                <path d="M0,4L8,4" style={{ stroke: TovelundColor.Black, strokeWidth: 0.2 }} />
                <path d="M0,8L8,8" style={{ stroke: TovelundColor.Black, strokeWidth: 0.2 }} />
                <path d="M4,0L4,8" style={{ stroke: TovelundColor.Black, strokeWidth: 0.2 }} />
                {symbolsElement}
              </svg>
            </div>
          </div>
          <div className="component buttons">
            <button className="action" onClick={this.prevClue}>Previous Clue</button>
            <button className="action" onClick={this.nextClue}>Next Clue</button>
          </div>
          {selectedClue !== undefined && <div className="component">
            <div className="information" style={{ color: TovelundColor.Black }}>
              <svg
                key="TovelundCheck"
                viewBox={`0 0 1 1`}
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                xmlSpace="preserve"
                className="image right"
                style={{ float: "left", fillRule: "evenodd", clipRule: "evenodd", strokeLinejoin: "round", strokeMiterlimit: 2, overflow: "visible", maxHeight: "1em", maxWidth: "1em", margin: "0.5em" }}>
                <g transform={`matrix(0.05,0,0,0.05,0.5,0.5)`} onClick={() => this.toggleCheckClue(selectedClue.id)}>
                  <rect x={-10} y={-10} width={20} height={20} style={{ fill: TovelundColor.Transparent, stroke: TovelundColor.Black, strokeWidth: 1, cursor: "pointer" }} />
                  {selectedClue.checked && <path d={'M-7,1 L-2,7 L7,-7'} style={{ fill: TovelundColor.Transparent, stroke: TovelundColor.Black, strokeWidth: 1 }} />}
                  {selectedClue.passes !== undefined && selectedClue.passes && <path d={'M-7,1 L-2,7 L7,-7'} style={{ fill: TovelundColor.Transparent, stroke: TovelundColor.BluishGreen, strokeWidth: 1 }} />}
                  {selectedClue.passes !== undefined && !selectedClue.passes && <path d={'M-7,-7 L7,7'} style={{ fill: TovelundColor.Transparent, stroke: TovelundColor.Vermillion, strokeWidth: 1 }} />}
                  {selectedClue.passes !== undefined && !selectedClue.passes && <path d={'M-7,7 L7,-7'} style={{ fill: TovelundColor.Transparent, stroke: TovelundColor.Vermillion, strokeWidth: 1 }} />}
                </g>
              </svg>
              {this.state.clueIndex + 1}/{design.getClues().length}: {convertClueDescription(selectedClue.description)}
            </div>
          </div>}
          <div className="component buttons">
            <button className="action" onClick={this.checkSolution} disabled={!canCheckSolution}>Check Solution</button>
          </div>
          {this.state.solutionPasses !== undefined && <div className="component">
            <div className="information">{this.state.solutionPasses ? "Your solution passes! Clearly you are a veteran town planner." : "Your solution fails! Society goes to heck. Negative ten points."}</div>
          </div>}
        </div>;
      }
    }


    //return <div className="section">
    //  <div className="component">
    //    <div style={{ width: "24em", margin: "auto" }}>
    //      {getTovelundMap(this.state.game, this.state.selectedElementType, this.state.selectedElementId, "NONE", -1, this.selectDestination)}
    //    </div>
    //  </div>
    //  <div className="component">
    //    {descriptions}
    //  </div>
    //  <div className="component buttons">
    //    <button className="action" onClick={this.checkSolution}>Check Solution</button>
    //  </div>
    //  {this.state.solutionPasses !== undefined && <div className="component">
    //    <div className="text">Solution {this.state.solutionPasses ? "passes" : "fails"}</div>
    //  </div>}
    //</div>;
  }
}
