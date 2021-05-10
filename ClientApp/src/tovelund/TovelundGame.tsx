import * as React from "react";
import { TovelundColor, TovelundElementType, TovelundGame, TovelundGameDetails, TovelundRangeRule, TovelundRelationshipRule, TovelundSymbol, TovelundElementId } from "./TovelundEnums";
import { getTovelundMap } from "./TovelundMap";

const symbolMapList = [
  [],
  [{ x: 6.9, y: 9.25 }],
  [{x: 4.9, y: 9.25}, {x: 8.9, y: 9.25}]
]

interface TovelundGameState {
  selectedGameId: number,
  games: TovelundGameDetails[],
  gameId?: number,
  gameTitle: string,
  game: TovelundGame,
  selectedElementType: string,
  selectedElementId: number,
  mode: TovelundColor,
  solutionPasses?: boolean
}

export class Tovelund extends React.Component<any, TovelundGameState> {
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
      selectedElementType: TovelundElementType.None,
      selectedElementId: -1,
      mode: TovelundColor.Orange
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
                gameId: this.state.selectedGameId,
                solutionPasses: undefined
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

  selectDestination = (id: number) => {
    this.setState({
      selectedElementType: TovelundElementType.Destination,
      selectedElementId: id
    });
  }

  selectDrawMode = (mode: TovelundColor) => {
    this.setState({
      mode: mode
    });
  }

  selectSymbol = (symbolName: string) => {
    const game = this.state.game;

    if (this.state.selectedElementType === TovelundElementType.Destination) {
      const destination = game.destinations.filter(d => d.id === this.state.selectedElementId)[0];

      if (this.state.mode === TovelundColor.Black) {
        if (destination.selectedName === symbolName) {
          destination.selectedName = undefined;
        } else {
          destination.selectedName = symbolName;
        }
      } else {
        if (destination.selectedName === symbolName) {
          destination.selectedName = undefined;
        }

        destination.symbolColors[symbolName] = this.state.mode;
      }
    }

    this.setState({
      game: game
    });
  }

  checkSolution = () => {
    const game = this.state.game;
    var solutionPasses = true;

    for (var i = 0; i < game.clues.length; i++) {
      var cluePasses = true;
      const clue = game.clues[i];

      for (var j = 0; j < clue.rules.length; j++) {
        const rule = clue.rules[j];

        if (rule.ruleType === "RANGE") {
          const rangeRule = rule as TovelundRangeRule;
          let count = 0;

          if (rangeRule.element.type === TovelundElementType.Destination) {
            for (var k = 0; k < game.destinations.length; k++) {
              const destination = game.destinations[k];

              if (destination.fixedName === rangeRule.element.name || destination.selectedName === rangeRule.element.name) {
                count++;
              }
            }
          }

          if ((rangeRule.min && count < rangeRule.min) || (rangeRule.max && count > rangeRule.max)) {
            solutionPasses = false;
            cluePasses = false;
          }
        }

        if (rule.ruleType === "RELATIONSHIP") {
          const requirementRule = rule as TovelundRelationshipRule;

          if (requirementRule.element.type === TovelundElementType.Destination) {
            for (var k = 0; k < game.destinations.length; k++) {
              const destination = game.destinations[k];

              if (destination.fixedName === requirementRule.element.name || destination.selectedName === requirementRule.element.name) {
                const relationships = game.relationships.filter(r => r.filter(s => s.type === TovelundElementType.Destination && s.id === destination.id).length > 0);
                let match = requirementRule.mode === "INCLUDE" ? false : true;

                for (var l = 0; l < relationships.length; l++) {
                  const relationship: TovelundElementId[] = relationships[l].filter(r => !(r.type === TovelundElementType.Destination && r.id === destination.id));

                  for (var m = 0; m < relationship.length; m++) {
                    const relationshipElement = relationship[m];

                    const relationshipElements = requirementRule.relationshipElements;

                    for (var n = 0; n < relationshipElements.length; n++) {
                      const relationship = relationshipElements[n];
                      const requiredType = relationship.type;
                      const requiredName = relationship.name;
                      const relationshipType = relationshipElement.type;
                      const relationshipId = relationshipElement.id;

                      if (requiredType === relationshipType) {
                        if (requiredType === TovelundElementType.Zone) {
                          const zone = game.zones.filter(z => z.id === relationshipId)[0];

                          if (zone.name === requiredName) {
                            match = requirementRule.mode === "INCLUDE" ? true : false;
                          }
                        }
                      }
                    }
                  }
                }

                if (!match) {
                  solutionPasses = false;
                  cluePasses = false;
                }
              }
            }
          }
        }
      }

      clue.passes = cluePasses;
    }

    this.setState({
      game: game,
      solutionPasses: solutionPasses
    });
  }

