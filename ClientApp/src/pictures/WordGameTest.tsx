import * as React from "react";
import { RequiredText } from "../common/Interfaces";

interface WordGameTestState {
  text: string,
  requiredTexts: RequiredText[]
}

export class WordGameTest extends React.Component<any, WordGameTestState> {
  constructor(props: any) {
    super(props);

    // year, text, sort, honest, since, deep
    this.state = {
      text: "",
      requiredTexts: [
        {
          text: "year",
          isMissing: true
        },
        {
          text: "text",
          isMissing: true
        },
        {
          text: "sort",
          isMissing: true
        },
        {
          text: "honest",
          isMissing: true
        },
        {
          text: "since",
          isMissing: true
        },
        {
          text: "deep",
          isMissing: true
        }
      ]
    };
  }

  changeText = (text: string) => {
    var requiredTexts: RequiredText[] = this.state.requiredTexts;

    for (var x = 0; x < requiredTexts.length; x++) {
      if (text.indexOf(requiredTexts[x].text) < 0) {
        requiredTexts[x].isMissing = true;
      } else {
        requiredTexts[x].isMissing = false;
      }
    }

    this.setState({
      text: text
    });
  }

  render() {
    const texts: (JSX.Element | string)[] = ["Required words are: "];
    const requiredTexts = this.state.requiredTexts;

    requiredTexts.map((text: RequiredText, index: number) => {
      // use classes instead of styles
      texts.push(<div style={{ fontWeight: 700, display: "inline-block", color: text.isMissing ? "#f33" : "#048" }}>{text.text}</div>)

      if (requiredTexts.length === 2 && index === requiredTexts.length - 2)
        texts.push(" and ");

      if (requiredTexts.length > 2 && index < requiredTexts.length - 2)
        texts.push(", ");

      if (requiredTexts.length > 2 && index === requiredTexts.length - 2)
        texts.push(", and ");
    });

    let textExcludingLineBreaks = this.state.text;

    while (textExcludingLineBreaks.indexOf("\n") >= 0) {
      textExcludingLineBreaks = textExcludingLineBreaks.replace("\n", "");
    }

    const textLengthExcludingLineBreaks = textExcludingLineBreaks.length;

    return (
      <div>
        <div className="component">
          <div className="title">Word Game Test</div>
        </div>
        <div className="component">
          <div className="information">Please write something up to 140 characters long using these words!</div>
        </div>
        <div className="component">
          <div className="information">{texts}</div>
        </div>
        <div className="component">
          <textarea className={this.state.text.length > 140 ? "error" : ""} value={this.state.text} onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => this.changeText(event.target.value)} id="document" rows={2} cols={32} />
        </div>
        <div className="component">
          <div className="emphasis" style={{ color: textLengthExcludingLineBreaks > 140 ? "red" : "initial" }}>Character Count: {textLengthExcludingLineBreaks}/140</div>
        </div>
      </div>
    );
  }
}
