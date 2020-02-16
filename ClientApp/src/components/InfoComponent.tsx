import * as React from 'react';
import { Button, ComponentContainer } from './ComponentContainer';
import { StatusLoading, StatusReady } from '../utils/Assets';

interface InfoComponentProps {
  buttons: Button[];
  content: string[];
  isLoading?: boolean;
}

const InfoComponent: React.StatelessComponent<InfoComponentProps> = (props) => {
  const infoComponents = props.content.map((info, index) => <div key={`info${index}`} className="component">
    <div className="information">
      {info}
    </div>
  </div>);

  props.isLoading !== undefined && infoComponents.push(<div key="loading" className="component">
    {props.isLoading ? StatusLoading : StatusReady}
    </div>);

  return <ComponentContainer
    buttons={props.buttons}
    children={infoComponents}
  />
}

export { InfoComponent }
