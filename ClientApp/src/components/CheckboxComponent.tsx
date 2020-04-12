import * as React from 'react';
import { ComponentContainer, ComponentProps } from './ComponentContainer';
import { CustomSelectOption } from './SelectOption';
import { CustomSelectOptionComponent } from './CustomSelectOptionComponent';
import { Option } from "../common/Interfaces";

export interface CheckboxComponentProps extends ComponentProps {
  selectOptions: CustomSelectOption[];
  onClick: (id: string) => void;
  options: Option[];
  maximum: number;
  checkboxTitle: string;
}

const CheckboxComponent: React.StatelessComponent<CheckboxComponentProps> = (props) => {
  const selectedIds = props.options.filter(i => i.isSelected).map(i => i.id);

  const optionsComponents = props.selectOptions.map((selectOption, index) =>
    <CustomSelectOptionComponent onClick={() => props.onClick(selectOption.id)} active={selectedIds.length < props.maximum || selectedIds.indexOf(selectOption.id) >= 0} selected={selectedIds.indexOf(selectOption.id) >= 0} key={index} buttonOption={selectOption} />
  );

  const optionsComponent = <div className="component">{optionsComponents}</div>;

  return <ComponentContainer
    navigationButtons={props.navigationButtons}
    children={optionsComponent}
    contents={props.contents}
    loadingState={props.loadingState}
    title={props.checkboxTitle}
  />;
}

export const selectCheckboxOption = (options: Option[], optionId: string, maximum: number, callback: (options: Option[]) => void) => {
  const amountSelected = options.filter(i => i.isSelected).length;
  const idSelected = options.filter(i => i.id === optionId)[0];

  if (amountSelected === maximum || idSelected.isSelected) {
    idSelected.isSelected = false;
  } else {
    idSelected.isSelected = true;
  }

  callback(options);
} 
  
export const isCheckboxComponent = (object: ComponentProps): object is CheckboxComponentProps => {
  return "checkboxTitle" in object;
}

export { CheckboxComponent }
