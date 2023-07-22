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
import { classImg, member } from '@src/infrastructure/types';
import { ApiProperty } from '@nestjs/swagger';
import { ClassStudentEntity } from '@domain/class_student/class-student.entity';
import { ClassImageEntiy } from '../class-image/classimage.entity';

@Entity('class')
@Unique('instructor_class', ['name', 'instructorId'])
export class ClassEntity extends CommonEntity {
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
  instructorId: number;

  @Column({
    type: String,
    nullable: false,
  })
  @ApiProperty()
  departmentId: number;

  @Column({
    type: 'enum',
    enum: classImg.status,
    default: classImg.status.PENDING,
  })
  @ApiProperty({
    enum: classImg.status,
  })
  status: classImg.status;

  @ApiProperty()
  @ManyToOne(() => ClassImageEntiy, (img) => img.classes)
  @JoinColumn({
    name: 'class_container_image_id',
  })
  class_image: number;

  @ApiProperty()
  @OneToMany(() => ClassStudentEntity, (cs) => cs.classes, {
    cascade: true,
  })
  classtudent: ClassStudentEntity[];

  constructor(data: Partial<ClassEntity>) {
    super();
    Object.assign(this, data);
  }
}
