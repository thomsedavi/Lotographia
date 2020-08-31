import * as React from "react";
import { ComponentContainer, ComponentProps } from "./ComponentContainer";
import { TextType, LayerType, TextComponentType, FontFamily } from "../common/Enums";
import { TextComponent, Layer, TextElement, SubstituteTexts, RequiredText } from "../common/Interfaces";

export interface TextComponentProps extends ComponentProps {
  textTitle: string,
  textElements: TextElement[],
  onChange: (value: string, index: number) => void,
  layers: Layer[],
  isTooLong: boolean,
  requiredTexts?: RequiredText[]
}

const TextComponent: React.StatelessComponent<TextComponentProps> = (props) => {
  const children: JSX.Element[] = [];

  if (props.requiredTexts !== undefined && props.requiredTexts.length > 0) {
    const texts: (JSX.Element | string)[] = [`Required word${props.requiredTexts.length > 1 ? "s" : ""}: ` ];

    props.requiredTexts.map((text: RequiredText, index: number) => {
      // use classes instead of styles
      texts.push(<div style={{ fontWeight: 700, display: "inline-block", color: text.isMissing ? "#f33" : "#048" }}>{text.text}</div>)

      if (props.requiredTexts !== undefined && props.requiredTexts.length === 2 && index === props.requiredTexts.length - 2)
        texts.push(" and ");

      if (props.requiredTexts !== undefined && props.requiredTexts.length > 2 && index < props.requiredTexts.length - 2)
        texts.push(", ");

      if (props.requiredTexts !== undefined && props.requiredTexts.length > 2 && index === props.requiredTexts.length - 2)
        texts.push(", and ");
    });

    children.push(<div className="component" key="componentRequiredText">
      <div className="information">{texts}</div>
    </div>);
  }

  props.textElements.map((textElement: TextElement, index: number) => {
    if (textElement.type === TextType.Custom) {
      children.push(<div className="component" key={`component${index}`}>
        <textarea className="textArea" rows={4} cols={40}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => props.onChange(event.target.value, index)}
          value={textElement.text}
          placeholder={textElement.placeholder} />
      </div>);
    } else {
      let textHelp = "";

      if (index > 0)
        textHelp += "..."; // use elipsis?

      textHelp = textHelp + textElement.text;

      if (index < props.textElements.length - 1)
        textHelp += "..."

      children.push(<div className="component"><div className="text">{textHelp}</div></div>);
    }
  });

  props.layers.filter(layer => layer.layerType === LayerType.Phrase).map((layer: Layer, i: number) => {
    let fontFamily: string;
    let fontSize: string = "1em";

    // move this util out
    switch (layer.fontFamily) {
      case FontFamily.SansSerif:
        fontFamily = "sans-serif"
        break;
      case FontFamily.Serif:
        fontFamily = "serif";
        break;
      case FontFamily.Journal:
        fontFamily = "journalregular";
        fontSize = "1.4em";
        break;
      case FontFamily.Gandhi:
        fontFamily = "gandhi_serifregular";
        break;
      case FontFamily.Monospace:
      default:
        fontFamily = "monospace";
    }

    // use classes
    const style: React.CSSProperties = {
      fontFamily: fontFamily,
      fontSize: fontSize,
      lineHeight: "1em",
      color: props.isTooLong ? "#f33" : "#000"
    };

    const maxHyphens: number = layer.maximumLength !== undefined && layer.remainderFraction !== undefined ?
      Math.floor(layer.maximumLength * (layer.remainderFraction))
      : 0;

    const hyphen: JSX.Element[] = [];

    if (layer.displayRemainder) {
      for (var j = 0; j < maxHyphens; j++) {
        hyphen.push(<div style={{ color: i % 2 == 0 ? "#7bf" : "#bdf", display: "inline-block" }} key={`line${i}hyphen${j}`}>_</div>);
      }
    }

    children.push(<div className="component">
      <div className="preview" style={style}>{layer.shownText}{hyphen}</div>
    </div>);
  });

  return <ComponentContainer
    actionButtons={props.actionButtons}
    navigationButtons={props.navigationButtons}
    children={children}
    contents={props.contents}
    loadingState={props.loadingState}
    title={props.textTitle}
  />;
}

