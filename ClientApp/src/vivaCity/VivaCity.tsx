import * as React from "react";
import { generateTerrainGrid } from './TerrainGenerator';
import { VivaCityGrid, TerrainLocations, Token, Hint, isOdd, Tile } from './VivaCityGrid';
import { TerrainType, LocationType } from "./VivaCityTypes";

interface VivaCityState {
  tileGrid: Tile[][],
  terrainGrid: TerrainType[][],
  stage: number,
  tokens: { [id: number]: Token; },
  sizeValue: string,
  storedIds: number[],
  activeIds: number[],
  inactiveIds: number[],
  currentStoredIdIndex: number;
  selectedTokenId: number,
  happiness: number,
  highestHappiness: number,
  isUpdating: boolean
}

export class VivaCity extends React.Component<any, VivaCityState> {
  constructor(props: any) {
    super(props);

    this.state = {
      stage: 0,
      tileGrid: [],
      terrainGrid: [
        [TerrainType.ocean, TerrainType.ocean, TerrainType.plains, TerrainType.ocean, TerrainType.ocean, TerrainType.ocean, TerrainType.ocean],
        [TerrainType.ocean, TerrainType.plains, TerrainType.plains, TerrainType.plains, TerrainType.plains, TerrainType.plains, TerrainType.ocean],
        [TerrainType.ocean, TerrainType.plains, TerrainType.plains, TerrainType.ocean, TerrainType.plains, TerrainType.plains, TerrainType.ocean],
        [TerrainType.ocean, TerrainType.plains, TerrainType.plains, TerrainType.plains, TerrainType.plains, TerrainType.plains, TerrainType.ocean],
        [TerrainType.ocean, TerrainType.plains, TerrainType.plains, TerrainType.plains, TerrainType.ocean, TerrainType.plains, TerrainType.ocean],
        [TerrainType.ocean, TerrainType.ocean, TerrainType.plains, TerrainType.ocean, TerrainType.ocean, TerrainType.ocean, TerrainType.ocean]
      ],
      tokens: {},
      sizeValue: "16",
      storedIds: [],
      activeIds: [],
      inactiveIds: [],
      currentStoredIdIndex: -1,
      selectedTokenId: -1,
      happiness: 0,
      highestHappiness: 0,
      isUpdating: false
    };
  }

  handleMouseEnterDiamond = (y: number, x: number) => {
    const tileGrid = this.state.tileGrid;

    tileGrid[y][x].isHover = true;

    this.setState({
      tileGrid: tileGrid
    });
  }

  handleMouseLeaveDiamond = (y: number, x: number) => {
    const tileGrid = this.state.tileGrid;

    tileGrid[y][x].isHover = false;

    this.setState({
      tileGrid: tileGrid
    });
  }

  changeSizeValue = (sizeValue: string) => {
    this.setState({
      sizeValue: sizeValue
    });
  }

  handleClickDiamond = (y: number, x: number, tokenId: number) => {
    const offsetX: number = isOdd(y) ? 2 : 1;
    const baseTerrainType: TerrainType = this.state.terrainGrid[y + 1][(x * 2) + offsetX];

    if (this.state.selectedTokenId === -1) {
      this.setState({
        selectedTokenId: tokenId
      });
    } else if (this.state.selectedTokenId === tokenId) {
      this.setState({
        selectedTokenId: -1
      });
    } else if (baseTerrainType === this.state.tokens[this.state.selectedTokenId].baseTerrainType) {
      const tileGrid = this.state.tileGrid;
      const tokens = this.state.tokens;
      tokens[this.state.selectedTokenId].y = y;
      tokens[this.state.selectedTokenId].x = x;

      for (let y = 0; y < tileGrid.length; y++) {
        for (let x = 0; x < tileGrid[y].length; x++) {
          if (tileGrid[y][x].token !== undefined && tileGrid[y][x].token!.id === this.state.selectedTokenId) {
            tileGrid[y][x].token = undefined;
          }
        }
      }

      tileGrid[y][x].token = this.state.tokens[this.state.selectedTokenId];

      let currentStoredIdIndex: number = this.state.currentStoredIdIndex;
      let storedIds: number[] = this.state.storedIds;

      if (tokenId !== -1) {
        tokens[tokenId].y = -1;
        tokens[tokenId].x = -1;

        storedIds.push(tokenId);
      }

      if (currentStoredIdIndex == -1 && storedIds.length > 0) {
        currentStoredIdIndex = 0;
      } else if (this.state.storedIds[currentStoredIdIndex] === this.state.selectedTokenId) {
        storedIds.splice(currentStoredIdIndex, 1);

        if (storedIds.length >= 1) {
          currentStoredIdIndex = 0;
        } else {
          currentStoredIdIndex = -1;
        }
      }

      this.setState({
        tileGrid: tileGrid,
        storedIds: storedIds,
        currentStoredIdIndex: currentStoredIdIndex,
        selectedTokenId: -1,
        isUpdating: true,
        tokens: tokens
      }, this.updateHappiness);
    } else {
      this.setState({
        isUpdating: true,
        selectedTokenId: -1
      }, this.updateHappiness);
    }
  }

