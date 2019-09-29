import { ClassFeature } from './class-feature';
import { Proficiency } from './proficiency';

export class Class {
  name: string;
  id: string;
  description: string;
  hd: number;
  stat: string;
  proficiencies: Proficiency[];
  equipment: Equipment;
  
  features: ClassFeature[];

  levelWidths: string[];
  levelTable: Level[];
}

export class Level {
  data: string[];
}

export class Equipment {
  default: string[];
  alt: string;
}