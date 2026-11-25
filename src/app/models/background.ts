import { HelperService } from "../shared/helpers/helper.service";
import { ChangeType, normalizeChangeType } from "../shared/change-badge/change-badge.component";

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
  change?: ChangeType;
  changeNote?: string;
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
  change?: ChangeType;
  changeNote?: string;

  constructor (bgJson: any) {
    this.name = bgJson.name;
    this.id = HelperService.createIdFromName(bgJson.name);
    this.source = bgJson.source;
    this.image = bgJson.image;
    this.skill = bgJson.skill;
    this.tool = bgJson.tool;
    this.feat = bgJson.feat;
    this.info = bgJson.info;
    this.entries = bgJson.entries;
    this.change = normalizeChangeType(bgJson.change);
    this.changeNote = bgJson.changeNote;
  }
}