  updateHappiness = () => {
    const tokens = this.state.tokens;
    const tokenIds = Object.keys(tokens);

    for (let i = 0; i < tokenIds.length; i++) {
      tokens[Number(tokenIds[i])].isUnhappy = false;
    }

    const tileGrid = this.state.tileGrid;

    let happiness: number = 0;

    for (let i = 0; i < this.state.storedIds.length; i++) {
      const tokenId = this.state.storedIds[i];

      const terrainHints = Object.keys(tokens[tokenId].terrainHints);

      for (let j = 0; j < terrainHints.length; j++) {
        const terrainHint = terrainHints[j];

        tokens[tokenId].terrainHints[terrainHint].current = 0;
      }
    }

    for (let y = 0; y < tileGrid.length; y++) {
      for (let x = 0; x < tileGrid[y].length; x++) {
        const token = tileGrid[y][x].token;

        if (token !== undefined) {

          const offsetX: number = isOdd(y) ? 1 : 0;

          const terrainTypes: string[] = Object.keys(token.terrainHints);

          for (let t = 0; t < terrainTypes.length; t++) {
            token.terrainHints[terrainTypes[t]].current = 0;
          }

          const locationTypes = Object.keys(token.locationHints);

          for (let t = 0; t < locationTypes.length; t++) {
            token.locationHints[locationTypes[t]].current = 0;
          }

          // TODO loop better
          for (let terrainY = 0; terrainY <= 1; terrainY++) {
            for (let terrainX = 0; terrainX <= 2; terrainX++) {
              if (!(terrainY === 1 && terrainX === 1)) {
                const terrainType: TerrainType = this.state.terrainGrid[y + terrainY][(x * 2) + terrainX + offsetX];

                if (token.terrainHints[terrainType] !== undefined) {
                  token.terrainHints[terrainType].current++;
                }
              }
            }
          }

          const terrainHints = Object.keys(token.terrainHints);

          for (let i = 0; i < terrainHints.length; i++) {
            const hint = token.terrainHints[terrainHints[i]];

            happiness += Math.min(hint.current, hint.displayed);

            if (hint.current < hint.displayed) {
              token.isUnhappy = true;
            }
          }

          if (y - 1 >= 0 && x - 1 + offsetX >= 0 && tileGrid[y - 1][x - 1 + offsetX].token !== undefined) {
            const locationType: LocationType = tileGrid[y - 1][x - 1 + offsetX].token!.locationType;

            if (token.locationHints[locationType] !== undefined) {
              token.locationHints[locationType].current++;
            }
          }

          if (y - 1 >= 0 && x + offsetX < tileGrid[y - 1].length && tileGrid[y - 1][x + offsetX].token !== undefined) {
            const locationType: LocationType = tileGrid[y - 1][x + offsetX].token!.locationType;

            if (token.locationHints[locationType] !== undefined) {
              token.locationHints[locationType].current++;
            }
          }

          if (x - 1 >= 0 && tileGrid[y][x - 1].token !== undefined) {
            const locationType: LocationType = tileGrid[y][x - 1].token!.locationType;

            if (token.locationHints[locationType] !== undefined) {
              token.locationHints[locationType].current++;
            }
          }

          if (x + 1 < tileGrid[y].length && tileGrid[y][x + 1].token !== undefined) {
            const locationType: LocationType = tileGrid[y][x + 1].token!.locationType;

            if (token.locationHints[locationType] !== undefined) {
              token.locationHints[locationType].current++;
            }
          }

          if (y + 1 < tileGrid.length && x - 1 + offsetX >= 0 && tileGrid[y + 1][x - 1 + offsetX].token !== undefined) {
            const locationType: LocationType = tileGrid[y + 1][x - 1 + offsetX].token!.locationType;

            if (token.locationHints[locationType] !== undefined) {
              token.locationHints[locationType].current++;
            }
          }

          if (y + 1 < tileGrid.length && x + offsetX < tileGrid[y + 1].length && tileGrid[y + 1][x + offsetX].token !== undefined) {
            const locationType: LocationType = tileGrid[y + 1][x + offsetX].token!.locationType;

            if (token.locationHints[locationType] !== undefined) {
              token.locationHints[locationType].current++;
            }
          }

          for (let i = 0; i < locationTypes.length; i++) {
            const hint = token.locationHints[locationTypes[i]];

            happiness += Math.min(hint.current, hint.displayed);

            if (hint.current < hint.displayed) {
              token.isUnhappy = true;
            }
          }

          tokens[token.id] = token
        }
      }
    }

    this.setState({
      tokens: tokens,
      happiness: happiness
    }, this.updateHints);
  }

