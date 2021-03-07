export class Feat {
  name: string;
  asi: String;
  id: string;
  source: string;
  text: Text;
  prerequisite: string;
}

class Text {
  description: string;
  benefits: string[];
  extraDescription: string;
  extras: string[];
  multipleSelect: string;
}
