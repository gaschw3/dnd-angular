import { HelperService } from "../shared/helpers/helper.service";

export interface IBackground {
  name: string;
  id: string;
  source: string;
  image: string;
  skill: string;
  tool: string;
  feat: string;
  info: string;
  entries: any[];
}

export class Background implements IBackground {
  name: string;
  id: string;
  source: string;
  image: string;
  skill: string;
  tool: string;
  feat: string;
  info: string;
  entries: any[];

  constructor (bgJson) {
    this.name = bgJson.name;
    this.id = HelperService.createIdFromName(bgJson.name);
    this.source = bgJson.source;
    this.image = bgJson.image;
    this.skill = bgJson.skill;
    this.tool = bgJson.tool;
    this.feat = bgJson.feat;
    this.info = bgJson.info;
    this.entries = bgJson.entries;
  }
}