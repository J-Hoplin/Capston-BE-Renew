import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { CommonEntity } from '../common.abstract';
import { InstructorEntity } from '@domain/instructor/instructor.entity';
import { StudentEntity } from '@domain/student/student.entity';
import { member } from '@src/infrastructure/types';
import { ApiProperty } from '@nestjs/swagger';

@Entity('class')
export class ClassEntity extends CommonEntity {
  @Column({
    type: Number,
    nullable: false,
  })
  @ApiProperty()
  maximum_student: number;

  @ManyToOne(() => InstructorEntity, (instructor) => instructor.classes, {
    cascade: true,
  })
  @JoinColumn({
    name: 'instructor_id',
  })
  @ApiProperty()
  instructor: InstructorEntity;

  @ManyToMany(() => StudentEntity)
  @ApiProperty()
  students: StudentEntity[];
}
