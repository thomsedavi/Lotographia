import * as React from "react";
import { TovelundColor } from "./TovelundEnums";

export const getColor = (colorName: string) => {
  switch (colorName.toLowerCase()) {
    case 'black':
      return TovelundColor.Black;
    case 'blue':
      return TovelundColor.Blue;
    case 'bluish-green':
      return TovelundColor.BluishGreen;
    case 'orange':
      return TovelundColor.Orange;
    case 'reddish-purple':
      return TovelundColor.ReddishPurple;
    case 'sky-blue':
      return TovelundColor.SkyBlue;
    case 'transparent':
      return TovelundColor.Transparent;
    case 'vermillion':
      return TovelundColor.Vermillion;
    case 'white':
      return TovelundColor.White;
    case 'yellow':
      return TovelundColor.Yellow;
    default:
      return colorName;
  }
}

export const getIcon = (iconName: string, scale: number, pointIsSelected: boolean) => {
  switch (iconName.toLowerCase()) {
    case 'mountain':
      return <>
        <path d={'M-9,4.5L0,-4.5L9,4.5'} style={{ fill: TovelundColor.Transparent, stroke: pointIsSelected ? TovelundColor.Black : TovelundColor.Blue, strokeWidth: 0.005 * scale }} />
      </>;
    default:
      return <>
      </>;
  }
}

export const convertClueDescription = (clueDescription: string) => {
  const description: (string | JSX.Element)[] = [];

  const clueComponents = clueDescription.split('{{');

  clueComponents.map((component: string) => {
    if (component.indexOf('}}') === -1) {
      description.push(component);
    } else {
      const subComponents = component.split('}}');

      const markedComponents = subComponents[0].split('|');

      const componentType = markedComponents[0].split(':');

      if (componentType.length === 2) {
        if (componentType[0] === 'text') {
          const style: React.CSSProperties = {};

          for (let i = 1; i < markedComponents.length; i++) {
            const componentStyle = markedComponents[i].split(':');

            if (componentStyle.length === 2) {
              if (componentStyle[0] === 'color') {
                style.color = getColor(componentStyle[1]);
              } else if (componentStyle[0] === 'font-weight' && !isNaN(Number(componentStyle[1]))) {
                style.fontWeight = Number(componentStyle[1]);
              }
            }
          }

          description.push(<span style={style}>{componentType[1]}</span>);
        } else if (componentType.length === 2 && componentType[0] === 'icon') {
          description.push(<svg
            key="TovelundIcon"
            viewBox={`0 0 1 1`}
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            xmlSpace="preserve"
            className="image right"
            style={{ fillRule: "evenodd", clipRule: "evenodd", strokeLinejoin: "round", strokeMiterlimit: 2, overflow: "visible", maxHeight: "1em", maxWidth: "1em" }}>
            <g transform={`matrix(0.05,0,0,0.05,0.5,0.5)`}>
              {getIcon(componentType[1], 400, false)}
            </g>
          </svg>);
        }
      }

      description.push(subComponents[1]);
    }
  });

  return description;
}