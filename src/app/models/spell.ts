export interface Spell {
  name:       string;
  id:         string;
  source:     Source;
  level:      string;
  school:     School;
  time:       string;
  range:      string;
  components: string;
  duration:   string;
  classes:    string[];
  entries:    string[];
  higher?:    string;
  ritual?:    string;
  roll?:      string[] | string;
}

export enum School {
    Abjuration = "Abjuration",
    Conjuration = "Conjuration",
    Divination = "Divination",
    Enchantment = "Enchantment",
    Evocation = "Evocation",
    Illusion = "Illusion",
    Necromancy = "Necromancy",
    Transmutation = "Transmutation",
}

export enum Source {
    Brew = "BREW",
    Phb = "PHB",
    Scag = "SCAG",
    Tce = "TCE",
    Ua = "UA",
    Xge = "XGE",
}