  updateHints = () => {
    const happiness: number = this.state.happiness;
    let highestHappiness: number = this.state.highestHappiness;

    if (highestHappiness >= happiness) {
      this.setState({
        isUpdating: false
      });

      return;
    }

    const tokens = this.state.tokens;
    const activeIds = this.state.activeIds;
    const inactiveIds = this.state.inactiveIds;
    const storedIds = this.state.storedIds;

    while (highestHappiness < happiness) {
      let tokenIds: string[] = Object.keys(this.state.tokens);
      const shuffledTokenIds: number[] = [];

      while (tokenIds.length > 0) {
        shuffledTokenIds.push(Number(tokenIds.splice(Math.floor(Math.random() * Math.floor(tokenIds.length)), 1)[0]));
      }

      let hintsUpdated: boolean = false;

      if (Math.random() < 1/3) {
        let tokenIndex: number = 0;

        while (!hintsUpdated && tokenIndex < shuffledTokenIds.length) {
          const tokenId = shuffledTokenIds[tokenIndex];
          const inactiveIndex = inactiveIds.indexOf(tokenId);

          if (inactiveIndex >= 0) {
            activeIds.push(tokenId);
            storedIds.push(tokenId);
            inactiveIds.splice(inactiveIndex, 1);

            hintsUpdated = true;
          }

          tokenIndex++;
        }
      }

      if (!hintsUpdated && Math.random() < 1 / 2) {
        let tokenIndex: number = 0;

        while (!hintsUpdated && tokenIndex < shuffledTokenIds.length) {
          const tokenId = shuffledTokenIds[tokenIndex];
          const inactiveIndex = inactiveIds.indexOf(tokenId);

          if (inactiveIndex < 0) {
            const token = tokens[tokenId];
            const neighbourHintIds = Object.keys(token.neighbours);
            const shuffledNeighbourHintIds: number[] = [];

            while (neighbourHintIds.length > 0) {
              shuffledNeighbourHintIds.push(Number(neighbourHintIds.splice(Math.floor(Math.random() * Math.floor(neighbourHintIds.length)), 1)[0]));
            }

            let neighbourHintIndex = 0;

            while (!hintsUpdated && neighbourHintIndex < shuffledNeighbourHintIds.length) {
              const neighbourHintId = shuffledNeighbourHintIds[neighbourHintIndex];
              const hint: boolean = token.neighbours[neighbourHintId];

              if (!hint && inactiveIds.indexOf(neighbourHintId) < 0) {
                const neighbourLocationType: LocationType = tokens[neighbourHintId].locationType;
                const hint: Hint = token.locationHints[neighbourLocationType];

                if (hint.displayed < hint.maximum && hint.current <= hint.displayed) {
                  tokens[tokenId].neighbours[neighbourHintId] = true;
                  tokens[tokenId].locationHints[tokens[neighbourHintId].locationType].displayed++;
                  tokens[tokenId].isUnhappy = true;

                  hintsUpdated = true;
                }
              }

              neighbourHintIndex++;
            }
          }

          tokenIndex++;
        }
      }

      if (!hintsUpdated) {
        let tokenIndex: number = 0;

        while (!hintsUpdated && tokenIndex < shuffledTokenIds.length) {
          const tokenId = shuffledTokenIds[tokenIndex];
          const inactiveIndex = inactiveIds.indexOf(tokenId);

          if (inactiveIndex < 0) {
            const token = tokens[tokenId];
            const terrainHints = Object.keys(token.terrainHints);
            const shuffledHints: string[] = [];

            while (terrainHints.length > 0) {
              shuffledHints.push(terrainHints.splice(Math.floor(Math.random() * Math.floor(terrainHints.length)), 1)[0]);
            }

            let terrainHintIndex = 0;
            while (!hintsUpdated && terrainHintIndex < shuffledHints.length) {
              const terrainHint = shuffledHints[terrainHintIndex];
              const hint: Hint = token.terrainHints[terrainHint];

              if (hint.displayed < hint.maximum && hint.current <= hint.displayed) {
                tokens[tokenId].terrainHints[terrainHint].displayed++;
                tokens[tokenId].isUnhappy = true;

                hintsUpdated = true;
              }

              terrainHintIndex++;
            }
          }

          tokenIndex++;
        }
      }

      if (!hintsUpdated) {
        let tokenIndex: number = 0;

        while (!hintsUpdated && tokenIndex < shuffledTokenIds.length) {
          const tokenId = shuffledTokenIds[tokenIndex];
          const inactiveIndex = inactiveIds.indexOf(tokenId);

          if (inactiveIndex >= 0) {
            activeIds.push(tokenId);
            storedIds.push(tokenId);
            inactiveIds.splice(inactiveIndex, 1);

            hintsUpdated = true;
          }

          tokenIndex++;
        }
      }

      highestHappiness++;
    }

    let currentStoredIdIndex = this.state.currentStoredIdIndex;

    if (currentStoredIdIndex === -1 && storedIds.length > 0) {
      currentStoredIdIndex = 0;
    }

    this.setState({
      highestHappiness: highestHappiness,
      tokens: tokens,
      activeIds: activeIds,
      inactiveIds: inactiveIds,
      storedIds: storedIds,
      currentStoredIdIndex: currentStoredIdIndex,
      isUpdating: false
    });
  }