  render() {
    const gameOptions: JSX.Element[] = this.state.games.map((game: TovelundGameDetails, index: number) =>
      <option key={`gameId${game.id}`} value={game.id}>{game.title}</option>
    );

    const symbols = this.state.game.symbols.filter(s => s.type === this.state.selectedElementType);
    const symbolMap = symbolMapList[symbols.length];

    const symbolsElement: JSX.Element[] = symbols.map((symbol: TovelundSymbol, index: number) => {
      if (this.state.selectedElementType === TovelundElementType.Destination) {
        const destination = this.state.game.destinations.filter(d => d.id === this.state.selectedElementId)[0];

        let fill = TovelundColor.Orange;

        if (destination.fixedName === symbol.name || destination.selectedName === symbol.name) {
          fill = TovelundColor.White;
        } else if (destination.symbolColors[symbol.name]) {
          fill = destination.symbolColors[symbol.name];
        }

        return <text key={`symbol${index}`} x={symbolMap[index].x} y={symbolMap[index].y} onClick={() => this.selectSymbol(symbol.name)} style={{ fill: fill, cursor: "pointer", fontFamily: "monospace", fontSize: 4 }}>{symbol.symbol}</text>;
      } else {
        // TODO for different Element Types
        return <text key={`symbol${index}`} x={symbolMap[index].x} y={symbolMap[index].y} onClick={() => this.selectSymbol(symbol.name)} style={{ fill: TovelundColor.Orange, cursor: "pointer", fontFamily: "monospace", fontSize: 4 }}>?</text>;
      }
    });

    let descriptions: JSX.Element[] = [];

    for (var i = 0; i < this.state.game.clues.length; i++) {
      const clue = this.state.game.clues[i];
      const descriptionElements = clue.description.split("|");

      const description: (string | JSX.Element)[] = [];

      for (let i = 0; i < descriptionElements.length; i++) {
        const descriptionElement = descriptionElements[i];

        if (this.state.game.symbols.filter(s => s.name === descriptionElement).length) {
          const symbol = this.state.game.symbols.filter(s => s.name === descriptionElement)[0].symbol;

          description.push(<span style={{ color: TovelundColor.Blue }}>{symbol}</span>);
        } else {
          description.push(descriptionElement);
        }
      }

      descriptions.push(<div className="text" style={{ color: clue.passes === undefined || clue.passes ? TovelundColor.Black : TovelundColor.ReddishPurple }}>
        {description}
      </div>);
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
        <div style={{ width: "8em", margin: "auto" }}>
          <svg
            key="TovelundMap"
            viewBox={`0 0 16 12`}
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            xmlSpace="preserve"
            className="image right"
            style={{ fillRule: "evenodd", clipRule: "evenodd", strokeLinejoin: "round", strokeMiterlimit: 2, overflow: "visible", maxWidth: "100%" }}>
            <rect x={0} y={0} width={16} height={12} style={{ fill: TovelundColor.White, stroke: TovelundColor.Black, strokeWidth: 0.5 }} />
            <rect x={0} y={4} width={16} height={8} style={{ fill: TovelundColor.Black, stroke: TovelundColor.Black, strokeWidth: 0.5 }} />
            <g onClick={() => this.selectDrawMode(TovelundColor.Yellow)} style={{ cursor: "pointer" }}>
              <rect x="1" y="1" width={2} height={2} style={{ fill: TovelundColor.White }} />
              <path d="M1,3L2,3" style={{ stroke: TovelundColor.Yellow, strokeWidth: 0.2 }} />
              <path d="M2,2.8L3,1" style={{ stroke: TovelundColor.Yellow, strokeWidth: 0.5 }} />
              {this.state.mode === TovelundColor.Yellow && <path d="M1,3.5L3,3.5" style={{ stroke: TovelundColor.Black, strokeWidth: 0.5 }} />}
            </g>
            <g onClick={() => this.selectDrawMode(TovelundColor.Orange)} style={{ cursor: "pointer" }}>
              <rect x="5" y="1" width={2} height={2} style={{ fill: TovelundColor.White }} />
              <path d="M5,3L6,3" style={{ stroke: TovelundColor.Orange, strokeWidth: 0.2 }} />
              <path d="M6,2.8L7,1" style={{ stroke: TovelundColor.Orange, strokeWidth: 0.5 }} />
              {this.state.mode === TovelundColor.Orange && <path d="M5,3.5L7,3.5" style={{ stroke: TovelundColor.Black, strokeWidth: 0.5 }} />}
            </g>
            <g onClick={() => this.selectDrawMode(TovelundColor.Vermillion)} style={{ cursor: "pointer" }}>
              <rect x={9} y={1} width={2} height={2} style={{ fill: TovelundColor.White }} />
              <path d="M9,3L10,3" style={{ stroke: TovelundColor.Vermillion, strokeWidth: 0.2 }} />
              <path d="M10,2.8L11,1" style={{ stroke: TovelundColor.Vermillion, strokeWidth: 0.5 }} />
              {this.state.mode === TovelundColor.Vermillion && <path d="M9,3.5L11,3.5" style={{ stroke: TovelundColor.Black, strokeWidth: 0.5 }} />}
            </g>
            <g onClick={() => this.selectDrawMode(TovelundColor.Black)} style={{ cursor: "pointer" }}>
              <rect x={13} y={1} width={2} height={2} style={{ fill: TovelundColor.White }} />
              <path d="M13,2L13.67,3L15,1" style={{ fill: TovelundColor.Transparent, stroke: TovelundColor.Black, strokeWidth: 0.5 }} />
              {this.state.mode === TovelundColor.Black && <path d="M13,3.5L15,3.5" style={{ stroke: TovelundColor.Black, strokeWidth: 0.5 }} />}
            </g>
            {symbolsElement}
          </svg>
        </div>
      </div>
      <div className="component">
        <div style={{ width: "24em", margin: "auto" }}>
          {getTovelundMap(this.state.game, this.state.selectedElementType, this.state.selectedElementId, "NONE", -1, this.selectDestination)}
        </div>
      </div>
      <div className="component">
        {descriptions}
      </div>
      <div className="component buttons">
        <button className="action" onClick={this.checkSolution}>Check Solution</button>
      </div>
      {this.state.solutionPasses !== undefined && <div className="component">
        <div className="text">Solution {this.state.solutionPasses ? "passes" : "fails"}</div>
      </div>}
    </div>;
  }
}
