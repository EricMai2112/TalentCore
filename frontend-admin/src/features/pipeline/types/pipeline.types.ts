export interface Stage {
  _id?: string;
  name: string;
  order: number;
  color: string;
}

export interface PipelineTemplate {
  _id: string;
  name: string;
  stages: Stage[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePipelineTemplateDto {
  name: string;
  stages: Omit<Stage, "_id">[];
}

export interface UpdatePipelineTemplateDto {
  name?: string;
  stages?: Omit<Stage, "_id">[];
}