export const mapToTextComponents = (textElements: TextElement[], substituteTexts: SubstituteTexts[]) => {
  let shownText: string = textElements.map((textElement: TextElement, index: number) => {
    let text = textElement.text || "...";
  
    if (text === undefined)
      return "";
  
    if (index > 0 &&
      text[0] != "," &&
      text[0] != ":" &&
      text[0] != ";" &&
      text[0] != "!" &&
      text[0] != "?"
    )
      text = " " + text;
  
    return text;
  }).join("");

  while (shownText[0] === " ") {
    shownText = shownText.slice(1);
  }

  while (shownText[shownText.length - 1] === " ") {
    shownText = shownText.slice(0, shownText.length - 1);
  }

  while (shownText.indexOf("  ") >= 0) {
    shownText = shownText.replace("  ", " ");
  }

  while (shownText.indexOf("\n ") >= 0) {
    shownText = shownText.replace("\n ", "\n");
  }

  while (shownText.indexOf(" \n") >= 0) {
    shownText = shownText.replace(" \n", "\n");
  }

  while (shownText.indexOf("\n\n") >= 0) {
    shownText = shownText.replace("\n\n", "\n");
  }

  let hiddenText = shownText;
  let requiredTexts: RequiredText[] = [];

  substituteTexts.forEach(substituteText => {
    let hasRequiredTexts = false;
  
    substituteText.variantTexts.forEach(variantText => {
      let indexOf: number = hiddenText.toLowerCase().indexOf(variantText.shownText.toLowerCase());
    
      while (indexOf >= 0) {
        hasRequiredTexts = true;
    
        // want to handle spaces properly so that if "cat" becomes "dog" then "catalogue" doesn't become "dogalogue"
        const splitInitial = hiddenText.slice(indexOf, indexOf + variantText.shownText.length).split(" ");
        const splitFinal = variantText.hiddenText.split(" ");
        
        const adjustedCapitals = splitInitial.map((initial: string, index: number) => {
          const final = splitFinal[index];
        
          if (initial === initial.toUpperCase())
            return final.toUpperCase();
        
          if (initial[0].toUpperCase() === initial[0])
            return final[0].toUpperCase() + final.slice(1).toLowerCase();
        
          return final;
        }).join(" ");
        
        hiddenText = hiddenText.slice(0, indexOf) +
          adjustedCapitals +
          hiddenText.slice(indexOf + variantText.shownText.length);

        indexOf = hiddenText.toLowerCase().indexOf(variantText.shownText.toLowerCase());
      }
    });
  
    if (substituteText.isRequired) {
      requiredTexts.push({
        text: substituteText.displayedText,
        isMissing: !hasRequiredTexts
      });
    }
  });

  const textComponents: TextComponent[] = [];

  let loopCounter: number = 0;

  while (shownText.length > 0 && loopCounter < 50) {
    if (shownText[0] === " ") {
      textComponents.push({
        type: TextComponentType.Space
      });
  
      shownText = shownText.slice(1);
      hiddenText = hiddenText.slice(1);
    } else if (shownText[0] === "\n") {
      textComponents.push({
        type: TextComponentType.Return
      });
  
      shownText = shownText.slice(1);
      hiddenText = hiddenText.slice(1);
    } else if (shownText[0] === "-") {
      textComponents.push({
        type: TextComponentType.Hyphen
      });
  
      shownText = shownText.slice(1);
      hiddenText = hiddenText.slice(1);
    } else {
      let displayedIndex: number = 0;
      let finalIndex: number = 0;
  
      while (displayedIndex < shownText.length &&
        shownText[displayedIndex] !== " " &&
        shownText[displayedIndex] !== "\n" &&
        shownText[displayedIndex] !== "-")
        displayedIndex++;
  
      while (finalIndex < hiddenText.length &&
        hiddenText[finalIndex] !== " " &&
        hiddenText[finalIndex] !== "\n" &&
        hiddenText[finalIndex] !== "-")
        finalIndex++;
  
      textComponents.push({
        type: TextComponentType.Word,
        variantText: {
          shownText: shownText.substring(0, displayedIndex),
          hiddenText: hiddenText.substring(0, finalIndex)
        }
      });
  
      shownText = shownText.slice(displayedIndex);
      hiddenText = hiddenText.slice(finalIndex);
    }
  }

  return {
    textComponents: textComponents,
    requiredTexts: requiredTexts
  };
}

export const isTextComponent = (object: ComponentProps): object is TextComponentProps => {
  return "textTitle" in object;
}

export { TextComponent }
