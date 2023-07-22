import { MemberEntity } from '@src/domain/member/member.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { DepartmentEntity } from '@domain/department/department.entity';
import { ClassEntity } from '@domain/class/class.entity';
import { member } from '@src/infrastructure/types';
import { ClassStudentEntity } from '@domain/class_student/class-student.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('student')
export class StudentEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({
    type: String,
    unique: true,
  })
  @ApiProperty()
  groupId: string;

  @ManyToOne(() => DepartmentEntity, (department) => department.students, {
    cascade: ['update', 'insert'],
  })
  @JoinColumn({
    name: 'department_id',
  })
  @ApiProperty()
  department: Relation<DepartmentEntity>;

  @OneToMany(() => ClassStudentEntity, (cs) => cs.students)
  classstudent: ClassStudentEntity[];

  constructor(data: Partial<StudentEntity>) {
    Object.assign(this, data);
  }
}
