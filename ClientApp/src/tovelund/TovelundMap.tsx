import * as React from "react";
import { TovelundColor, TovelundDestination, TovelundDestinationName, TovelundElementType, TovelundFeatureSize, TovelundGame, TovelundIndexType, TovelundRoute, TovelundSymbol, TovelundZone, TovelundZoneFeature, TovelundZoneName } from "./TovelundEnums";

export const getTovelundMap = (game: TovelundGame, selectedElementType: string, selectedElementId: number, selectedIndexType: string, selectedIndex: number, selectDestination: (id: number) => void) => {
  const xOffset = 0.6 * game.scale;
  const yOffset = 0.4 * game.scale;

  const overlayElements: JSX.Element[] = [];

  const zones = [...game.zones];

  zones.sort((a: TovelundZone, b: TovelundZone) => a.id === selectedElementId ? 1 : -1);

  // Zone Elements
  const zoneElements = zones.map((zone: TovelundZone, index: number) => {
    const points = zone.points;
    let d: string | undefined = undefined;

    if (points) {
      d = `M${points[0].x},${points[0].y}`;

      for (let i = 1; i < points.length; i++) {
        d += `L${points[i].x},${points[i].y}`;
      }

      d += `L${points[0].x},${points[0].y}`;
    }

    const elementIsSelected = selectedElementType === TovelundElementType.Zone &&
      selectedElementId === zone.id;

    const zoneFeatureElements = zone.features.map((feature: TovelundZoneFeature, featureIndex: number) => {
      const featureIsSelected = selectedElementType === TovelundElementType.Zone &&
        selectedElementId === zone.id &&
        selectedIndexType === TovelundIndexType.Feature &&
        selectedIndex === featureIndex;

      const r: number = feature.shape === TovelundFeatureSize.Small ? 2 : feature.shape === TovelundFeatureSize.Medium ? 3 : 4;

      if (zone.name === TovelundZoneName.Mountains) {
        return <path key={`zone${index}feature${featureIndex}`} d={`M${feature.point.x - (r * 0.9)},${feature.point.y + (r * 0.45)}L${feature.point.x},${feature.point.y - (r * 0.45)}L${feature.point.x + (r * 0.9)},${feature.point.y + (r * 0.45)}`} style={{ fill: TovelundColor.Transparent, stroke: featureIsSelected ? TovelundColor.Black : TovelundColor.Blue, strokeWidth: 0.0025 * game.scale }} />;
      } else if (zone.name === TovelundZoneName.Forest) {
        return <path key={`zone${index}feature${featureIndex}`} d={`M${feature.point.x - (r * 0.45)},${feature.point.y + (r * 0.9)}L${feature.point.x - (r * 0.45)},${feature.point.y + (r * 0.45)}L${feature.point.x - (r * 0.9)},${feature.point.y + (r * 0.45)}L${feature.point.x},${feature.point.y - r}L${feature.point.x + (r * 0.9)},${feature.point.y + (r * 0.45)}L${feature.point.x + (r * 0.45)},${feature.point.y + (r * 0.45)}L${feature.point.x + (r * 0.45)},${feature.point.y + (r * 0.9)}`} style={{ fill: TovelundColor.Transparent, stroke: featureIsSelected ? TovelundColor.Black : TovelundColor.BluishGreen, strokeWidth: 0.0025 * game.scale }} />;
      } else if (zone.name === TovelundZoneName.Water) {
        return <g key={`zone${index}feature${featureIndex}`}>
          <path d={`M${feature.point.x - (r * 0.6)},${feature.point.y - (r * 0.15)}L${feature.point.x - (r * 0.2)},${feature.point.y - (r * 0.45)}L${feature.point.x + (r * 0.4)},${feature.point.y - (r * 0.15)}L${feature.point.x + (r * 0.9)},${feature.point.y - (r * 0.45)}`} style={{ fill: TovelundColor.Transparent, stroke: featureIsSelected ? TovelundColor.Black : TovelundColor.SkyBlue, strokeWidth: 0.0025 * game.scale }} />
          <path d={`M${feature.point.x - (r * 0.9)},${feature.point.y + (r * 0.45)}L${feature.point.x - (r * 0.4)},${feature.point.y + (r * 0.15)}L${feature.point.x + (r * 0.2)},${feature.point.y + (r * 0.45)}L${feature.point.x + (r * 0.6)},${feature.point.y + (r * 0.15)}`} style={{ fill: TovelundColor.Transparent, stroke: featureIsSelected ? TovelundColor.Black : TovelundColor.SkyBlue, strokeWidth: 0.0025 * game.scale }} />
        </g>;
      } else {
        return <circle key={`zone${index}feature${featureIndex}`} cx={feature.point.x} cy={feature.point.y} r={r} style={{ fill: TovelundColor.White, stroke: featureIsSelected ? TovelundColor.Black : TovelundColor.BluishGreen, strokeWidth: 0.0025 * game.scale }} />;
      }
    });

    if (selectedElementType === TovelundElementType.Zone &&
      selectedElementId === zone.id &&
      selectedIndexType === TovelundIndexType.Point &&
      points) {
      overlayElements.push(<circle key={`selected_point`} cx={points[selectedIndex].x + xOffset} cy={points[selectedIndex].y + yOffset} r={2} style={{ fill: TovelundColor.Transparent, stroke: TovelundColor.Black, strokeWidth: 0.005 * game.scale }} />)
    }

    return <g key={`zone${index}`} transform={`matrix(1,0,0,1,${xOffset},${yOffset})`}>
      {d !== undefined && <path d={d} style={{ fill: TovelundColor.Transparent, stroke: elementIsSelected ? TovelundColor.Black : TovelundColor.BluishGreen, strokeWidth: 0.005 * game.scale }} />}
      <g>
        {zoneFeatureElements}
      </g>
    </g>;
  });

  // Route Elements
  const routeElements = game.routes.map((route: TovelundRoute, index: number) => {
    var d = `M${route.points[0].x},${route.points[0].y}`;

    for (let i = 1; i < route.points.length; i++) {
      d += `L${route.points[i].x},${route.points[i].y}`;
    }

    const elementIsSelected = selectedElementType === TovelundElementType.Route &&
      selectedElementId === route.id;

    const routeFeatureElements: JSX.Element[] = [];

    if (selectedElementType === TovelundElementType.Route &&
      selectedElementId === route.id &&
      selectedIndexType === TovelundIndexType.Point) {
      overlayElements.push(<circle key={`selected_point`} cx={route.points[selectedIndex].x + xOffset} cy={route.points[selectedIndex].y + yOffset} r={2} style={{ fill: TovelundColor.Transparent, stroke: TovelundColor.Black, strokeWidth: 0.005 * game.scale }} />)
    }

    return <g key={`route${index}`} transform={`matrix(1,0,0,1,${xOffset},${yOffset})`}>
      <path d={d} style={{ fill: TovelundColor.Transparent, stroke: elementIsSelected ? TovelundColor.Black : TovelundColor.Orange, strokeWidth: 0.005 * game.scale }} />
      {routeFeatureElements}
    </g>;
  });

  const destinationTypes = game.symbols.filter(s => s.type === TovelundElementType.Destination);

  const destinationElements: JSX.Element[] = game.destinations.map((destination: TovelundDestination, index: number) => {
    const isSelected = selectedElementType === TovelundElementType.Destination &&
      selectedElementId === destination.id;

    let width: number = 2;
    let height: number = 2;

    if (destination.angle === "HORIZONTAL") {
      width = Math.max(Math.ceil(destinationTypes.length / 2), 2);
    } else {
      height = Math.max(Math.ceil(destinationTypes.length / 2), 2);
    }

    let xIndex = 0;
    let yIndex = 0;

    let letters: JSX.Element[] = [];

    if (destination.fixedName || destination.selectedName) {
      const x = ((width - 1) * 2) - 0.2;
      const y = ((height - 1) * 2) + 4.5;

      const destinationType = destinationTypes.filter(t => t.name === destination.fixedName || t.name === destination.selectedName)[0];

      const symbol = destinationType ? destinationType.symbol : "?";

      letters.push(<text key={`destination${index}type`} x={x} y={y} style={{ fill: isSelected ? TovelundColor.White : TovelundColor.Black, cursor: "pointer", fontFamily: "monospace", fontSize: 8 }}>{symbol}</text>);
    } else {
      letters = destinationTypes.map((type: TovelundSymbol, letterIndex: number) => {
        const x = xIndex;
        const y = yIndex;

        xIndex++;

        if (xIndex === width) {
          xIndex = 0;
          yIndex++;
        }

        let fill = TovelundColor.Orange;

        if (destination.symbolColors[type.name]) {
          fill = destination.symbolColors[type.name];
        }

        return <text key={`destination${index}thing${letterIndex}`} x={(x * 4) + 0.9} y={(y * 4) + 3.25} style={{ fill: fill, cursor: "pointer", fontFamily: "monospace", fontSize: 4 }}>{type.symbol}</text>;
      });
    }

    return <g key={`destination${index}`} transform={`matrix(1,0,0,1,${xOffset + destination.point.x - (width * 2)},${yOffset + destination.point.y - (height * 2)})`} onClick={() => selectDestination(destination.id)}>
      <rect width={width * 4} height={height * 4} style={{ cursor: "pointer", fill: isSelected ? TovelundColor.Black : TovelundColor.White, stroke: TovelundColor.Blue, strokeWidth: 0.005 * game.scale }} />
      {letters}
    </g>;
  });

  return <svg
    key="TovelundMap"
    viewBox={`0 0 ${1.2 * game.scale} ${0.8 * game.scale}`}
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    xmlSpace="preserve"
    className="image right"
    style={{ fillRule: "evenodd", clipRule: "evenodd", strokeLinejoin: "round", strokeMiterlimit: 2, overflow: "visible", maxWidth: "100%" }}>
    <rect x="0" y="0" width={1.2 * game.scale} height={0.8 * game.scale} style={{ fill: TovelundColor.White, stroke: TovelundColor.SkyBlue, strokeWidth: 0.005 * game.scale }} />
    {zoneElements}
    {routeElements}
    {destinationElements}
    {overlayElements}
  </svg>
}
