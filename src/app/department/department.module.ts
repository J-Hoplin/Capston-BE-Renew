import { Module } from '@nestjs/common';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { LoggerModule } from '@hoplin/nestjs-logger';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentEntity } from '@src/domain/department/department.entity';

@Module({
  imports: [
    LoggerModule.forFeature(),
    TypeOrmModule.forFeature([DepartmentEntity]),
  ],
  controllers: [DepartmentController],
  providers: [DepartmentService],
  exports: [DepartmentService],
})
export class DepartmentModule {}
