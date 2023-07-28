import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
} from 'typeorm';
import { CommonEntity } from '../common.abstract';
import { InstructorEntity } from '@domain/instructor/instructor.entity';
import { StudentEntity } from '@domain/student/student.entity';
import { classImg, member } from '@src/infrastructure/types';
import { ApiProperty } from '@nestjs/swagger';
import { ClassStudentEntity } from '@domain/class_student/class-student.entity';
import { ClassImageEntiy } from '../class-image/classimage.entity';

@Entity('class')
@Unique('instructor_class', ['name', 'instructor'])
export class ClassEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({
    type: String,
    nullable: false,
    unique: true,
  })
  @ApiProperty()
  name: string;

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
  departmentId: number;

  @ApiProperty()
  @ManyToOne(() => ClassImageEntiy, (img) => img.classes)
  @JoinColumn({
    name: 'class_container_image_id',
  })
  class_image: Relation<ClassImageEntiy>;

  @ApiProperty()
  @OneToMany(() => ClassStudentEntity, (cs) => cs.classes)
  classtudent: ClassStudentEntity[];

  @ManyToOne(() => InstructorEntity, (instructor) => instructor.classes, {
    cascade: true,
  })
  @JoinColumn({
    name: 'instructor_id',
  })
  @ApiProperty()
  instructor: Relation<InstructorEntity>;

  constructor(data: Partial<ClassEntity>) {
    Object.assign(this, data);
  }
}
