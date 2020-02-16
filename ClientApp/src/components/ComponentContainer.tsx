import * as React from 'react';

export interface Button {
  class: string;
  isActive: boolean;
  name: string;
  onClick: () => void;
}

interface ComponentContainerProps {
  buttons: Button[];
  context?: string;
}

const ComponentContainer: React.StatelessComponent<ComponentContainerProps> = (props) => {
  const buttons = props.buttons.map((button: Button, index: number) => <div className={`button${` ${button.class}`}${button.isActive ? ' active' : ''}`} key={`button${index}`} onClick={button.isActive ? button.onClick : () => { }}>
    {button.name}
  </div>)

  return (
    <div>
      {props.context &&
        <div className="component">
          <div className="information">{props.context}</div>
        </div>
      }
      {props.children}
      <div className="component">
        {buttons}
      </div>
    </div>
  );
}

export { ComponentContainer }
