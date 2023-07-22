import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { StudentEntity } from '@domain/student/student.entity';
import { ClassEntity } from '@domain/class/class.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('student_class')
export class ClassStudentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => StudentEntity, (student) => student.classstudent)
  @JoinColumn({
    name: 'student_gid',
  })
  students: string;

  @ManyToOne(() => ClassEntity, (cls) => cls.classtudent)
  @JoinColumn([
    {
      name: 'class_name',
    },
  ])
  classes: number;
  constructor(data: Partial<ClassStudentEntity>) {
    Object.assign(this, data);
  }
}
