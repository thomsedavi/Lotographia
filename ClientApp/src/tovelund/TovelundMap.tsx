import * as React from "react";
import { TovelundEntity, TovelundFeatureType, TovelundPointSize, TovelundLine, TovelundPoint } from "./TovelundEnums";
import { TovelundPuzzleDesignClass } from "./TovelundPuzzleDesignClass";
import { LotographiaColor, getColor } from "../common/Colors";

export const getTovelundMap = (puzzle: TovelundPuzzleDesignClass, selectEntityId: (entityId: string) => void, selectedElementIdz: string[], mode: "PREVIEW" | "DEV" | "SOLVE") => {
  const scale = puzzle.getScale();
  const xOffset = 0.6 * scale;
  const yOffset = 0.4 * scale;

  const overlayElements: JSX.Element[] = [];

  const layersElements = puzzle.getEntities().map((entity: TovelundEntity) => {
    const featureId = entity.fixedFeatureId !== undefined ? entity.fixedFeatureId : entity.selectedFeatureId;

    let feature: { id: string, type: string, symbol: string } | undefined = undefined;

    if (featureId) {
      feature = puzzle.getFeatureCollection(entity.featureCollectionId).set.filter(f => f.id === featureId)[0];
    }

    const color = puzzle.getFeatureCollection(entity.featureCollectionId).color;

    const entityElements: JSX.Element[] = [];

    const lines = [...entity.lines];
    lines.sort((line: { id: string, vertices: { id: string }[] }) => selectedElementIdz.indexOf(line.id) !== -1 || line.vertices.filter(vertex => selectedElementIdz.indexOf(vertex.id) !== -1).length > 0 ? 1 : -1);

    lines.map((line: TovelundLine) => {
      const vertices = [...line.vertices];

      if (line.attributes["IsClosed"]) {
        vertices.push(vertices[0]);
      }

      const selectedVertex = vertices.filter(vertex => selectedElementIdz.indexOf(vertex.id) !== -1)[0];
      let stroke = getColor(color, 3);

      if (selectedElementIdz.indexOf(line.id) !== -1 || selectedVertex !== undefined) {
        stroke = LotographiaColor.Black;
      }

      if (selectedVertex !== undefined) {
        overlayElements.push(<circle key={`selected_point`} cx={selectedVertex.x + xOffset} cy={selectedVertex.y + yOffset} r={2} style={{ fill: LotographiaColor.Transparent, stroke: LotographiaColor.Black, strokeWidth: 0.005 * scale }} />)
      }

      let paths: JSX.Element[] = [];

      if (!line.attributes["IsBorder"] && feature && (feature.type === TovelundFeatureType.Railway || feature.type === TovelundFeatureType.Road)) {
        for (let i = 0; i < vertices.length - 1; i++) {
          const previousVertex = i > 0 ? vertices[i - 1] : undefined;
          const startVertex = vertices[i];
          const endVertex = vertices[i + 1];
          const nextVertex = i < vertices.length - 2 ? vertices[i + 2] : undefined

          if (startVertex.x === endVertex.x) {
            const vertex1 = startVertex.y < endVertex.y ? previousVertex : nextVertex;
            const vertex2 = startVertex.y < endVertex.y ? startVertex : endVertex;
            const vertex3 = startVertex.y < endVertex.y ? endVertex : startVertex;
            const vertex4 = startVertex.y < endVertex.y ? nextVertex : previousVertex;

            const topLeft = vertex1 ? (vertex1.x < vertex2.x ? vertex2.y + 2 : vertex2.y - 2) : vertex2.y;
            const topRight = vertex1 ? (vertex1.x < vertex2.x ? vertex2.y - 2 : vertex2.y + 2) : vertex2.y;
            const bottomRight = vertex4 ? (vertex4.x < vertex3.x ? vertex3.y + 2 : vertex3.y - 2) : vertex3.y;
            const bottomLeft = vertex4 ? (vertex4.x < vertex3.x ? vertex3.y - 2 : vertex3.y + 2) : vertex3.y;

            paths.push(<mask key={`entity${entity.id}line${line.id}mask${i}`} id={`entity${entity.id}line${line.id}mask${i}`}>
              <path d={`M${startVertex.x - 2},${topLeft}L${startVertex.x + 2},${topRight}L${startVertex.x + 2},${bottomRight}L${startVertex.x - 2},${bottomLeft}Z`} fill={LotographiaColor.White} />
            </mask>);

            const pathFeatures: JSX.Element[] = [];

            if (feature.type === TovelundFeatureType.Railway) {
              for (var j = vertex2.y - 4; j < vertex3.y + 4; j += 1) {
                pathFeatures.push(<path key={`entity${entity.id}line${line.id}segment${i}part${j}`} d={`M${startVertex.x - 1.5},${j}L${startVertex.x + 1.5},${j}`} style={{ fill: LotographiaColor.Transparent, stroke: LotographiaColor.Black, strokeWidth: 0.005 * scale }} />);
              }

              paths.push(<g key={`entity${entity.id}line${line.id}segment${i}`} mask={`url(#entity${entity.id}line${line.id}mask${i})`} >
                <path d={`M${startVertex.x - 2},${vertex2.y - 4}L${startVertex.x - 2},${vertex3.y + 4},L${startVertex.x + 2},${vertex3.y + 4}L${startVertex.x + 2},${vertex2.y - 4}Z`} style={{ fill: LotographiaColor.White, stroke: LotographiaColor.Transparent }} />
                <path d={`M${startVertex.x - 1},${vertex2.y - 4}L${startVertex.x - 1},${vertex3.y + 4}`} style={{ stroke: LotographiaColor.Orange3, strokeWidth: 0.005 * scale }} />
                <path d={`M${startVertex.x + 1},${vertex2.y - 4}L${startVertex.x + 1},${vertex3.y + 4}`} style={{ stroke: LotographiaColor.Orange3, strokeWidth: 0.005 * scale }} />
                {pathFeatures}
              </g>);
            } else if (feature.type === TovelundFeatureType.Road) {
              for (var j = vertex2.y - 4; j < vertex3.y + 4; j += 2) {
                pathFeatures.push(<path key={`entity${entity.id}line${line.id}segment${i}part${j}`} d={`M${startVertex.x},${j}L${startVertex.x},${j + 1}`} style={{ fill: LotographiaColor.Transparent, stroke: LotographiaColor.Blue4, strokeWidth: 0.005 * scale }} />);
              }

              paths.push(<g key={`entity${entity.id}line${line.id}segment${i}`} mask={`url(#entity${entity.id}line${line.id}mask${i})`} >
                <path d={`M${startVertex.x - 2},${vertex2.y - 4}L${startVertex.x - 2},${vertex3.y + 4},L${startVertex.x + 2},${vertex3.y + 4}L${startVertex.x + 2},${vertex2.y - 4}Z`} style={{ fill: LotographiaColor.White, stroke: LotographiaColor.Transparent }} />
                <path d={`M${startVertex.x - 1},${vertex2.y - 4}L${startVertex.x - 1},${vertex3.y + 4}`} style={{ stroke: LotographiaColor.Black, strokeWidth: 0.005 * scale }} />
                <path d={`M${startVertex.x + 1},${vertex2.y - 4}L${startVertex.x + 1},${vertex3.y + 4}`} style={{ stroke: LotographiaColor.Black, strokeWidth: 0.005 * scale }} />
                {pathFeatures}
              </g>);
            }
          } else if (startVertex.y === endVertex.y) {
            const vertex1 = startVertex.x < endVertex.x ? previousVertex : nextVertex;
            const vertex2 = startVertex.x < endVertex.x ? startVertex : endVertex;
            const vertex3 = startVertex.x < endVertex.x ? endVertex : startVertex;
            const vertex4 = startVertex.x < endVertex.x ? nextVertex : previousVertex;

            const topLeft = vertex1 ? (vertex1.y < vertex2.y ? vertex2.x + 2 : vertex2.x - 2) : vertex2.x;
            const bottomLeft = vertex1 ? (vertex1.y < vertex2.y ? vertex2.x - 2 : vertex2.x + 2) : vertex2.x;
            const bottomRight = vertex4 ? (vertex4.y < vertex3.y ? vertex3.x + 2 : vertex3.x - 2) : vertex3.x;
            const topRight = vertex4 ? (vertex4.y < vertex3.y ? vertex3.x - 2 : vertex3.x + 2) : vertex3.x;

            paths.push(<mask key={`entity${entity.id}line${line.id}mask${i}`} id={`entity${entity.id}line${line.id}mask${i}`}>
              <path d={`M${topLeft},${startVertex.y - 2}L${topRight},${startVertex.y - 2}L${bottomRight},${startVertex.y + 2}L${bottomLeft},${startVertex.y + 2}Z`} fill={LotographiaColor.White} />
            </mask>);

            const pathFeatures: JSX.Element[] = [];

            if (feature.type === TovelundFeatureType.Railway) {
              for (var j = vertex2.x - 4; j < vertex3.x + 4; j += 2) {
                pathFeatures.push(<path key={`entity${entity.id}line${line.id}segment${i}part${j}`} d={`M${j},${startVertex.y - 1.5}L${j},${startVertex.y + 1.5}`} style={{ fill: LotographiaColor.Transparent, stroke: LotographiaColor.Black, strokeWidth: 0.005 * scale }} />);
              }

              paths.push(<g key={`entity${entity.id}line${line.id}segment${i}`} mask={`url(#entity${entity.id}line${line.id}mask${i})`} >
                <path d={`M${vertex2.x - 4},${startVertex.y - 2}L${vertex3.x + 4},${startVertex.y - 2}L${vertex3.x + 4},${startVertex.y + 2}L${vertex2.x - 4},${startVertex.y + 2}Z`} style={{ fill: LotographiaColor.White, stroke: LotographiaColor.Transparent }} />
                <path d={`M${vertex2.x - 4},${startVertex.y - 1}L${vertex3.x + 4},${startVertex.y - 1}`} style={{ fill: LotographiaColor.Transparent, stroke: LotographiaColor.Orange3, strokeWidth: 0.005 * scale }} />
                <path d={`M${vertex2.x - 4},${startVertex.y + 1}L${vertex3.x + 4},${startVertex.y + 1}`} style={{ fill: LotographiaColor.Transparent, stroke: LotographiaColor.Orange3, strokeWidth: 0.005 * scale }} />
                {pathFeatures}
              </g>);
            } else if (feature.type === TovelundFeatureType.Road) {
              for (var j = vertex2.x - 4; j < vertex3.x + 4; j += 3) {
                pathFeatures.push(<path key={`entity${entity.id}line${line.id}segment${i}part${j}`} d={`M${j},${startVertex.y}L${j + 1.5},${startVertex.y}`} style={{ fill: LotographiaColor.Transparent, stroke: LotographiaColor.Blue4, strokeWidth: 0.005 * scale }} />);
              }

              paths.push(<g key={`entity${entity.id}line${line.id}segment${i}`} mask={`url(#entity${entity.id}line${line.id}mask${i})`} >
                <path d={`M${vertex2.x - 4},${startVertex.y - 2}L${vertex3.x + 4},${startVertex.y - 2}L${vertex3.x + 4},${startVertex.y + 2}L${vertex2.x - 4},${startVertex.y + 2}Z`} style={{ fill: LotographiaColor.White, stroke: LotographiaColor.Transparent }} />
                <path d={`M${vertex2.x - 4},${startVertex.y - 1}L${vertex3.x + 4},${startVertex.y - 1}`} style={{ fill: LotographiaColor.Transparent, stroke: LotographiaColor.Black, strokeWidth: 0.005 * scale }} />
                <path d={`M${vertex2.x - 4},${startVertex.y + 1}L${vertex3.x + 4},${startVertex.y + 1}`} style={{ fill: LotographiaColor.Transparent, stroke: LotographiaColor.Black, strokeWidth: 0.005 * scale }} />
                {pathFeatures}
              </g>);
            }
          } else {
            paths.push(<path key={`entity${entity.id}line${line.id}segment${i}`} d={`M${startVertex.x},${startVertex.y}L${endVertex.x},${endVertex.y}`} style={{ fill: LotographiaColor.Transparent, stroke: stroke, strokeWidth: 0.005 * scale }} />);
          }
        }
      } else {
        for (let i = 0; i < vertices.length - 1; i++) {
          const startVertex = vertices[i];
          const endVertex = vertices[i + 1];

          if (line.attributes["IsBorder"]) {
            paths.push(<path key={`entity${entity.id}line${line.id}segment${i}`} d={`M${startVertex.x},${startVertex.y}L${endVertex.x},${endVertex.y}`} style={{ fill: LotographiaColor.Transparent, stroke: stroke, strokeWidth: 0.005 * scale }} />);
          } else {
            paths.push(<path key={`entity${entity.id}line${line.id}segment${i}`} d={`M${startVertex.x},${startVertex.y}L${endVertex.x},${endVertex.y}`} style={{ fill: LotographiaColor.Transparent, stroke: stroke, strokeWidth: 0.005 * scale, strokeDasharray: "2 2" }} />);
          }
        }
      }

      entityElements.push(<g key={`entity${entity.id}line${line.id}`} transform={`translate(${xOffset} ${yOffset}) rotate(0)`}>
        {paths}
      </g>);
    });

    const points = [...entity.points];
    points.sort((point: { id: string }) => selectedElementIdz.indexOf(point.id) !== -1 ? 1 : -1);

    points.map((point: TovelundPoint) => {
      const r: number = point.attributes["Size"] === TovelundPointSize.Small ? 2 : point.attributes["Size"] === TovelundPointSize.Large ? 4 : 3;
      const pointIsSelected = selectedElementIdz.indexOf(point.id) !== -1;

      if (mode === "DEV") {
        entityElements.push(<g key={`entity${entity.id}point${point.id}circle`} transform={`matrix(1,0,0,1,${xOffset},${yOffset})`}>
          <circle cx={point.x} cy={point.y} r={r} style={{ fill: LotographiaColor.White, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Green3, strokeWidth: 0.0025 * scale }} />
        </g>);
      }

      let pointElement: JSX.Element | undefined = undefined;

      // 1, 0
      // 0.95, 0.31
      // 0.9, 0.44
      // 0.8, 0.6

      if (feature && feature.type === TovelundFeatureType.Mountain) {
        pointElement = <g key={`entity${entity.id}point${point.id}`} transform={`matrix(1,0,0,1,${xOffset},${yOffset})`}>
          <path d={`M${point.x - (r * 0.9)},${point.y + (r * 0.44)}L${point.x},${point.y - (r * 0.44)}L${point.x + (r * 0.9)},${point.y + (r * 0.44)}`} style={{ fill: LotographiaColor.Transparent, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Orange3, strokeWidth: 0.005 * scale }} />
        </g>;
      } else if (feature && feature.type === TovelundFeatureType.Forest) {
        pointElement = <g key={`entity${entity.id}point${point.id}`} transform={`matrix(1,0,0,1,${xOffset},${yOffset})`}>
          <path d={`M${point.x - (r * 0.31)},${point.y + (r * 0.95)}L${point.x - (r * 0.31)},${point.y + (r * 0.44)}L${point.x - (r * 0.9)},${point.y + (r * 0.44)}L${point.x},${point.y - r}L${point.x + (r * 0.9)},${point.y + (r * 0.44)}L${point.x + (r * 0.31)},${point.y + (r * 0.44)}L${point.x + (r * 0.31)},${point.y + (r * 0.95)}`} style={{ fill: LotographiaColor.Transparent, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Green3, strokeWidth: 0.005 * scale }} />
        </g>;
      } else if (feature && feature.type === TovelundFeatureType.House) {
        pointElement = <g key={`entity${entity.id}point${point.id}`} transform={`matrix(1,0,0,1,${xOffset},${yOffset})`}>
          <path d={`M${point.x - (r * 0.7)},${point.y}L${point.x - (r * 0.6)},${point.y + (r * 0.7)}`} style={{ fill: LotographiaColor.Transparent, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Green3, strokeWidth: 0.005 * scale }} />
          <circle cx={point.x - (r * 0.7)} cy={point.y} r={r / 4} style={{ fill: LotographiaColor.White, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Purple3, strokeWidth: 0.0025 * scale }} />
          <path d={`M${point.x + (r * 0.5)},${point.y - (r * 0.4)}L${point.x + (r * 0.5)},${point.y + (r * 0.2)}`} style={{ fill: LotographiaColor.Transparent, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Green3, strokeWidth: 0.005 * scale }} />
          <circle cx={point.x + (r * 0.5)} cy={point.y - (r * 0.4)} r={r / 4} style={{ fill: LotographiaColor.White, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Orange5, strokeWidth: 0.0025 * scale }} />
          <path d={`M${point.x + (r * 0.1)},${point.y + (r * 0.3)}L${point.x + (r * 0.1)},${point.y + (r * 0.9)}`} style={{ fill: LotographiaColor.Transparent, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Green3, strokeWidth: 0.005 * scale }} />
          <circle cx={point.x + (r * 0.1)} cy={point.y + (r * 0.3)} r={r / 4} style={{ fill: LotographiaColor.White, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Orange5, strokeWidth: 0.0025 * scale }} />
          <path d={`M${point.x - (r * 0.2)},${point.y - (r * 0.6)}L${point.x - (r * 0.2)},${point.y}`} style={{ fill: LotographiaColor.Transparent, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Green3, strokeWidth: 0.005 * scale }} />
          <circle cx={point.x - (r * 0.2)} cy={point.y - (r * 0.6)} r={r / 4} style={{ fill: LotographiaColor.White, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Orange3, strokeWidth: 0.0025 * scale }} />
        </g>;
      } else if (feature && feature.type === TovelundFeatureType.Airport) {
        pointElement = <g key={`entity${entity.id}point${point.id}`} transform={`matrix(1,0,0,1,${xOffset},${yOffset})`}>
          <path d={`M${point.x},${point.y - (r * 0.8)}L${point.x},${point.y - (r * 0.2)}`} style={{ fill: LotographiaColor.Transparent, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Purple3, strokeWidth: 0.005 * scale }} />
          <path d={`M${point.x + (r * 0.3)},${point.y - (r * 0.8)}L${point.x + (r * 0.3)},${point.y - (r * 0.3)}`} style={{ fill: LotographiaColor.Transparent, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Purple3, strokeWidth: 0.005 * scale }} />
          <path d={`M${point.x - (r * 0.44)},${point.y + (r * 0.9)}L${point.x - (r * 0.44)},${point.y - (r * 0.9)}L${point.x + (r * 0.6)},${point.y - (r * 0.8)}L${point.x + (r * 0.6)},${point.y - (r * 0.3)}L${point.x - (r * 0.44)},${point.y - (r * 0.1)}`} style={{ fill: LotographiaColor.Transparent, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Black, strokeWidth: 0.005 * scale }} />
        </g>;
      } else if (feature && feature.type === TovelundFeatureType.Store) {
        pointElement = <g key={`entity${entity.id}point${point.id}`} transform={`matrix(1,0,0,1,${xOffset},${yOffset})`}>
          <path d={`M${point.x - (r * 0.6)},${point.y - (r * 0.2)}L${point.x - (r * 0.6)},${point.y + (r * 0.8)}`} style={{ fill: LotographiaColor.Transparent, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Orange3, strokeWidth: 0.005 * scale }} />
          <path d={`M${point.x + (r * 0.6)},${point.y - (r * 0.2)}L${point.x + (r * 0.6)},${point.y + (r * 0.8)}`} style={{ fill: LotographiaColor.Transparent, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Orange3, strokeWidth: 0.005 * scale }} />
          <path d={`M${point.x - (r * 0.8)},${point.y - (r * 0.6)}L${point.x + (r * 0.8)},${point.y - (r * 0.6)}L${point.x + (r * 0.8)},${point.y + (r * 0.2)}L${point.x - (r * 0.8)},${point.y + (r * 0.2)}Z`} style={{ fill: LotographiaColor.White, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Black, strokeWidth: 0.005 * scale }} />
          <path d={`M${point.x - (r * 0.5)},${point.y - (r * 0.4)}L${point.x - (r * 0.5)},${point.y - (r * 0.1)}`} style={{ fill: LotographiaColor.Transparent, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Green3, strokeWidth: 0.005 * scale }} />
          <path d={`M${point.x - (r * 0.4)},${point.y - (r * 0.4)}L${point.x - (r * 0.4)},${point.y - (r * 0.1)}`} style={{ fill: LotographiaColor.Transparent, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Green3, strokeWidth: 0.005 * scale }} />
          <path d={`M${point.x - (r * 0.2)},${point.y - (r * 0.4)}L${point.x - (r * 0.2)},${point.y - (r * 0.1)}`} style={{ fill: LotographiaColor.Transparent, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Green3, strokeWidth: 0.005 * scale }} />
          <path d={`M${point.x + (r * 0.2)},${point.y - (r * 0.4)}L${point.x + (r * 0.2)},${point.y - (r * 0.1)}`} style={{ fill: LotographiaColor.Transparent, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Green3, strokeWidth: 0.005 * scale }} />
        </g>;
      } else if (feature && feature.type === TovelundFeatureType.Station) {
        pointElement = <g key={`entity${entity.id}point${point.id}`} transform={`matrix(1,0,0,1,${xOffset},${yOffset})`}>
          <path d={`M${point.x - (r * 0.6)},${point.y - (r * 0.2)}L${point.x - (r * 0.6)},${point.y + (r * 0.8)}`} style={{ fill: LotographiaColor.Transparent, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Black, strokeWidth: 0.005 * scale }} />
          <path d={`M${point.x + (r * 0.6)},${point.y - (r * 0.2)}L${point.x + (r * 0.6)},${point.y + (r * 0.8)}`} style={{ fill: LotographiaColor.Transparent, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Black, strokeWidth: 0.005 * scale }} />
          <path d={`M${point.x - (r * 0.8)},${point.y - (r * 0.6)}L${point.x + (r * 0.8)},${point.y - (r * 0.6)}L${point.x + (r * 0.8)},${point.y + (r * 0.2)}L${point.x - (r * 0.8)},${point.y + (r * 0.2)}Z`} style={{ fill: LotographiaColor.White, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Orange3, strokeWidth: 0.005 * scale }} />
          <path d={`M${point.x - (r * 0.8)},${point.y - (r * 0.1)}L${point.x + (r * 0.8)},${point.y - (r * 0.1)}`} style={{ fill: LotographiaColor.Transparent, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Orange3, strokeWidth: 0.005 * scale }} />
        </g>;
      } else if (feature && feature.type === TovelundFeatureType.Warehouse) {
        pointElement = <g key={`entity${entity.id}point${point.id}`} transform={`matrix(1,0,0,1,${xOffset},${yOffset})`}>
          <path d={`M${point.x - (r * 0.8)},${point.y}L${point.x},${point.y}L${point.x},${point.y + (r * 0.6)}L${point.x - (r * 0.8)},${point.y + (r * 0.6)}Z`} style={{ fill: LotographiaColor.White, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Orange3, strokeWidth: 0.005 * scale }} />
          <path d={`M${point.x},${point.y}L${point.x + (r * 0.8)},${point.y}L${point.x + (r * 0.8)},${point.y + (r * 0.6)}L${point.x},${point.y + (r * 0.6)}Z`} style={{ fill: LotographiaColor.White, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Orange3, strokeWidth: 0.005 * scale }} />
          <path d={`M${point.x - (r * 0.6)},${point.y - (r * 0.6)}L${point.x + (r * 0.2)},${point.y - (r * 0.6)}L${point.x + (r * 0.2)},${point.y}L${point.x - (r * 0.6)},${point.y}Z`} style={{ fill: LotographiaColor.White, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Orange3, strokeWidth: 0.005 * scale }} />
        </g>;
      } else if (feature && feature.type === TovelundFeatureType.Lighthouse) {
        pointElement = <g key={`entity${entity.id}point${point.id}`} transform={`matrix(1,0,0,1,${xOffset},${yOffset})`}>
          <path d={`M${point.x - (r * 0.6)},${point.y - (r * 0.2)}L${point.x + (r * 0.6)},${point.y - (r * 0.2)}L${point.x + (r * 0.6)},${point.y + (r * 0.8)}L${point.x - (r * 0.6)},${point.y + (r * 0.8)}Z`} style={{ fill: LotographiaColor.White, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Black, strokeWidth: 0.005 * scale }} />
          <path d={`M${point.x - (r * 1)},${point.y}L${point.x},${point.y - (r * 1)}L${point.x + (r * 1)},${point.y}Z`} style={{ fill: LotographiaColor.White, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Purple3, strokeWidth: 0.005 * scale }} />
        </g>;
      } else if (feature && feature.type === TovelundFeatureType.Water) {
        pointElement = <g key={`entity${entity.id}point${point.id}`} transform={`matrix(1,0,0,1,${xOffset},${yOffset})`}>
          <path d={`M${point.x - (r * 0.6)},${point.y - (r * 0.15)}L${point.x - (r * 0.2)},${point.y - (r * 0.44)}L${point.x + (r * 0.4)},${point.y - (r * 0.15)}L${point.x + (r * 0.9)},${point.y - (r * 0.44)}`} style={{ fill: LotographiaColor.Transparent, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Blue4, strokeWidth: 0.005 * scale }} />
          <path d={`M${point.x - (r * 0.9)},${point.y + (r * 0.44)}L${point.x - (r * 0.4)},${point.y + (r * 0.15)}L${point.x + (r * 0.2)},${point.y + (r * 0.44)}L${point.x + (r * 0.6)},${point.y + (r * 0.15)}`} style={{ fill: LotographiaColor.Transparent, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Blue4, strokeWidth: 0.005 * scale }} />
        </g>;
      } else if (feature && feature.type === TovelundFeatureType.Plains) {
        pointElement = <g key={`entity${entity.id}point${point.id}`} transform={`matrix(1,0,0,1,${xOffset},${yOffset})`}>
          <path d={`M${point.x - (r * 0.6)},${point.y - (r * 0.2)}L${point.x - (r * 0.6)},${point.y + (r * 0.1)}`} style={{ fill: LotographiaColor.Transparent, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Lime2, strokeWidth: 0.005 * scale }} />
          <path d={`M${point.x + (r * 0.4)},${point.y - (r * 0.4)}L${point.x + (r * 0.4)},${point.y - (r * 0.1)}`} style={{ fill: LotographiaColor.Transparent, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Lime3, strokeWidth: 0.005 * scale }} />
          <path d={`M${point.x - (r * 0.1)},${point.y + (r * 0.4)}L${point.x - (r * 0.1)},${point.y + (r * 0.7)}`} style={{ fill: LotographiaColor.Transparent, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Lime2, strokeWidth: 0.005 * scale }} />
          <path d={`M${point.x + (r * 0.1)},${point.y - (r * 0.6)}L${point.x + (r * 0.1)},${point.y - (r * 0.3)}`} style={{ fill: LotographiaColor.Transparent, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Lime3, strokeWidth: 0.005 * scale }} />
          <path d={`M${point.x + (r * 0.2)},${point.y + (r * 0.3)}L${point.x + (r * 0.2)},${point.y + (r * 0.6)}`} style={{ fill: LotographiaColor.Transparent, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Lime2, strokeWidth: 0.005 * scale }} />
          <path d={`M${point.x - (r * 0.31)},${point.y - (r * 0.95)}L${point.x - (r * 0.31)},${point.y - (r * 0.65)}`} style={{ fill: LotographiaColor.Transparent, stroke: pointIsSelected ? LotographiaColor.Black : LotographiaColor.Lime3, strokeWidth: 0.005 * scale }} />
        </g>;
      }

      if (pointElement !== undefined) {
        entityElements.push(pointElement);
      }
    });

    const rectangle = entity.rectangle;

    if (rectangle) {
      const collection = puzzle.getFeatureCollection(entity.featureCollectionId);
      const setLength = collection.set.length;

      // could do this by maths but feeling lazy right now
      const horizontalWidth: number[] = [1, 1, 2, 2, 2, 3, 3, 4, 4];
      const verticalWidth: number[] = [1, 1, 1, 2, 2, 2, 2, 2, 2];
      const horizontalHeight: number[] = [1, 1, 1, 2, 2, 2, 2, 2, 2];
      const verticalHeight: number[] = [1, 1, 2, 2, 2, 3, 3, 4, 4];

      const isHorizontal = rectangle.attributes["Orientation"] === "HORIZONTAL";
      const rectangleIsSelected = selectedElementIdz.indexOf(rectangle.id) !== -1;

      const width = isHorizontal ? horizontalWidth[setLength] : verticalWidth[setLength];
      const height = isHorizontal ? horizontalHeight[setLength] : verticalHeight[setLength];
      const letters: JSX.Element[] = [];
      const cursor = mode === "DEV" || (mode === "SOLVE" && entity.fixedFeatureId === undefined) ? "pointer" : "default";

      if (feature !== undefined) {
        const selectedSymbol = collection.set.filter(f => feature && f.id === feature.id)[0].symbol;
        const horizontalSelectedSymbolCoordinatesList = [
          { x: 0.9, y: 3.25, size: 4 },
          { x: 2.9, y: 3.25, size: 4 },
          { x: 1.8, y: 6.55, size: 8 },
          { x: 1.8, y: 6.55, size: 8 },
          { x: 3.8, y: 6.55, size: 8 },
          { x: 3.8, y: 6.55, size: 8 },
          { x: 5.8, y: 6.55, size: 8 },
          { x: 5.8, y: 6.55, size: 8 }
        ];
        const verticalSelectedSymbolCoordinatesList = [
          { x: 0.9, y: 3.25, size: 4 },
          { x: 0.9, y: 5.25, size: 4 },
          { x: 1.8, y: 6.55, size: 8 },
          { x: 1.8, y: 6.55, size: 8 },
          { x: 1.8, y: 8.55, size: 8 },
          { x: 1.8, y: 8.55, size: 8 },
          { x: 1.8, y: 10.55, size: 8 },
          { x: 1.8, y: 10.55, size: 8 }
        ];

        const symbolCoordinates = isHorizontal ? horizontalSelectedSymbolCoordinatesList[setLength - 1] : verticalSelectedSymbolCoordinatesList[setLength - 1];

        letters.push(<text key={`entity${entity.id}rectangleSymbol`} x={symbolCoordinates.x} y={symbolCoordinates.y} style={{ fill: LotographiaColor.Black, cursor: cursor, fontFamily: "monospace", fontSize: symbolCoordinates.size }}>
          {selectedSymbol}
        </text>);
      } else {
        const orderedSet = [...collection.set].sort((a: { symbol: string }, b: { symbol: string }) => a.symbol > b.symbol ? 1 : -1);;

        let innerIndex = 0;
        let outerIndex = 0;

        let innerSymbolMap: { x: number, y: number, size: number }[] = [];
        let outerSymbolMap: { x: number, y: number, size: number }[] = [];

        if (width === 1) {
          const innerSymbolMapList = [
            [{ x: 1.2, y: 4.95, size: 3 }],
            [{ x: 0.4, y: 4.95, size: 3 }, { x: 2, y: 4.95, size: 3 }],
          ];
          const outerSymbolMapList = [
            [{ x: 1.2, y: 2.45, size: 3 }],
            [{ x: 1.2, y: 2.45, size: 3 }, { x: 1.2, y: 7.45, size: 3 }]
          ];

          innerSymbolMap = innerSymbolMapList[entity.innerPencilFeatureIds !== undefined ? entity.innerPencilFeatureIds.length - 1 : 0];
          outerSymbolMap = outerSymbolMapList[entity.outerPencilFeatureIds !== undefined ? entity.outerPencilFeatureIds.length - 1 : 0];
        } else if (width === 2) {
          if (height === 1) {
            const innerSymbolMapList = [
              [{ x: 3.2, y: 2.95, size: 3 }],
              [{ x: 3.2, y: 1.95, size: 3 }, { x: 3.2, y: 3.95, size: 3 }]
            ];
            const outerSymbolMapList = [
              [{ x: 0.8, y: 2.95, size: 3 }],
              [{ x: 0.8, y: 2.95, size: 3 }, { x: 5.6, y: 2.95, size: 3 }]
            ];

            innerSymbolMap = innerSymbolMapList[entity.innerPencilFeatureIds !== undefined ? entity.innerPencilFeatureIds.length - 1 : 0];
            outerSymbolMap = outerSymbolMapList[entity.outerPencilFeatureIds !== undefined ? entity.outerPencilFeatureIds.length - 1 : 0];
          } else if (height === 2) {
            const innerSymbolMapList = [
              [{ x: 3.2, y: 4.95, size: 3 }],
              [{ x: 2.4, y: 4.95, size: 3 }, { x: 4, y: 4.95, size: 3 }],
              [{ x: 1.6, y: 4.95, size: 3 }, { x: 3.2, y: 4.95, size: 3 }, { x: 4.8, y: 4.95, size: 3 }],
              [{ x: 0.8, y: 4.95, size: 3 }, { x: 2.4, y: 4.95, size: 3 }, { x: 4, y: 4.95, size: 3 }, { x: 5.6, y: 4.95, size: 3 }]
            ];
            const outerSymbolMapList = [
              [{ x: 0.8, y: 2.45, size: 3 }],
              [{ x: 0.8, y: 2.45, size: 3 }, { x: 5.6, y: 2.45, size: 3 }],
              [{ x: 0.8, y: 2.45, size: 3 }, { x: 5.6, y: 2.45, size: 3 }, { x: 0.8, y: 7.45, size: 3 }],
              [{ x: 0.8, y: 2.45, size: 3 }, { x: 5.6, y: 2.45, size: 3 }, { x: 0.8, y: 7.45, size: 3 }, { x: 5.6, y: 7.45, size: 3 }]
            ];

            innerSymbolMap = innerSymbolMapList[entity.innerPencilFeatureIds !== undefined ? entity.innerPencilFeatureIds.length - 1 : 0];
            outerSymbolMap = outerSymbolMapList[entity.outerPencilFeatureIds !== undefined ? entity.outerPencilFeatureIds.length - 1 : 0];
          } 
        } else if (width === 3) {
          if (height === 2) {
            const innerSymbolMapList = [
              [{ x: 5.2, y: 4.95, size: 3 }],
              [{ x: 4.4, y: 4.95, size: 3 }, { x: 6, y: 4.95, size: 3 }],
              [{ x: 3.6, y: 4.95, size: 3 }, { x: 5.2, y: 4.95, size: 3 }, { x: 6.8, y: 4.95, size: 3 }],
              [{ x: 2.8, y: 4.95, size: 3 }, { x: 4.4, y: 4.95, size: 3 }, { x: 6, y: 4.95, size: 3 }, { x: 7.6, y: 4.95, size: 3 }],
              [{ x: 2, y: 4.95, size: 3 }, { x: 3.6, y: 4.95, size: 3 }, { x: 5.2, y: 4.95, size: 3 }, { x: 6.8, y: 4.95, size: 3 }, { x: 8.4, y: 4.95, size: 3 }],
              [{ x: 1.2, y: 4.95, size: 3 }, { x: 2.8, y: 4.95, size: 3 }, { x: 4.4, y: 4.95, size: 3 }, { x: 6, y: 4.95, size: 3 }, { x: 7.6, y: 4.95, size: 3 }, { x: 9.2, y: 4.95, size: 3 }]
            ];
            const outerSymbolMapList = [
              [{ x: 1.2, y: 2.45, size: 3 }],
              [{ x: 1.2, y: 2.45, size: 3 }, { x: 5.2, y: 2.45, size: 3 }],
              [{ x: 1.2, y: 2.45, size: 3 }, { x: 5.2, y: 2.45, size: 3 }, { x: 9.2, y: 2.45, size: 3 }],
              [{ x: 1.2, y: 2.45, size: 3 }, { x: 5.2, y: 2.45, size: 3 }, { x: 9.2, y: 2.45, size: 3 }, { x: 1.2, y: 7.45, size: 3 }],
              [{ x: 1.2, y: 2.45, size: 3 }, { x: 5.2, y: 2.45, size: 3 }, { x: 9.2, y: 2.45, size: 3 }, { x: 1.2, y: 7.45, size: 3 }, { x: 5.2, y: 7.45, size: 3 }],
              [{ x: 1.2, y: 2.45, size: 3 }, { x: 5.2, y: 2.45, size: 3 }, { x: 9.2, y: 2.45, size: 3 }, { x: 1.2, y: 7.45, size: 3 }, { x: 5.2, y: 7.45, size: 3 }, { x: 9.2, y: 7.45, size: 3 }]
            ];

            innerSymbolMap = innerSymbolMapList[entity.innerPencilFeatureIds !== undefined ? entity.innerPencilFeatureIds.length - 1 : 0];
            outerSymbolMap = outerSymbolMapList[entity.outerPencilFeatureIds !== undefined ? entity.outerPencilFeatureIds.length - 1 : 0];
          }
        }

        orderedSet.map((feature: { id: string, symbol: string }) => {
          if (entity.innerPencilFeatureIds !== undefined && entity.innerPencilFeatureIds.indexOf(feature.id) !== -1) {
            const symbolCoordinates = innerSymbolMap[innerIndex++];

            letters.push(<text key={`entity${entity.id}rectangleSymbol${feature.symbol}inner`} x={symbolCoordinates.x} y={symbolCoordinates.y} style={{ fill: LotographiaColor.Black, cursor: cursor, fontFamily: "monospace", fontSize: symbolCoordinates.size }}>
              {feature.symbol}
            </text>);
          }

          if (entity.outerPencilFeatureIds !== undefined && entity.outerPencilFeatureIds.indexOf(feature.id) !== -1) {
            const symbolCoordinates = outerSymbolMap[outerIndex++];

            letters.push(<text key={`entity${entity.id}rectangleSymbol${feature.symbol}outer`} x={symbolCoordinates.x} y={symbolCoordinates.y} style={{ fill: LotographiaColor.Black, cursor: cursor, fontFamily: "monospace", fontSize: symbolCoordinates.size }}>
              {feature.symbol}
            </text>);
          }
        });
      }

      entityElements.push(<g key={`entity${entity.id}rectangle`} transform={`matrix(1,0,0,1,${xOffset + rectangle.x - (width * 2)},${yOffset + rectangle.y - (height * 2)})`} onClick={() => mode === "DEV" || (mode === "SOLVE" && entity.fixedFeatureId === undefined) ? selectEntityId(entity.id) : {}}>
        <rect width={width * 4} height={height * 4} style={{ cursor: cursor, fill: rectangleIsSelected ? getColor(color, 6) : LotographiaColor.White, stroke: getColor(color, 3), strokeWidth: 0.005 * scale }} />
        {letters}
      </g>);
    }

    return <g key={`entity${entity.id}`}>
      {entityElements}
    </g>;
  });


  return <svg
    key="TovelundMap"
    viewBox={`0 0 ${1.2 * scale} ${0.8 * scale}`}
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    xmlSpace="preserve"
    className="image right"
    style={{ fillRule: "evenodd", clipRule: "evenodd", strokeLinejoin: "round", strokeMiterlimit: 2, overflow: "visible", maxWidth: "100%" }}>
    <rect x="0" y="0" width={1.2 * scale} height={0.8 * scale} style={{ fill: LotographiaColor.White, stroke: LotographiaColor.Black, strokeWidth: 0.005 * scale }} />
    {layersElements}
    {overlayElements}
  </svg>
}