  setTokenTerrainHints = (terrainHints: { [type: string]: Hint; }, type: TerrainType) => {
    const hint = terrainHints[type];

    if (hint != undefined) {
      terrainHints[type].maximum += 1;
    } else {
      terrainHints[type] = { current: 0, displayed: 0, maximum: 1 };
    }

    return terrainHints;
  }

  setTokenLocationHints = (locationHints: { [type: string]: Hint; }, type: LocationType) => {
    const hint = locationHints[type];

    if (hint != undefined) {
      locationHints[type].maximum += 1;
    } else {
      locationHints[type] = { current: 0, displayed: 0, maximum: 1 };
    }

    return locationHints;
  }

  nextSelectedStoredIdIndex = () => {
    this.setState(prevState => ({
      currentStoredIdIndex: (prevState.currentStoredIdIndex + 1) % prevState.storedIds.length,
      selectedTokenId: -1
    }));
  }

  lockSelectedToken = () => {
    if (this.state.selectedTokenId !== -1) {
      const tokens = this.state.tokens;

      tokens[this.state.selectedTokenId].isLocked = !tokens[this.state.selectedTokenId].isLocked;

      this.setState({
        selectedTokenId: -1,
        tokens: tokens
      });
    }
  }

  setStartingHints = (token: Token) => {
    const terrainHints: string[] = Object.keys(token.terrainHints);

    const terrainHint: string = terrainHints[Math.floor(Math.random() * Math.floor(terrainHints.length))];

    token.terrainHints[terrainHint].displayed++;

    return token;
  }

