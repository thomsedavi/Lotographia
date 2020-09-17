import * as React from 'react';
import { ComponentContainer, ComponentProps } from './ComponentContainer';
import { SelectOption, OptionGroup } from './SelectOption';
import { ImageLoading } from '../common/Assets';

export interface SelectComponentProps extends ComponentProps {
  options: SelectOption[],
  optionGroups: OptionGroup[],
  onClick: (id: any) => void,
  selectedId?: string,
  selectedName?: string,
  selectedDescription?: string,
  selectedImageUrl?: string,
  hasImage: boolean,
  selectTitle: string,
  footnote?: JSX.Element
}

const SelectComponent: React.StatelessComponent<SelectComponentProps> = (props) => {
  const optionsComponents = props.options.map((option: SelectOption, index: number) =>
    <option key={`option${index}`} value={option.id}>{option.name}</option>);

  const optionGroupComponents = props.optionGroups.map((optionGroup: OptionGroup, groupIndex: number) => {
    const optionsGroupOptionsComponents = optionGroup.options.map((option: SelectOption, optionIndex: number) =>
      <option key={`optionGroup${groupIndex}option${optionIndex}`} value={option.id}>{option.name}</option>);

    return <optgroup label={optionGroup.label} key={`optionGroup${groupIndex}`}>
      {optionsGroupOptionsComponents}
    </optgroup>;
  });

  const children: JSX.Element[] = [];

  children.push(<div className="component">
    <select onChange={(event: React.ChangeEvent<HTMLSelectElement>) => props.onClick(event.currentTarget.value)}
      value={props.selectedId}>
      {optionsComponents}
      {optionGroupComponents}
    </select>
  </div>);

  props.selectedName && props.selectedDescription && children.push(<div className="component">
    <button className="option selected no-hover">
      {props.hasImage && props.selectedImageUrl && <img className="image right" src={props.selectedImageUrl} />}
      {props.hasImage && !props.selectedImageUrl && ImageLoading} 
      {props.selectedName && <div className="name">{props.selectedName}</div>}
      {props.selectedDescription && <div className="description">{props.selectedDescription}</div>}
    </button>
  </div>);

  props.footnote !== undefined && children.push(props.footnote);

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
