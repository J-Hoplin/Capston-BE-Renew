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

@Entity('class')
export class ClassEntity extends CommonEntity {
  @Column({
    type: Number,
    nullable: false,
  })
  maximum_student: number;

  @ManyToOne(() => InstructorEntity, (instructor) => instructor.classes)
  @JoinColumn({
    name: 'instructor_id',
  })
  instructor: InstructorEntity;

  @ManyToMany(() => StudentEntity)
  students: StudentEntity[];
}
