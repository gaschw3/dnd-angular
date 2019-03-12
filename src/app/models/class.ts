import { ClassFeature } from './class-feature';

export class Class {
  name: string;
  id: string;
  description: string;
  hd: number;
  proficiencies: string[];
  equipment: string[];
  
  features: ClassFeature[];

  levelColumns: number;
  levelHeaders: string[];
  levelTable: Level[];
}

export class Level {
  data: string[];
}