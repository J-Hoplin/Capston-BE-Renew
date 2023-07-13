import { MemberEntity } from '@src/domain/member/member.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
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

  // 학생 고유번호
  @Column({
    type: String,
    nullable: false,
    unique: true,
  })
  @ApiProperty()
  groupId: string;

  @ManyToOne(() => DepartmentEntity, (department) => department.students, {
    cascade: true,
  })
  @JoinColumn({
    name: 'department_id',
  })
  @ApiProperty()
  department: DepartmentEntity;

  @OneToMany(() => ClassStudentEntity, (cs) => cs.students)
  classstudent: ClassStudentEntity[];
}
