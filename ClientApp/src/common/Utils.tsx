import { ProcessedTextsState, GetProcessedTextsBody } from "../common/Interfaces";

const colourCharacters = "0123456789abcdef";

export const getFileImageObjectURL = (body: string, callback: (objectURL: string) => void) => {
  fetch("SingleImage/DownloadImageFile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: body
  })
    .then(response => response.blob())
    .then(blob => URL.createObjectURL(blob))
    .then(objectURL => callback(objectURL));
}

export const getProcessedImageObjectURL = (body: string, callback: (objectURL: string) => void) => {
  fetch("SingleImage/DownloadImage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: body
  })
    .then(response => response.blob())
    .then(blob => URL.createObjectURL(blob))
    .then(objectURL => callback(objectURL));
}

export const getProcessedTexts = (body: GetProcessedTextsBody, callback: (json: ProcessedTextsState) => void) => {
  fetch("SingleImage/GetProcessedTexts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  })
    .then(response => response.json())
    .then(json => callback(json));
}

export const isValidColour = (colour: string | undefined) => {
  if (colour == undefined)
    return false;

  if (colour.toLowerCase() === "none")
    return true;

  if (colour.length !== 4 && colour.length !== 7 && colour[0] ==="#")
    return false;

  if (colour.length === 7) {
    if (colourCharacters.indexOf(colour[4].toLowerCase()) < 0 ||
      colourCharacters.indexOf(colour[5].toLowerCase()) < 0 ||
      colourCharacters.indexOf(colour[6].toLowerCase()) < 0)
      return false
  }

  if (colour.length === 4 || colour.length === 7) {
    if (colourCharacters.indexOf(colour[1].toLowerCase()) < 0 ||
      colourCharacters.indexOf(colour[2].toLowerCase()) < 0 ||
      colourCharacters.indexOf(colour[3].toLowerCase()) < 0)
      return false
  }

  return true;
}
