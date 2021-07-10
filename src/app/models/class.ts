import { ClassFeature } from './class-feature';
import { Proficiency } from './proficiency';

export interface Class {
  name: string;
  id: string;
  description: string;
  hd: number;
  stat: string;
  multiclassing: Multiclass;
  proficiencies: Proficiency;
  equipment: Equipment;
  
  features: ClassFeature[];

  levelWidths: string[];
  levelTable: string[][];
}

interface Equipment {
  default: string[];
  alt: string;
}

export interface Multiclass {
  armor: string;
  weapons: string;
  tools: string;
  minScore: string;
  skills: string;
}