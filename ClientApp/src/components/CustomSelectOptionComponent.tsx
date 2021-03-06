import * as React from 'react';
import { CustomSelectOption } from './SelectOption';

interface CustomSelectOptionComponentProps {
  active: boolean;
  buttonOption: CustomSelectOption;
  onClick: () => void;
  selected: boolean;
}

const CustomSelectOptionComponent: React.StatelessComponent<CustomSelectOptionComponentProps> = (props) => {
  return <button disabled={!props.active} className={`option${props.selected ? " selected" : ""}`} onClick={props.onClick}>
    {props.buttonOption.objectUrl && <img className={`image ${props.buttonOption.float}`} src={props.buttonOption.objectUrl} />} 
    {props.buttonOption.name && <div className="name">{props.buttonOption.name}</div>}
    {props.buttonOption.description && <div className="description">{props.buttonOption.description}</div>}
  </button>;
}

export { CustomSelectOptionComponent }
