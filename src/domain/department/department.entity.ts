import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StudentEntity } from '@domain/student/student.entity';
import { CommonEntity } from '../common.abstract';
import { InstructorEntity } from '@domain/instructor/instructor.entity';

@Entity('department')
export class DepartmentEntity extends CommonEntity {
  @Column({
    type: String,
    nullable: true,
  })
  phonenumber: string;

  @Column({
    type: String,
    nullable: true,
  })
  url: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => StudentEntity, (student) => student.department)
  students: StudentEntity | StudentEntity[];

  @OneToMany(() => InstructorEntity, (instructor) => instructor.department)
  instructors: InstructorEntity | InstructorEntity[];
}
