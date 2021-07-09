import { Trait } from "./trait";

export interface Ancestry {
  name: string;
  id: string;
  speed: string;
  size: string;
  ability: string;
  source: string;
  proficiency: string;
  traits: Trait[];
}
