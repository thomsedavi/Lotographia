import * as React from 'react';
import { ComponentContainer, ComponentProps } from './ComponentContainer';
import { SelectOption } from './SelectOption';

export interface SelectComponentProps extends ComponentProps {
  options: SelectOption[],
  onClick: (id: any) => void,
  selectedId?: string,
  selectedName?: string,
  selectedDescription?: string,
  selectedImageUrl?: string,
  selectTitle: string
}

const SelectComponent: React.StatelessComponent<SelectComponentProps> = (props) => {
  const optionsComponents = props.options.map((option, index) =>
    <option key={`option${index}`} value={option.id}>{option.name}</option>);

  const children: JSX.Element[] = [];

  children.push(<div className="component">
    <select onChange={(event: React.ChangeEvent<HTMLSelectElement>) => props.onClick(event.currentTarget.value)}
      value={props.selectedId}>
      {optionsComponents}
    </select>
  </div>);

  props.selectedName && props.selectedDescription && children.push(<div className="component">
    <div className="option selected">
      {props.selectedImageUrl && <img className="image right" src={props.selectedImageUrl} />} 
      {props.selectedName && <div className="name">{props.selectedName}</div>}
      {props.selectedDescription && <div className="description">{props.selectedDescription}</div>}
    </div>
  </div>);

  return <ComponentContainer
    actionButtons={props.actionButtons}
    navigationButtons={props.navigationButtons}
    children={children}
    contents={props.contents}
    loadingState={props.loadingState}
    title={props.selectTitle}
  />;
}

export const isSelectComponent = (object: ComponentProps): object is SelectComponentProps => {
  return "selectTitle" in object;
}

export { SelectComponent }
