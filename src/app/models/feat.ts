export interface Feat {
  name:          string;
  id:            string;
  source:        Source;
  asi?:          string;
  text:          Text;
  prerequisite?: string;
}

interface Text {
  description:       string;
  benefits?:         string[];
  extraDescription?: string;
  extras?:           string[];
  multipleSelect?:   string;
}

enum Source {
    Brew = "BREW",
    Phb = "PHB",
    PurplePHB = "PHB-",
    SourcePHB = "PHB+",
    Tce = "TCE",
}