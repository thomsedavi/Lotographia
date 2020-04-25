import * as React from 'react';
import { ComponentContainer, ComponentProps } from './ComponentContainer';
import { FontFamily, LayerType } from "../common/Enums";
import { Layer } from "../common/Interfaces";
import { isValidColour } from "../common/Utils";

export interface LayersToolComponentProps extends ComponentProps {
  layersToolTitle: string;
  layers: Layer[];
  updateLayers: (layers: Layer[]) => void,
  previewURL?: string;
  updateImage: () => void;
}

const DefaultNewLayer: Layer = {
  layerType: LayerType.Phrase,
  isVisible: true,
  shownText: "New",
  hiddenText: "New",
  horizontalAlignment: 0.5,
  verticalAlignment: 0.5,
  horizontalPosition: 0.5,
  verticalPosition: 0.5,
  rotation: 0,
  backgroundColor: "#FFF",
  fontFamily: FontFamily.Monospace,
  fontSize: 10,
  textColor: "#000",
  deleted: false,
  isDirty: true
}

interface LayerComponentProps {
  index: number;
  layer: Layer;
  updateLayer: (editableTextObject: Layer, index: number) => void;
  deleteLayer: (index: number) => void;
  setDirty: (index: number) => void;
}

const LayerComponent: React.StatelessComponent<LayerComponentProps> = (props) => {
  let textRef: React.RefObject<HTMLInputElement> = React.createRef();
  let textColorRef: React.RefObject<HTMLInputElement> = React.createRef();
  let textBackgroundColorRef: React.RefObject<HTMLInputElement> = React.createRef();
  let xPositionRef: React.RefObject<HTMLInputElement> = React.createRef();
  let yPositionRef: React.RefObject<HTMLInputElement> = React.createRef();
  let xAlignmentRef: React.RefObject<HTMLInputElement> = React.createRef();
  let yAlignmentRef: React.RefObject<HTMLInputElement> = React.createRef();
  let fontFamilyRef: React.RefObject<HTMLSelectElement> = React.createRef();
  let fontSizeRef: React.RefObject<HTMLSelectElement> = React.createRef();
  let rotationRef: React.RefObject<HTMLInputElement> = React.createRef();

  return <div className="component">
    <div className="subtitle">Component {props.index}</div>

    <div>
      <div style={{ margin: "0.2em 0.5em", display: "inline-block" }}>
        <label htmlFor="text" style={{ marginRight: "0.5em" }}>Text</label>
        <input type="text" id="text" style={{ borderColor: "initial" }} defaultValue={props.layer.shownText} ref={textRef} onChange={() => props.setDirty(props.index)} />
      </div>

      <div style={{ margin: "0.2em 0.5em", display: "inline-block" }}>
        <label htmlFor="textColour" style={{ marginRight: "0.5em" }}>Text Colour</label>
        <input type="text" id="textColour" style={{ fontFamily: "monospace", width: "4.3em", borderColor: !isValidColour(props.layer.textColor) ? "red" : "initial" }} defaultValue={props.layer.textColor} maxLength={7} ref={textColorRef} onChange={() => props.setDirty(props.index)} />
      </div>

      <div style={{ margin: "0.2em 0.5em", display: "inline-block" }}>
        <label htmlFor="backgroundColour" style={{ marginRight: "0.5em" }}>Background Colour</label>
        <input type="text" id="backgroundColour" style={{ fontFamily: "monospace", width: "4.3em", borderColor: !isValidColour(props.layer.backgroundColor) ? "red" : "initial" }} defaultValue={props.layer.backgroundColor} maxLength={7} ref={textBackgroundColorRef} onChange={() => props.setDirty(props.index)} />
      </div>
      
      <div style={{ margin: "0.2em 0.5em", display: "inline-block" }}>
        <label htmlFor="horizontalPosition" style={{ marginRight: "0.5em" }}>Horizontal Position</label>
        <input type="text" id="horizontalPosition" style={{ fontFamily: "monospace", width: "3.2em", borderColor: props.layer.horizontalPosition == undefined || props.layer.horizontalPosition < 0 || props.layer.horizontalPosition > 1 ? "red" : "initial" }} defaultValue={props.layer.horizontalPosition} maxLength={5} ref={xPositionRef} onChange={() => props.setDirty(props.index)} />
      </div>
      
      <div style={{ margin: "0.2em 0.5em", display: "inline-block" }}>
        <label htmlFor="verticalPosition" style={{ marginRight: "0.5em" }}>Vertical Position</label>
        <input type="text" id="verticalPosition" style={{ fontFamily: "monospace", width: "3.2em", borderColor: props.layer.verticalPosition == undefined || props.layer.verticalPosition < 0 || props.layer.verticalPosition > 1 ? "red" : "initial" }} defaultValue={props.layer.verticalPosition} maxLength={5} ref={yPositionRef} onChange={() => props.setDirty(props.index)} />
      </div>

      <div style={{ margin: "0.2em 0.5em", display: "inline-block" }}>
        <label htmlFor="horizontalAlignment" style={{ marginRight: "0.5em" }}>Horizontal Alignment</label>
        <input type="text" id="horizontalAlignment" style={{ fontFamily: "monospace", width: "3.2em", borderColor: props.layer.horizontalAlignment == undefined || props.layer.horizontalAlignment < 0 || props.layer.horizontalAlignment > 1 ? "red" : "initial" }} defaultValue={props.layer.horizontalAlignment} maxLength={5} ref={xAlignmentRef} onChange={() => props.setDirty(props.index)} />
      </div>

      <div style={{ margin: "0.2em 0.5em", display: "inline-block" }}>
        <label htmlFor="verticalAlignment" style={{ marginRight: "0.5em" }}>Vertical Alignment</label>
        <input type="text" id="verticalAlignment" style={{ fontFamily: "monospace", width: "3.2em", borderColor: props.layer.verticalAlignment == undefined || props.layer.verticalAlignment < 0 || props.layer.verticalAlignment > 1 ? "red" : "initial" }} defaultValue={props.layer.verticalAlignment} maxLength={5} ref={yAlignmentRef} onChange={() => props.setDirty(props.index)} />
      </div>

      <div style={{ margin: "0.2em 0.5em", display: "inline-block" }}>
        <label htmlFor="rotation" style={{ marginRight: "0.5em" }}>Rotation</label>
        <input type="text" id="rotation" style={{ fontFamily: "monospace", width: "3.2em", borderColor: props.layer.rotation == undefined || props.layer.rotation < -360 || props.layer.rotation > 360 ? "red" : "initial" }} defaultValue={props.layer.rotation} maxLength={5} ref={rotationRef} onChange={() => props.setDirty(props.index)} />
      </div>

      <div style={{ margin: "0.2em 0.5em", display: "inline-block" }}>
        <label htmlFor="fontFamily" style={{ marginRight: "0.5em" }}>Font Family</label>

        <select id="fontFamily" ref={fontFamilyRef} defaultValue={props.layer.fontFamily} onChange={() => props.setDirty(props.index)}>
          <option value={FontFamily.Monospace}>Monospace</option>
          <option value={FontFamily.Serif}>Serif</option>
          <option value={FontFamily.SansSerif}>Sans Serif</option>
          <option value={FontFamily.Journal}>Journal</option>
        </select>
      </div>

      <div style={{ margin: "0.2em 0.5em", display: "inline-block" }}>
        <label htmlFor="fontSize" style={{ marginRight: "0.5em" }}>Font Size</label>

        <select id="fontSize" ref={fontSizeRef} defaultValue={props.layer.fontSize} onChange={() => props.setDirty(props.index)}>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>
          <option value="11">11</option>
          <option value="12">12</option>
          <option value="14">14</option>
          <option value="18">18</option>
          <option value="24">24</option>
          <option value="30">30</option>
          <option value="36">36</option>
          <option value="48">48</option>
          <option value="60">60</option>
          <option value="72">72</option>
          <option value="96">96</option>
        </select>
      </div>
    </div>

    <div className={`button action${props.layer.isDirty !== undefined && props.layer.isDirty ? " active" : ""}`} onClick={() => {
      const layer = props.layer;

      if (textRef.current !== null) {
        layer.shownText = textRef.current.value;
        layer.hiddenText = textRef.current.value;
      }

      if (textColorRef.current !== null)
        layer.textColor = textColorRef.current.value;

      if (textBackgroundColorRef.current !== null)
        layer.backgroundColor = textBackgroundColorRef.current.value;

      if (fontFamilyRef.current !== null) {
        switch (fontFamilyRef.current.value) {
          case FontFamily.SansSerif:
            layer.fontFamily = FontFamily.SansSerif;
            break;
          case FontFamily.Serif:
            layer.fontFamily = FontFamily.Serif;
            break;
          case FontFamily.Journal:
            layer.fontFamily = FontFamily.Journal;
            break;
          case FontFamily.Monospace:
          default:
            layer.fontFamily = FontFamily.Monospace;
            break;
        }
      }

      if (xPositionRef.current !== null) {
        if (isNaN(Number(xPositionRef.current.value)))
          layer.horizontalPosition = -1;
        else
          layer.horizontalPosition = Number(xPositionRef.current.value);
      }

      if (yPositionRef.current !== null) {
        if (isNaN(Number(yPositionRef.current.value)))
          layer.verticalPosition = -1;
        else
          layer.verticalPosition = Number(yPositionRef.current.value);
      }

      if (xAlignmentRef.current !== null) {
        if (isNaN(Number(xAlignmentRef.current.value)))
          layer.horizontalAlignment = -1;
        else
          layer.horizontalAlignment = Number(xAlignmentRef.current.value);
      }

      if (yAlignmentRef.current !== null) {
        if (isNaN(Number(yAlignmentRef.current.value)))
          layer.verticalAlignment = -1;
        else
          layer.verticalAlignment = Number(yAlignmentRef.current.value);
      }

      if (rotationRef.current !== null) {
        if (isNaN(Number(rotationRef.current.value)))
          layer.rotation = -1;
        else
          layer.rotation = Number(rotationRef.current.value);
      }

      if (fontSizeRef.current !== null) {
        layer.fontSize = Number(fontSizeRef.current.value);
      }

      props.updateLayer(layer, props.index);
    }}>
      Save
    </div>

    <div className="button action active" onClick={() => props.deleteLayer(props.index)}>
      Delete
    </div>
  </div>;
}

