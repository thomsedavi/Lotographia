enum ImageFloat {
  Left = "left",
  Right = "right"
}

class Option {
  description?: string;
  float?: ImageFloat;
  id: string;
  name?: string;
  objectUrl?: string;

  constructor(id: string, description?: string, float?: ImageFloat, name?: string, objectUrl?: string) {
    this.id = id;
    this.description = description;
    this.float = float;
    this.name = name;
    this.objectUrl = objectUrl;
  }
}

export { ImageFloat, Option }
