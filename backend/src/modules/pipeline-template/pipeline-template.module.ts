import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PipelineTemplate,
  PipelineTemplateSchema,
} from './schemas/pipeline-template.schema';
import { PipelineTemplateService } from './services/pipeline-template.service';
import { PipelineTemplateController } from './controllers/pipeline-template.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PipelineTemplate.name, schema: PipelineTemplateSchema },
    ]),
  ],
  controllers: [PipelineTemplateController],
  providers: [PipelineTemplateService],
  exports: [PipelineTemplateService],
})
export class PipelineTemplateModule {}
