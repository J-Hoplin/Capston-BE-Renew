import { Module } from '@nestjs/common';
import { ClassImageController } from './class-image.controller';
import { ClassImageService } from './class-image.service';
import { InstructorModule } from '../instructor/instructor.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassImageEntiy } from '@src/domain/class-image/classimage.entity';
import { LoggerModule } from '@hoplin/nestjs-logger';
import { InstructorEntity } from '@src/domain/instructor/instructor.entity';

@Module({
  imports: [
    LoggerModule.forFeature(),
    TypeOrmModule.forFeature([ClassImageEntiy]),
    InstructorModule,
  ],
  controllers: [ClassImageController],
  providers: [ClassImageService],
  exports: [ClassImageService],
})
export class ClassImageModule {}