  startGame = () => {
    const terrainGrid: TerrainType[][] = generateTerrainGrid(Number(this.state.sizeValue));

    const tokenGrid: (Token | undefined)[][] = [];
    const tokenHeight = (Number(this.state.sizeValue) * 2) - 1;
    let id = 0;

    // TODO procedurally generate zones better

    for (let y = 0; y < tokenHeight; y++) {
      const row: Token[] = [];
      const rowLength: number = Number(this.state.sizeValue) - (isOdd(y) ? 1 : 0);
      const offsetX: number = isOdd(y) ? 2 : 1;

      for (let x = 0; x < rowLength; x++) {
        const baseTerrainType: TerrainType = terrainGrid[y + 1][(x * 2) + offsetX];
        const locations: LocationType[] = TerrainLocations[baseTerrainType];

        row.push({ id: id++, isLocked: false, baseTerrainType: baseTerrainType, locationType: locations[Math.floor(Math.random() * Math.floor(locations.length))], terrainHints: {}, locationHints: {}, neighbours: {}, isUnhappy: false, x: -1, y: -1 });
      }

      tokenGrid.push(row);
    }

    for (let y = 0; y < tokenGrid.length; y++) {
      const row: (Token | undefined)[] = tokenGrid[y];

      for (let x = 0; x < row.length; x++) {
        const token: (Token | undefined) = row[x];

        if (token !== undefined) {
          const offsetX: number = isOdd(y) ? 1 : 0;

          token.terrainHints = this.setTokenTerrainHints(token.terrainHints, terrainGrid[y][(x * 2) + offsetX]);
          token.terrainHints = this.setTokenTerrainHints(token.terrainHints, terrainGrid[y][(x * 2) + 1 + offsetX]);
          token.terrainHints = this.setTokenTerrainHints(token.terrainHints, terrainGrid[y][(x * 2) + 2 + offsetX]);
          token.terrainHints = this.setTokenTerrainHints(token.terrainHints, terrainGrid[y + 1][(x * 2) + offsetX]);
          token.terrainHints = this.setTokenTerrainHints(token.terrainHints, terrainGrid[y + 1][(x * 2) + 2 + offsetX]);

          if (y - 1 >= 0 && x - 1 + offsetX >= 0 && tokenGrid[y - 1][x - 1 + offsetX] !== undefined) {
            token.neighbours[tokenGrid[y - 1][x - 1 + offsetX]!.id] = false;
            token.locationHints = this.setTokenLocationHints(token.locationHints, tokenGrid[y - 1][x - 1 + offsetX]!.locationType);
          }

          if (y - 1 >= 0 && x + offsetX < tokenGrid[y - 1].length && tokenGrid[y - 1][x + offsetX] !== undefined) {
            token.neighbours[tokenGrid[y - 1][x + offsetX]!.id] = false;
            token.locationHints = this.setTokenLocationHints(token.locationHints, tokenGrid[y - 1][x + offsetX]!.locationType);
          }

          if (x - 1 >= 0 && tokenGrid[y][x - 1] !== undefined) {
            token.neighbours[tokenGrid[y][x - 1]!.id] = false;
            token.locationHints = this.setTokenLocationHints(token.locationHints, tokenGrid[y][x - 1]!.locationType);
          }

          if (x + 1 < tokenGrid[y].length && tokenGrid[y][x + 1] !== undefined) {
            token.neighbours[tokenGrid[y][x + 1]!.id] = false;
            token.locationHints = this.setTokenLocationHints(token.locationHints, tokenGrid[y][x + 1]!.locationType);
          }

          if (y + 1 < tokenGrid.length && x - 1 + offsetX >= 0 && tokenGrid[y + 1][x - 1 + offsetX] !== undefined) {
            token.neighbours[tokenGrid[y + 1][x - 1 + offsetX]!.id] = false;
            token.locationHints = this.setTokenLocationHints(token.locationHints, tokenGrid[y + 1][x - 1 + offsetX]!.locationType);
          }

          if (y + 1 < tokenGrid.length && x + offsetX < tokenGrid[y + 1].length && tokenGrid[y + 1][x + offsetX] !== undefined) {
            token.neighbours[tokenGrid[y + 1][x + offsetX]!.id] = false;
            token.locationHints = this.setTokenLocationHints(token.locationHints, tokenGrid[y + 1][x + offsetX]!.locationType);
          }
        }
      }
    }

    const tokens: { [id: number]: Token; } = {};

    for (let y = 0; y < tokenGrid.length; y++) {
      const row = tokenGrid[y];

      for (let x = 0; x < row.length; x++) {
        const token: (Token | undefined) = row[x];

        if (token !== undefined) {
          tokens[token.id] = token;
        }
      }
    }

    const tokenIds: string[] = Object.keys(tokens);

    for (let i = 0; i < tokenIds.length; i++) {
      tokens[i] = this.setStartingHints(tokens[i]);
    }

    const shuffledTokenIds: number[] = [];

    while (tokenIds.length > 0) {
      shuffledTokenIds.push(Number(tokenIds.splice(Math.floor(Math.random() * Math.floor(tokenIds.length)), 1)[0]));
    }

    const storedIds: number[] = shuffledTokenIds.splice(0, 3);
    const activeIds: number[] = [...storedIds];
    const inactiveIds: number[] = [...shuffledTokenIds];

    const tileGrid: Tile[][] = [];

    for (let y = 0; y < tokenHeight; y++) {
      const row: Tile[] = [];
      const tokenWidth: number = Number(this.state.sizeValue) - (isOdd(y) ? 1 : 0);

      for (let x = 0; x < tokenWidth; x++) {
        row.push({ isHover: false, token: undefined });
      }

      tileGrid.push(row);
    }

    this.setState({
      terrainGrid: terrainGrid,
      tileGrid: tileGrid,
      stage: 1,
      tokens: tokens,
      activeIds: activeIds,
      inactiveIds: inactiveIds,
      storedIds: storedIds,
      currentStoredIdIndex: 0,
      selectedTokenId: -1,
      happiness: 0,
      highestHappiness: 0
    });
  }

