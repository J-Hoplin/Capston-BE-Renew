import { Module } from '@nestjs/common';
import { ClassImageController } from './class-image.controller';
import { ClassImageService } from './class-image.service';
import { InstructorModule } from '../instructor/instructor.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassImageEntiy } from '@src/domain/class-image/classimage.entity';
import { LoggerModule } from '@hoplin/nestjs-logger';
import { MemberModule } from '../member/member.module';

@Module({
  imports: [
    LoggerModule.forFeature(),
    TypeOrmModule.forFeature([ClassImageEntiy]),
    MemberModule,
  ],
  controllers: [ClassImageController],
  providers: [ClassImageService],
  exports: [ClassImageService],
})
export class ClassImageModule {}
