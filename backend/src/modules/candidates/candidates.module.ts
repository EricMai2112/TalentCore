import { Module } from '@nestjs/common';
import { CandidateController } from './controllers/candidates.controller';
import { CandidateService } from './services/candidates.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Candidate, CandidateSchema } from './schema/candidate.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { AuthModule } from '../auth/auth.module';
import { CvParserService } from './services/cv-parser.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Candidate.name, schema: CandidateSchema },
            { name: User.name, schema: UserSchema },
        ]),
        AuthModule,
    ],
    controllers: [CandidateController],
    providers: [CandidateService, CvParserService],
    exports: [
        MongooseModule.forFeature([
            { name: Candidate.name, schema: CandidateSchema },
        ]),
    ],
})
export class CandidatesModule {}
