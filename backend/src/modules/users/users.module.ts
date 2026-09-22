import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { User, UserSchema } from './schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailTemplateModule } from '../email-template/email-template.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    EmailTemplateModule,
  ],
  exports: [UserService],
  controllers: [UserController],
  providers: [UserService],
})
export class UsersModule {}
