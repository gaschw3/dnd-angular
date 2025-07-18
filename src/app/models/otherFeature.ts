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
    ability?:      any[];
    level?:        Level;
    item?:         string[];
    feature?:      string[];
    patron?:       string;
    otherSummary?: string;
}

interface Level {
    level:     number;
    class?:     Class;
    subclass?: Class;
}

export interface Class {
    name: string;
}

export const featureType = {
    //"AI": "Artificer Infusion",
    //"AS": "Arcane Shot",
    "EI": "Eldritch Invocation",
    "FS": "Fighting Style",
    "MM": "Metamagic",
    "MV": "Battlemaster Maneuver",
    "EX": "Tactical Exploit",
    "SP": "Scholarly Pursuit"
    //"RN": "Rune Knight Rune",
    //"DM": "Dragonmark"
}