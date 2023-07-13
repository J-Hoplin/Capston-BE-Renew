import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { CommonEntity } from '../common.abstract';
import { InstructorEntity } from '@domain/instructor/instructor.entity';
import { StudentEntity } from '@domain/student/student.entity';
import { member } from '@src/infrastructure/types';
import { ApiProperty } from '@nestjs/swagger';
import { ClassStudentEntity } from '@domain/class_student/class-student.entity';

@Entity('class')
@Unique('class_division', ['name', 'divisionNumber'])
export class ClassEntity extends CommonEntity {
  @Column({
    type: Number,
    nullable: false,
  })
  @ApiProperty()
  divisionNumber: number;

  @Column({
    type: Number,
    nullable: false,
  })
  @ApiProperty()
  maximum_student: number;

  @Column({
    type: String,
    nullable: false,
  })
  @ApiProperty()
  repositoryEndpoit: string;

  @ManyToOne(() => InstructorEntity, (instructor) => instructor.classes, {
    cascade: true,
  })
  @JoinColumn({
    name: 'instructor_id',
  })
  @ApiProperty()
  instructor: InstructorEntity;

  @OneToMany(() => ClassStudentEntity, (cs) => cs.classes)
  @ApiProperty()
  classstudent: ClassStudentEntity[];
}
