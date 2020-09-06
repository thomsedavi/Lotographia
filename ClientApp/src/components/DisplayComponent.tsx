import * as React from 'react';
import { ComponentContainer, ComponentProps } from './ComponentContainer';

export interface DisplayComponentProps extends ComponentProps {
  previewURL?: string;
  caption?: string;
  displayTitle: string;
  information?: string;
}

const DisplayComponent: React.StatelessComponent<DisplayComponentProps> = (props) => {
  const children: JSX.Element[] = [];

  children.push(<div className="component">
    <img src={props.previewURL} style={{ marginBottom: props.caption ? "0" : "0.5em", width: "100%" }} />
    {props.caption &&
      <div className="caption">
        {props.caption}
      </div>
    }
    {props.information &&
      <div className="note">
        {props.information}
      </div>
    }
  </div>);

  return <ComponentContainer
    navigationButtons={props.navigationButtons}
    children={children}
    contents={props.contents}
    loadingState={props.loadingState}
    title={props.displayTitle}
  />;
}

export const isDisplayComponent = (object: ComponentProps): object is DisplayComponentProps => {
  return "displayTitle" in object;
}

export { DisplayComponent }