  clickStoredToken = () => {
    if (this.state.selectedTokenId == this.state.storedIds[this.state.currentStoredIdIndex]) {
      this.setState({
        selectedTokenId: -1
      })
    } else {
      this.setState({
        selectedTokenId: this.state.storedIds[this.state.currentStoredIdIndex]
      })
    }
  }

  resetGame = () => {
    this.setState({
      stage: 0
    });
  }

  render() {
    switch (this.state.stage) {
      case 0:
        const size: number = Number(this.state.sizeValue);
        const error: boolean = isNaN(size) || size < 3 || size > 16;

        return <>
          <div className="component">
            <label htmlFor="size">Size (between 4 and 16)</label>
            <br />
            <input type="text" id="size" defaultValue={this.state.sizeValue} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changeSizeValue(event.target.value)} className={error ? "error" : ""} />
          </div>
          <div className="component buttons">
            <button className="action" disabled={error} onClick={this.startGame}>Create Game</button>
          </div>
        </>;
      case 1:
        let terrainHints: JSX.Element[] = [];
        let locationHints: JSX.Element[] = [];
        let neighbourHints: JSX.Element[] = [];

        if (this.state.selectedTokenId !== -1) {
          const selectedToken = this.state.tokens[this.state.selectedTokenId];
          const terrainTypes: string[] = Object.keys(selectedToken.terrainHints);
          const locationTypes: string[] = Object.keys(selectedToken.locationHints);
          const neighbours: string[] = Object.keys(selectedToken.neighbours);

          for (let i = 0; i < terrainTypes.length; i++) {
            if (selectedToken.terrainHints[terrainTypes[i]].displayed > 0) {
              terrainHints.push(<div key={`terrainhint${i}`}>{terrainTypes[i]}: displayed {selectedToken.terrainHints[terrainTypes[i]].displayed}, current {selectedToken.terrainHints[terrainTypes[i]].current}</div>);
            }
          }

          for (let i = 0; i < locationTypes.length; i++) {
            if (selectedToken.locationHints[locationTypes[i]].displayed > 0) {
              locationHints.push(<div key={`locationhint${i}`}>{locationTypes[i]}: displayed {selectedToken.locationHints[locationTypes[i]].displayed}, current {selectedToken.locationHints[locationTypes[i]].current}</div>);
            }
          }

          for (let i = 0; i < neighbours.length; i++) {
            if (selectedToken.neighbours[Number(neighbours[i])]) {
              neighbourHints.push(<div>Token Id: {neighbours[i]} is {selectedToken.neighbours[Number(neighbours[i])] ? "true" : "false"}</div>);
            }
          }
        }

        return <>
          <VivaCityGrid
            onClick={this.handleClickDiamond}
            onMouseEnter={this.handleMouseEnterDiamond}
            onMouseLeave={this.handleMouseLeaveDiamond}
            terrainGrid={this.state.terrainGrid}
            tileGrid={this.state.tileGrid}
            selectedTokenId={this.state.selectedTokenId}
          />
          {!this.state.isUpdating && this.state.currentStoredIdIndex >= 0 && <>
            <button onClick={this.clickStoredToken} style={{ backgroundColor: this.state.currentStoredIdIndex !== -1 && this.state.storedIds[this.state.currentStoredIdIndex] === this.state.selectedTokenId ? "#0f0" : "#ff0" }}>
              {this.state.tokens[this.state.storedIds[this.state.currentStoredIdIndex]].locationType}
            </button>
            <button onClick={this.nextSelectedStoredIdIndex}>Next</button>
          </>}
          <button onClick={this.lockSelectedToken}>Lock</button>
          <br />
          <button onClick={this.resetGame}>Reset</button>
          <br />
          {this.state.selectedTokenId !== -1 && <div>
            {this.state.selectedTokenId === 1000000 && <div>Token Id is {this.state.selectedTokenId}</div>}
            <div>Location is {this.state.tokens[this.state.selectedTokenId].locationType}</div>
            <div>Base is {this.state.tokens[this.state.selectedTokenId].baseTerrainType}</div>
            {this.state.selectedTokenId === 1000000 && <div>Y is {this.state.tokens[this.state.selectedTokenId].y}</div>}
            {this.state.selectedTokenId === 1000000 && <div>X is {this.state.tokens[this.state.selectedTokenId].x}</div>}
            {terrainHints}
            {locationHints}
          </div>}
          <br />
          <div>Is updating: {this.state.isUpdating ? "true" : "false"}</div>
          {this.state.selectedTokenId === 1000000 && <>
            <div>Stored Token Id Index: {this.state.currentStoredIdIndex}</div>
            <div>Stored token ids: {this.state.storedIds.sort((a: number, b: number) => a - b).map((value: number, index: number) => <span key={`stord${index}`}>[{value}]</span>)}</div>
            <div>Active token ids: {this.state.activeIds.sort((a: number, b: number) => a - b).map((value: number, index: number) => <span key={`active${index}`}>[{value}]</span>)}</div>
            <div>Inactive token ids: {this.state.inactiveIds.sort((a: number, b: number) => a - b).map((value: number, index: number) => <span key={`inactv${index}`}>[{value}]</span>)}</div>
          </>}
        </>;
        
    }

    return <div>Error</div>;
  }
}
