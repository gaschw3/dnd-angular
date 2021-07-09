import { Trait } from "./trait";

export interface Background {
  name: string;
  id: string;
  source: string;
  skillProfs: string;
  otherProfs: string;
  traits: Trait[];
}
