import * as React from 'react';
import { InfoComponent, isInfoComponent } from "../components/InfoComponent";
import { TextComponent, isTextComponent } from "../components/TextComponent";
import { RadioComponent, isRadioComponent } from "../components/RadioComponent";
import { SelectComponent, isSelectComponent } from "../components/SelectComponent";
import { CheckboxComponent, isCheckboxComponent } from "../components/CheckboxComponent";
import { DisplayComponent, isDisplayComponent } from "../components/DisplayComponent";
import { LayersToolComponent, isLayersToolComponent } from "../components/LayersToolComponent";

export interface Button {
  class: string,
  isActive: boolean,
  name: string,
  onClick: () => void
}

export interface ComponentProps {
  actionButtons?: Button[],
  navigationButtons: Button[],
  contents: string[],
  loadingState?: JSX.Element
}

interface ComponentContainerProps extends ComponentProps {
  title: string
}

const ComponentContainer: React.StatelessComponent<ComponentContainerProps> = (props) => {
  const contents = props.contents.map((content: string, index: number) => <div className="component" key={`content${index}`}>
    <div className="information">{content}</div>
  </div>);

  let actionButtons: JSX.Element[] = [];

  if (props.actionButtons !== undefined)
    actionButtons = props.actionButtons.map((button: Button, index: number) => <button className={button.class} disabled={!button.isActive} key={`actionButton${index}`} onClick={button.isActive ? button.onClick : () => { }}>
      {button.name}
    </button>);

  const navigationButtons = props.navigationButtons.map((button: Button, index: number) => <button className={button.class} key={`navigationButton${index}`} disabled={!button.isActive} onClick={button.isActive ? button.onClick : () => { }}>
    {button.name}
  </button>);

  return (
    <div>
      <div className="component">
        <div className="title">{props.title}</div>
      </div>

      {contents}

      {props.children}

      {actionButtons.length > 0 && <div className="component buttons">
        {actionButtons}
      </div>}

      {props.loadingState !== undefined && <div key="loading" className="component">
        {props.loadingState}
      </div>}

      {navigationButtons.length > 0 && <div className="component buttons">
        {navigationButtons}
      </div>}
    </div>
  );
}

export const getComponent = (componentProps: ComponentProps) => {
  if (isInfoComponent(componentProps))
    return <InfoComponent {...componentProps} />;
  else if (isRadioComponent(componentProps))
    return <RadioComponent {...componentProps} />;
  else if (isRadioComponent(componentProps))
    return <RadioComponent {...componentProps} />;
  else if (isSelectComponent(componentProps))
    return <SelectComponent {...componentProps} />;
  else if (isCheckboxComponent(componentProps))
    return <CheckboxComponent {...componentProps} />;
  else if (isTextComponent(componentProps))
    return <TextComponent {...componentProps} />;
  else if (isDisplayComponent(componentProps))
    return <DisplayComponent {...componentProps} />;
  else if (isTextComponent(componentProps))
    return <TextComponent {...componentProps} />;
  else if (isLayersToolComponent(componentProps))
    return <LayersToolComponent {...componentProps} />;

  return <InfoComponent
    navigationButtons={[]}
    contents={["error"]}
    infoTitle="Game Title Use Const"
  />;
}

export { ComponentContainer }
