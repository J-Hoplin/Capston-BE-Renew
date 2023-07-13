import { MemberEntity } from '@src/domain/member/member.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DepartmentEntity } from '@domain/department/department.entity';
import { ClassEntity } from '@domain/class/class.entity';
import { member } from '@src/infrastructure/types';
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
  })
  @ApiProperty()
  studentNumber: string;

  // Static Role Binding
  @Column({
    type: String,
    default: member.Role.STUDENT,
  })
  @ApiProperty()
  role: member.Role.STUDENT;

  @ManyToOne(() => DepartmentEntity, (department) => department.students, {
    cascade: true,
  })
  @JoinColumn({
    name: 'department_id',
  })
  @ApiProperty()
  department: DepartmentEntity;

  @ManyToMany(() => ClassEntity, {
    cascade: true,
  })
  @JoinTable()
  @ApiProperty()
  classes: ClassEntity[];
}
