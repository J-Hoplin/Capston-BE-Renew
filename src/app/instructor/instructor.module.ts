import { Module } from '@nestjs/common';
import { InstructorController } from './instructor.controller';
import { InstructorService } from './instructor.service';
import { LoggerModule } from '@hoplin/nestjs-logger';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstructorEntity } from '@src/domain/instructor/instructor.entity';

@Module({
  imports: [
    LoggerModule.forFeature(),
    TypeOrmModule.forFeature([InstructorEntity]),
  ],
  controllers: [InstructorController],
  providers: [InstructorService],
  exports: [InstructorService],
})
export class InstructorModule {}
