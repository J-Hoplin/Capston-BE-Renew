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
import { ApiProperty } from '@nestjs/swagger';

@Entity('department')
export class DepartmentEntity extends CommonEntity {
  @Column({
    type: String,
    nullable: true,
  })
  @ApiProperty()
  phoneNumber: string;

  @Column({
    type: String,
    nullable: true,
  })
  @ApiProperty()
  url: string;

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updatedAt: Date;

  @OneToMany(() => StudentEntity, (student) => student.department)
  @ApiProperty()
  students: StudentEntity | StudentEntity[];

  @OneToMany(() => InstructorEntity, (instructor) => instructor.department)
  @ApiProperty()
  instructors: InstructorEntity | InstructorEntity[];
}
