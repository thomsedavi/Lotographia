import { ImageFloat } from "../common/Enums";

class OptionGroup {
  label: string;
  options: SelectOption[];

  constructor(label: string, options: SelectOption[]) {
    this.label = label;
    this.options = options;
  }
}

class SelectOption {
  id: string;
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

class CustomSelectOption extends SelectOption {
  description?: string;
  float?: ImageFloat;
  objectUrl?: string;

  constructor(id: string, name: string, description?: string, float?: ImageFloat, objectUrl?: string) {
    super(id, name);

    this.description = description;
    this.float = float;
    this.objectUrl = objectUrl;
  }
}

export { CustomSelectOption, SelectOption, OptionGroup }
