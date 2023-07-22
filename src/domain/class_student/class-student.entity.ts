import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
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
  students: Relation<StudentEntity>;

  @ManyToOne(() => ClassEntity, (cls) => cls.classtudent)
  @JoinColumn([
    {
      name: 'class_name',
    },
  ])
  classes: Relation<ClassEntity>;
  constructor(data: Partial<ClassStudentEntity>) {
    Object.assign(this, data);
  }
}
