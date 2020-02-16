import * as React from 'react';
import { Button, ComponentContainer } from './ComponentContainer';

interface DisplayComponentProps {
  buttons: Button[];
  context?: string;
  previewURL?: string;
}

const DisplayComponent: React.StatelessComponent<DisplayComponentProps> = (props) => {
  const imageComponent = <div className="component">
    <img src={props.previewURL} style={{ width: "100%" }} />
  </div>;

  return <ComponentContainer
    buttons={props.buttons}
    children={imageComponent}
    context={props.context}
  />
}

export { DisplayComponent }
