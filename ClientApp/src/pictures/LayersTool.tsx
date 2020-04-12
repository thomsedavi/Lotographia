import * as React from "react";
import { getComponent } from "../components/ComponentContainer";
import { InfoComponentProps } from "../components/InfoComponent";
import { LayersToolComponentProps } from "../components/LayersToolComponent";
import { FontFamily, LayerType } from "../common/Enums";
import { Layer } from "../common/Interfaces";
import { getProcessedImageObjectURL } from "../common/Utils";

interface LayersToolState {
  stage: number;
  previewURL?: string;
  loadedImages: number;
  layers: Layer[];
}

export class LayersTool extends React.Component<any, LayersToolState> {
  base: string = "MeticulousSkeleton/PrisonBreak.png";
  height: number = 600;
  width: number = 900;

  constructor(props: any) {
    super(props);

    this.state = {
      stage: 0,
      loadedImages: 0,
      layers: [ 
        {
          layerType: LayerType.Phrase,
          isVisible: true,
          backgroundColor: "#000",
          horizontalPosition: 0.5,
          verticalPosition: 0.5,
          horizontalAlignment: 0.5,
          verticalAlignment: 0.5,
          fontFamily: FontFamily.Monospace,
          fontSize: 10,
          shownText: "Hello",
          hiddenText: "Hello",
          textColor: "#FFF",
          rotation: 0,
          deleted: false
        }
      ]
    };
  }

  componentDidMount = () => {
    this.updateImage();
  }

  next = () => {
    this.setState((state) => ({
      stage: state.stage + 1
    }));
  }

  previous = () => {
    this.setState((state) => ({
      stage: state.stage - 1
    }));
  }

  getBody = () => {
    return {
      base: this.base,
      height: this.height,
      layers: this.state.layers.filter(t => !t.deleted),
      width: this.width,
      lotoColour: "#fff",
      lotoBackground: "#000"
    }
  }

  updateLayers = (layers: Layer[]) => {
    this.setState({
      layers: layers
    });
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
    let componentProps: LayersToolComponentProps | InfoComponentProps;

    switch (this.state.stage) {
      case 0:
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
        }
        break;
      case 1:
        componentProps = {
          layersToolTitle: "Page",
          layers: this.state.layers,
          updateLayers: this.updateLayers,
          navigationButtons: [],
          updateImage: this.updateImage,
          contents: [
            "Draw some things!",
            "Everything is great"
          ],
          previewURL: this.state.previewURL
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
