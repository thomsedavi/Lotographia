import * as React from 'react';
import { ComponentContainer, ComponentProps } from './ComponentContainer';

export interface InfoComponentProps extends ComponentProps {
  infoTitle: string;
}

const InfoComponent: React.StatelessComponent<InfoComponentProps> = (props) => {
  return <ComponentContainer
    navigationButtons={props.navigationButtons}
    contents={props.contents}
    loadingState={props.loadingState}
    title={props.infoTitle}
  />;
}

export const isInfoComponent = (object: ComponentProps): object is InfoComponentProps => {
  return "infoTitle" in object;
}

export { InfoComponent }
