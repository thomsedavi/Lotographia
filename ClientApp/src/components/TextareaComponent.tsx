import * as React from "react";
import { ComponentContainer, ComponentProps } from "./ComponentContainer";

export interface TextareaComponentProps extends ComponentProps {
  textareaTitle: string,
  value: string,
  onChange: (value: string) => void,
}

const TextareaComponent: React.StatelessComponent<TextareaComponentProps> = (props) => {
  const children: JSX.Element[] = [];

  children.push(<div className="component" key="textarea">
    <textarea placeholder="textarea" id="document" rows={2} cols={32}
      onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => props.onChange(event.target.value)}
      value={props.value} />
  </div>);

  return <ComponentContainer
    actionButtons={props.actionButtons}
    navigationButtons={props.navigationButtons}
    children={children}
    contents={props.contents}
    loadingState={props.loadingState}
    title={props.textareaTitle}
    errorMessage={props.errorMessage}
  />;
}

export const isTextareaComponent = (object: ComponentProps): object is TextareaComponentProps => {
  return "textareaTitle" in object;
}

export { TextareaComponent }
