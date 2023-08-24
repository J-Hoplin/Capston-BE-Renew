import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { StudentEntity } from '@domain/student/student.entity';
import { CommonEntity } from '../common.abstract';
import { InstructorEntity } from '@domain/instructor/instructor.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

@Entity('department')
export class DepartmentEntity extends CommonEntity {
  @Column({
    type: String,
    nullable: false,
    unique: true,
  })
  @ApiProperty()
  name!: string;

  @Column({
    type: String,
    nullable: true,
  })
  @ApiProperty()
  @IsOptional()
  phoneNumber: string;

  @Column({
    type: String,
    nullable: true,
  })
  @ApiProperty()
  @IsOptional()
  url: string;

  @Column({
    type: String,
    nullable: true,
  })
  @ApiProperty()
  @IsOptional()
  departmentProfileURL: string;

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updatedAt: Date;

  @OneToMany(() => StudentEntity, (student) => student.department)
  @ApiProperty()
  students: Relation<StudentEntity>[];

  @OneToMany(() => InstructorEntity, (instructor) => instructor.department)
  @ApiProperty()
  instructors: Relation<InstructorEntity>[];

  constructor(data: Partial<DepartmentEntity>) {
    super();
    Object.assign(this, data);
  }
}
