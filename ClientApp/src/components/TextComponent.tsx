import * as React from 'react';
import { Button, ComponentContainer } from './ComponentContainer';

export interface TextAreaProps {
  customValue: string;
  onChange: (event: string) => void;
  placeholder: string;
}

export interface TextProps {
  originalValue: string;
  updatedValue: string;
}

interface TextComponentProps {
  buttons: Button[];
  autofill: () => void;
  context: string;
  lineLengths: number[];
  texts: (TextAreaProps | TextProps)[];
}

const isTextArea = (object: TextAreaProps | TextProps): object is TextAreaProps => {
  return "customValue" in object;
}

const TextComponent: React.StatelessComponent<TextComponentProps> = (props) => {
  const previewLines: { convertedTexts: CharacterProps[][], tooLong: boolean } = convertText(props.texts, props.lineLengths, true);

  const previewComponents: JSX.Element[] = previewLines.convertedTexts.map((line: CharacterProps[], index1) => {
    const children: JSX.Element[] = line.map((characterProps: CharacterProps, index2) => {
      const padLeft: boolean = index2 === 0;
      const padRight: boolean = (index2 === line.length - 1 && !line[index2].isBlank) ||
        (line[0].isBlank && index2 === line.length - 1) ||
        (index2 < line.length - 1 && !line[index2].isBlank && line[index2 + 1].isBlank);

      if (characterProps.isBlank)
        return <div key={`preview${index1}character${index2}`} className={`character empty${padLeft ? " pad-left" : ""}${padRight ? " pad-right" : ""}`} dangerouslySetInnerHTML={{ __html: `&nbsp;` }} />

      if (characterProps.character === " ")
        return <div key={`preview${index1}character${index2}`} className={`character${padLeft ? " pad-left" : ""}${padRight ? " pad-right" : ""}${previewLines.tooLong ? " invalid" : ""}`} dangerouslySetInnerHTML={{ __html: `&nbsp;` }} />

      return <div key={`preview${index1}character${index2}`} className={`character${characterProps.isFixed ? " fixed" : ''}${padLeft ? " pad-left" : ""}${padRight ? " pad-right" : ""}${previewLines.tooLong ? " invalid" : ""}`}>
        {characterProps.character}
      </div>
    });

    return <div key={`preview${index1}`} style={{ marginBottom: '4px' }}>{children}</div>
  });

  const previewHeading = <div key="previewHeading" className="component heading">Preview</div>;

  const previewComponent = <div className="component" key="preview2" style={{ fontFamily: 'courier' }}>{previewComponents}</div>;

  const autofillComponent = <div className="component" key="autofill">
    <div className="button action active" onClick={props.autofill}>Random Autofill</div>
  </div>;

  const textComponents = props.texts.map((text: TextAreaProps | TextProps, index: number) => isTextArea(text) ?
    <textarea key={`textarea${index}`} className="textArea" rows={2} cols={32} onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => { if (text.onChange) text.onChange(event.target.value) }} value={text.customValue} placeholder={text.placeholder} /> :
    <div key={`text${index}`} className="text">{index > 0 && "..."}{text.originalValue}{index < props.texts.length - 1 && "..."}</div>
  );

  const textComponent = <div className="component" key="text">
    {textComponents}
  </div>;

  const children: JSX.Element[] = [
    textComponent,
    previewHeading,
    previewComponent,
    autofillComponent
  ];

  return <ComponentContainer
    buttons={props.buttons}
    children={children}
    context={props.context}
  />;
}

export interface CharacterProps {
  character: string;
  isBlank: boolean;
  isFixed: boolean;
}

const convertText = (texts: (TextAreaProps | TextProps)[], lineLengths: number[], preview: boolean) => {
  const convertedTexts: CharacterProps[][] = [];
  let fullText: CharacterProps[] = [];

  for (let x: number = 0; x < texts.length; x++) {
    const text: TextAreaProps | TextProps = texts[x];

    if (isTextArea(text)) {
      let customText: string = text.customValue || text.placeholder;
      
      if (customText[0] !== "," && customText[0] !== ":" && customText[0] !== ";" && customText[0] !== ".")
        customText = " " + customText;

      for (let y: number = 0; y < customText.length; y++)
        fullText.push({ character: customText[y], isBlank: false, isFixed: false });
    } else {
      let fixedText: string = preview ? text.originalValue : text.updatedValue;

      fixedText = " " + fixedText;

      for (let y: number = 0; y < fixedText.length; y++)
        fullText.push({ character: fixedText[y], isBlank: false, isFixed: true });
    }
  }

  let index: number = 1;

  while (index < fullText.length) {
    if (fullText[index - 1].character === " " && fullText[index].character === " ")
      fullText.splice(index - 1, 1);
    else
      index++;
  }

  if (fullText[fullText.length - 1].character === " ")
    fullText.splice(fullText.length - 1);

  for (let x: number = 0; x < lineLengths.length; x++) {
    const lineLength = lineLengths[x];
    let slicePoint = lineLength;

    while (fullText.length >= 0 && fullText[0] && (fullText[0].character === ' ' || fullText[0].character === '\n')) {
      fullText.splice(0, 1);
    }

    while (fullText.length >= 0 && fullText[0] && (fullText[fullText.length - 1].character === ' ' || fullText[fullText.length - 1].character === '\n'))
      fullText.splice(fullText.length - 1, fullText.length);

    const stringText = fullText.map(t => t.character).join(""); // do I need join?

    const firstNewLine = stringText.slice(0, slicePoint + 1).indexOf('\n');
    const lastSpace = stringText.slice(0, slicePoint + 1).lastIndexOf(' ');
    const lastHyphen = stringText.slice(0, slicePoint).lastIndexOf('-');

    if (firstNewLine >= 0)
      slicePoint = firstNewLine;
    else if (slicePoint < fullText.length)
      if (lastHyphen >= 0 && lastHyphen > lastSpace)
        slicePoint = lastHyphen + 1;
      else if (lastSpace >= 0)
        slicePoint = lastSpace;

    const convertedText = fullText.slice(0, slicePoint);

    while (convertedText.length >= 0 && convertedText[0] && (convertedText[convertedText.length - 1].character === ' '))
      convertedText.splice(convertedText.length - 1, convertedText.length);

    for (let x: number = convertedText.length; x < lineLength; x++)
      convertedText.push({ character: " ", isFixed: false, isBlank: true });

    while (fullText.length >= 0 && fullText[0] && (fullText[0].character === ' ' || fullText[0].character === '\n'))
      fullText.splice(0, 1);

    while (fullText.length >= 0 && fullText[0] && (fullText[fullText.length - 1].character === '' || fullText[fullText.length - 1].character === '\n'))
      fullText.splice(fullText.length - 1, fullText.length);

    convertedTexts.push(convertedText);
    fullText = fullText.slice(slicePoint);
  }

  return { convertedTexts, tooLong: fullText.length > 0 };
}

export { isTextArea, TextComponent, convertText }
