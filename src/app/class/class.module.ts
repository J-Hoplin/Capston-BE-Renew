import { Module } from '@nestjs/common';
import { ClassService } from './class.service';
import { ClassController } from './class.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassEntity } from '@src/domain/class/class.entity';
import { LoggerModule } from '@hoplin/nestjs-logger';
import { InstructorModule } from '../instructor/instructor.module';
import { DepartmentModule } from '../department/department.module';
import { ClassImageModule } from '../class-image/class-image.module';
import { MemberModule } from '../member/member.module';

@Module({
  imports: [
    LoggerModule.forFeature(),
    TypeOrmModule.forFeature([ClassEntity]),
    MemberModule,
    DepartmentModule,
    ClassImageModule,
  ],
  providers: [ClassService],
  controllers: [ClassController],
})
export class ClassModule {}
