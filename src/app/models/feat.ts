export class Feat {
  name: string;
  id: string;
  source: string;
  text: Text;

}

class Text {
  description: string;
  benefits: string[];
  extraDescription: string;
  extras: string[];
  multipleSelect: string;
}
