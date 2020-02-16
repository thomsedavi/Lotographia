import * as React from 'react';
import { Button, ComponentContainer } from './ComponentContainer';
import { Option } from './Option';
import { OptionComponent } from './OptionComponent';

interface RadioOptionsComponentProps {
  buttons: Button[];
  context: string;
  options: Option[];
  onClick: (id: any) => void;
  selectedId?: string;
}

const RadioOptionsComponent: React.StatelessComponent<RadioOptionsComponentProps> = (props) => {
  const optionsComponents = props.options.map((option, index) =>
    <OptionComponent onClick={() => props.onClick(option.id)} active={option.id !== props.selectedId} selected={option.id === props.selectedId} key={`option${index}`} option={option} />);

  const optionsComponent = <div className="component">{optionsComponents}</div>;

  return <ComponentContainer
    buttons={props.buttons}
    children={optionsComponent}
    context={props.context}
  />
}

export { RadioOptionsComponent }