const LayersToolComponent: React.StatelessComponent<LayersToolComponentProps> = (props) => {
  const isValid: boolean = props.layers.every((layer: Layer) => {
    if (layer.deleted)
      return true;
    if (layer.horizontalPosition == undefined || layer.horizontalPosition < 0 || layer.horizontalPosition > 1)
      return false;
    if (layer.verticalPosition == undefined || layer.verticalPosition < 0 || layer.verticalPosition > 1)
      return false;
    if (layer.horizontalAlignment == undefined || layer.horizontalAlignment < 0 || layer.horizontalAlignment > 1)
      return false;
    if (layer.verticalAlignment == undefined || layer.verticalAlignment < 0 || layer.verticalAlignment > 1)
      return false;
    if (layer.rotation == undefined || layer.rotation < -360 || layer.rotation > 360)
      return false;
    if (layer.fontSize == undefined || layer.fontSize < 8 || layer.fontSize > 96)
      return false;
    if (layer.isDirty)
      return false;
    return true;
  });

  const children: JSX.Element[] = [];

  const updateLayer = (layer: Layer, index: number) => {
    const layers = props.layers;

    layers[index] = layer;
    layers[index].isDirty = false;

    props.updateLayers(layers);
  }

  const deleteLayer = (index: number) => {
    const layers = props.layers;

    layers[index].deleted = true;

    props.updateLayers(layers);
  }

  const setDirty = (index: number) => {
    const layers = props.layers;

    layers[index].isDirty = true;

    props.updateLayers(layers);
  }

  props.layers.map((layer: Layer, index: number) => {
    if (!layer.deleted)
      children.push(<LayerComponent
        key={`updateThings${index}`}
        index={index}
        layer={layer}
        setDirty={setDirty}
        updateLayer={updateLayer}
        deleteLayer={deleteLayer}
      />);
  });

  children.push(<div className="component" key="addText">
    <div className="button action active" onClick={() => {
      var layers = props.layers;

      layers.push({ ...DefaultNewLayer });

      props.updateLayers(layers);
    }}>Add Text</div>
  </div>);

  children.push(<div className="component" key="updateImage">
    <div className={`button action${isValid ? " active" : ""}`} onClick={isValid ? props.updateImage : () => { }}>Update Image</div>
  </div>);

  children.push(<div className="component">
    <img src={props.previewURL} style={{ marginBottom: "0.5em", width: "100%" }} />
  </div>);

  const layers: JSX.Element[] = [];

  props.layers.map((layer: Layer, index: number) => {
    if (!layer.deleted) {
      let fontFamily = "FontFamily.Monospace";

      switch (layer.fontFamily) {
        case FontFamily.SansSerif:
          fontFamily = "FontFamily.SansSerif";
          break;
        case FontFamily.Serif:
          fontFamily = "FontFamily.Serif";
          break;
        case FontFamily.Journal:
          layer.fontFamily = FontFamily.Journal;
          break;
        case FontFamily.Monospace:
        default:
          fontFamily = "FontFamily.Monospace";
          break;
      }

      layers.push(<div>
        <div>{`\u00a0\u00a0{`}</div>
        <div>{`\u00a0\u00a0\u00a0\u00a0layerType: LayerType.Phrase,`}</div>
        <div>{`\u00a0\u00a0\u00a0\u00a0isVisible: false,`}</div>
        <div>{`\u00a0\u00a0\u00a0\u00a0backgroundColor: "${layer.backgroundColor!.toLowerCase()}",`}</div>
        <div>{`\u00a0\u00a0\u00a0\u00a0textColor: "${layer.textColor!.toLowerCase()}",`}</div>
        <div>{`\u00a0\u00a0\u00a0\u00a0horizontalPosition: ${layer.horizontalPosition},`}</div>
        <div>{`\u00a0\u00a0\u00a0\u00a0verticalPosition: ${layer.verticalPosition},`}</div>
        <div>{`\u00a0\u00a0\u00a0\u00a0horizontalAlignment: ${layer.horizontalAlignment},`}</div>
        <div>{`\u00a0\u00a0\u00a0\u00a0verticalAlignment: ${layer.verticalAlignment},`}</div>
        <div>{`\u00a0\u00a0\u00a0\u00a0fontSize: ${layer.fontSize},`}</div>
        <div>{`\u00a0\u00a0\u00a0\u00a0fontFamily: ${fontFamily},`}</div>
        <div>{`\u00a0\u00a0\u00a0\u00a0maximumLength: ${layer.shownText!.length},`}</div>
        <div>{`\u00a0\u00a0\u00a0\u00a0rotation: ${layer.rotation},`}</div>
        <div>{`\u00a0\u00a0}${index < props.layers.length - 1 ? "," : ""}`}</div>
      </div>);
    }
  });

  children.push(<div style={{ fontFamily: "monospace", backgroundColor: "#bdf", marginBottom: "0.5em" }}>
    <div>[</div>
    {layers}
    <div>]</div>
    </div>);

  return <ComponentContainer
    navigationButtons={props.navigationButtons}
    children={children}
    contents={props.contents}
    loadingState={props.loadingState}
    title={props.layersToolTitle}
  />;
}

export const isLayersToolComponent = (object: ComponentProps): object is LayersToolComponentProps => {
  return "layersToolTitle" in object;
}

export { LayersToolComponent }
