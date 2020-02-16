import * as React from 'react';
import { Button, ComponentContainer } from './ComponentContainer';
import { Option } from './Option';
import { OptionComponent } from './OptionComponent';

interface CheckboxOptionsComponentProps {
  buttons: Button[];
  context: string;
  options: Option[];
  onClick: (id: string) => void;
  selectedIds: string[];
  maximum: number;
}

const CheckboxOptionsComponent: React.StatelessComponent<CheckboxOptionsComponentProps> = (props) => {
  const optionsComponents = props.options.map((option, index) =>
    <OptionComponent onClick={() => props.onClick(option.id)} active={props.selectedIds.length < props.maximum || props.selectedIds.indexOf(option.id) >= 0} selected={props.selectedIds.indexOf(option.id) >= 0} key={index} option={option} />
  );

  const optionsComponent = <div className="component">{optionsComponents}</div>;

  return <ComponentContainer
    buttons={props.buttons}
    children={optionsComponent}
    context={props.context}
  />
}

const CheckboxOptionsFunction = (selectedIds: string[], id: string, maximum: number, callback: (selectedIds: string[]) => void) => {
  const index = selectedIds.indexOf(id);

  if (index < 0 && selectedIds.length < maximum) {
    selectedIds.push(id);
  } else if (index >= 0) {
    selectedIds.splice(index, 1);
  }

  callback(selectedIds);
}

export { CheckboxOptionsComponent, CheckboxOptionsFunction }
