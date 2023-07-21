import { Module } from '@nestjs/common';
import { InstructorController } from './instructor.controller';
import { InstructorService } from './instructor.service';
import { LoggerModule } from '@hoplin/nestjs-logger';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstructorEntity } from '@src/domain/instructor/instructor.entity';
import { DepartmentEntity } from '@src/domain/department/department.entity';
import { ClassImageEntiy } from '@src/domain/class-image/classimage.entity';
import { ClassEntity } from '@src/domain/class/class.entity';
import { DepartmentModule } from '../department/department.module';

@Module({
  imports: [
    LoggerModule.forFeature(),
    TypeOrmModule.forFeature([InstructorEntity]),
    DepartmentModule,
  ],
  controllers: [InstructorController],
  providers: [InstructorService],
  exports: [InstructorService],
})
export class InstructorModule {}
