const getFileImageObjectURL = (body: string, callback: (objectURL: string) => void) => {
  fetch("SingleImage/DownloadImageFile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: body
  })
    .then(response => {
      response.blob().then(blob => {
        callback(URL.createObjectURL(blob));
      });
    });
}

const getSingleImageObjectURL = (body: string, callback: (objectURL: string) => void) => {
  fetch("SingleImage/DownloadImage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: body
  })
    .then(response => {
      response.blob().then(blob => {
        callback(URL.createObjectURL(blob));
      });
    });
}

export { getFileImageObjectURL, getSingleImageObjectURL }
