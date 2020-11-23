import * as React from "react";
import { getComponent } from "../components/ComponentContainer";
import { InfoComponentProps } from "../components/InfoComponent";
import { TextareaComponentProps } from "../components/TextareaComponent";
import { LayersToolComponentProps } from "../components/LayersToolComponent";
import { FontFamily, LayerType } from "../common/Enums";
import { Layer } from "../common/Interfaces";
import { getProcessedImageObjectURL } from "../common/Utils";

interface LayersToolState {
  stage: number,
  previewURL?: string,
  loadedImages: number,
  layers: Layer[],
  showOrigins: boolean,
  textarea: string,
  errorMessage?: string
}

interface JsonLayer {
  backgroundColor: string,
  rotation: number,
  maximumLength: number,
  horizontalPosition: number,
  verticalPosition: number,
  horizontalAlignment: number,
  verticalAlignment: number,
  fontFamily: string,
  fontSize: number,
  textColor: string
}

export class LayersTool extends React.Component<any, LayersToolState> {
  base: string = "Capricotta/TheHighSeas.png";
  height: number = 900;
  width: number = 600;

  constructor(props: any) {
    super(props);

    this.state = {
      stage: 0,
      loadedImages: 0,
      layers: [],
      showOrigins: false,
      textarea: "[]"
    };
  }

  next = () => {
    if (this.state.stage == 0) {
      this.updateImage();
    }

    this.setState((state) => ({
      stage: state.stage + 1
    }));
  }

  previous = () => {
    this.setState((state) => ({
      stage: state.stage - 1
    }));
  }

  updateText = (value: string) => {
    this.setState({
      textarea: value,
      errorMessage: undefined
    });

    this.updateLayersFromText(value);
  }

  getBody = () => {
    return {
      base: this.base,
      height: this.height,
      layers: this.state.layers.filter(t => !t.deleted),
      width: this.width,
      lotoColour: "#fff",
      lotoBackground: "#000",
      showOrigins: this.state.showOrigins
    }
  }

  getFontFamily = (fontFamily: string) => {
    switch (fontFamily) {
      case FontFamily.SansSerif:
        return FontFamily.SansSerif;
      case FontFamily.Serif:
        return FontFamily.Serif;
      case FontFamily.Journal:
        return FontFamily.Journal;
      case FontFamily.Gandhi:
        return FontFamily.Gandhi;
      case FontFamily.Monospace:
      default:
        return FontFamily.Monospace;
    }
  }

  updateLayersFromText = (layersJson: string) => {
    try {
      let fonts: string[] = ["Monospace", "Serif", "SansSerif", "Journal", "Gandhi"]

      layersJson = layersJson.replace(/LayerType.Phrase/g, `"LayerType.Phrase"`);
      layersJson = layersJson.replace(/FontFamily./g, ``);
      fonts.map((font: string) => {
        var regExp = new RegExp(font, "g");
        layersJson = layersJson.replace(regExp, `"${font.toLowerCase()}"`);
      });

      const jasons: JsonLayer[] = JSON.parse(layersJson);
      const layers: Layer[] = [];
      let key = 0;

      jasons.map((jason: JsonLayer) => {
        let underscores = "";

        for (let i = 0; i < jason.maximumLength; i++) {
          underscores += "_";
        }

        layers.push({
          layerType: LayerType.Phrase,
          isVisible: true,
          backgroundColor: jason.backgroundColor,
          horizontalPosition: jason.horizontalPosition,
          verticalPosition: jason.verticalPosition,
          horizontalAlignment: jason.horizontalAlignment,
          verticalAlignment: jason.verticalAlignment,
          fontFamily: this.getFontFamily(jason.fontFamily),
          fontSize: jason.fontSize,
          shownText: underscores,
          hiddenText: underscores,
          textColor: jason.textColor,
          rotation: jason.rotation,
          deleted: false,
          isOpen: false,
          key: key
        });

        key++;
      });

      this.setState({
        layers: layers
      });
    } catch (error) {
      this.setState({
        errorMessage: error.message
      });
    }
  }

  updateLayers = (layers: Layer[]) => {
    this.setState({
      layers: layers
    });
  }

  toggleShowOrigins = () => {
    this.setState(prevState => ({
      showOrigins: !prevState.showOrigins
    }));
  }

  updateImage = () => {
    this.state.previewURL !== undefined &&
      URL.revokeObjectURL(this.state.previewURL);

    const callback = (objectURL: string) => {
      this.setState({
        previewURL: objectURL
      });
    }

    const body = JSON.stringify(
      this.getBody()
    )

    getProcessedImageObjectURL(body, callback);
  }

  render() {
    let componentProps: TextareaComponentProps | LayersToolComponentProps | InfoComponentProps;

    switch (this.state.stage) {
      case 0:
        componentProps = {
          contents: ["Whatever"],
          textareaTitle: "Input Maybe",
          value: this.state.textarea,
          onChange: this.updateText,
          navigationButtons: [
            {
              class: "navigation",
              name: "Next",
              onClick: this.next,
              isActive: true
            }
          ],
          errorMessage: this.state.errorMessage
        }
        break;
      case 1:
        componentProps = {
          contents: ["Whatever"],
          infoTitle: "Thing",
          navigationButtons: [
            {
              class: "navigation",
              name: "Next",
              onClick: this.next,
              isActive: this.state.previewURL !== undefined
            }
          ]
        };
        break;
      case 2:
        componentProps = {
          layersToolTitle: "Page",
          layers: this.state.layers,
          updateLayers: this.updateLayers,
          toggleShowOrigins: this.toggleShowOrigins,
          navigationButtons: [],
          updateImage: this.updateImage,
          contents: [
            "Draw some things!",
            "Everything is great"
          ],
          previewURL: this.state.previewURL,
          showOrigins: this.state.showOrigins
        };
        break;
      default:
        componentProps = {
          infoTitle: "Broken",
          navigationButtons: [],
          contents: []
        };
    }

    return getComponent(componentProps);
  }
}
