export interface OtherFeature {
    name:                   string;
    source:                 string;
    page:                   number;
    featureType:            string[];
    entries:                string[];
    prerequisite?:          Prerequisite[];
    isClassFeatureVariant?: boolean;
}

export interface Prerequisite {
    spell?:        string;
    pact?:         string;
    level?:        Level;
    item?:         string[];
    patron?:       string;
    otherSummary?: string;
}

interface Level {
    level:     number;
    class:     Class;
    subclass?: Class;
}

export interface Class {
    name: string;
}

export const featureType = {
    "AI": "Artificer Infusion",
    "AS": "Arcane Shot",
    "ED": "Elemental Discipline",
    "ED:B": "Elemental Discipline Rebrewed",
    "EI": "Eldritch Invocation",
    "FS": "Fighting Style",
    "MM": "Metamagic",
    "MV": "Battlemaster Maneuver",
    "RN": "Rune Knight Rune",
    "DM": "Dragonmark"
}