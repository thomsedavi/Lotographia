import * as React from 'react';
import { ComponentContainer, ComponentProps } from './ComponentContainer';
import { CustomSelectOption } from './SelectOption';
import { CustomSelectOptionComponent } from './CustomSelectOptionComponent';

export interface RadioComponentProps extends ComponentProps {
  selectOptions: CustomSelectOption[];
  onClick: (id: any) => void;
  selectedId?: string;
  radioTitle: string;
}

const RadioComponent: React.StatelessComponent<RadioComponentProps> = (props) => {
  const optionsComponents = props.selectOptions.map((selectOption, index) =>
    <CustomSelectOptionComponent onClick={() => props.onClick(selectOption.id)} active={selectOption.id !== props.selectedId} selected={selectOption.id === props.selectedId} key={`option${index}`} buttonOption={selectOption} />);

  const optionsComponent = <div className="component">{optionsComponents}</div>;

  return <ComponentContainer
    navigationButtons={props.navigationButtons}
    children={optionsComponent}
    contents={props.contents}
    loadingState={props.loadingState}
    title={props.radioTitle}
  />;
}

export const isRadioComponent = (object: ComponentProps): object is RadioComponentProps => {
  return "radioTitle" in object;
}

export { RadioComponent }
