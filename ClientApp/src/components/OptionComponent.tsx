import * as React from 'react';
import { Option } from './Option';

interface OptionProps {
  active: boolean;
  option: Option;
  onClick: () => void;
  selected: boolean;
}

const OptionComponent: React.StatelessComponent<OptionProps> = (props) => {
  return <div className={`option${props.active ? " active" : ""}${props.selected ? " selected" : ""}`} onClick={props.onClick}>
    {props.option.objectUrl && <img className={`image ${props.option.float}`} src={props.option.objectUrl} />} 
    {props.option.name && <div className="name">{props.option.name}</div>}
    {props.option.description && <div className="description">{props.option.description}</div>}
  </div>;
}

export { OptionComponent }
